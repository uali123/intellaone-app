import { Express, Request, Response } from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { isAuthenticated } from "./ai";
import { storage } from "./storage";
import { db } from "./db";
import { aiDrafts, campaigns, assets } from "../shared/schema";
import { sql } from "drizzle-orm";
import csvParser from "csv-parser";
import xlsx from "xlsx";
import { Readable } from "stream";
import multer from "multer";
import util from "util";

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure upload directories exist
const uploadDir = path.join(__dirname, '../temp/uploads');
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Setup routes for IntellaOne model customization
 * This allows admins to train specialized marketing models using
 * the platform's data, improving the quality of agent outputs
 */
export function setupModelCustomizationRoutes(app: Express) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir); // Use the predefined uploadDir
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });

  // Middleware to check if user is admin (TEMPORARILY ALLOWING ALL USERS FOR TESTING)
  const isAdmin = (req: Request, res: Response, next: any) => {
    // Temporarily allowing all users for testing
    return next();
    
    // Original code:
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    // // @ts-ignore
    // const user = req.user;
    // if (user && user.role === 'admin') {
    //   return next();
    // }
    
    // res.status(403).json({ message: "Admin access required" });
  };

  // Admin: Get status of IntellaOne model customization
  app.get("/api/admin/model/status", isAdmin, async (req, res) => {
    try {
      // First check if we have a custom fine-tuned model already
      const jobs = await openai.fineTuning.jobs.list({ limit: 10 });
      
      // Get the most recent completed job
      const latestJob = jobs.data
        .filter(job => job.status === "succeeded")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      // Get training statistics
      const stats = await getTrainingDataStats();
      
      res.json({
        hasCustomModel: !!latestJob,
        modelId: latestJob ? latestJob.fine_tuned_model : null,
        lastTrainedAt: latestJob ? latestJob.finished_at : null,
        trainingStats: stats,
      });
    } catch (error: any) {
      console.error("Error getting model customization status:", error);
      res.status(500).json({
        message: "Error getting model customization status",
        error: error.message || "Unknown error",
      });
    }
  });

  // Admin: Start model customization process with platform data
  app.post("/api/admin/model/train", isAdmin, async (req, res) => {
    try {
      const { 
        systemPromptOverride,
        baseModel = "gpt-3.5-turbo",
        includeAiDrafts = true,
        includeCampaigns = true,
        includeAssets = true,
        splitRatio = 0.8 // 80% training, 20% validation
      } = req.body;
      
      // Step 1: Get data from the database and format it
      const formattedData = await prepareTrainingData({
        includeAiDrafts,
        includeCampaigns,
        includeAssets,
        systemPromptOverride
      });
      
      // Step 2: Split data into training and validation sets
      const totalExamples = formattedData.length;
      const trainingCount = Math.floor(totalExamples * splitRatio);
      
      // Shuffle the data and split
      const shuffled = [...formattedData].sort(() => 0.5 - Math.random());
      const trainingData = shuffled.slice(0, trainingCount);
      const validationData = shuffled.slice(trainingCount);
      
      // Step 3: Convert to JSONL format
      const trainingJSONL = convertToJSONL(trainingData);
      const validationJSONL = convertToJSONL(validationData);
      
      // Step 4: Create temporary files
      const trainingFilePath = path.join(tempDir, "intellaone_training.jsonl");
      const validationFilePath = path.join(tempDir, "intellaone_validation.jsonl");
      
      fs.writeFileSync(trainingFilePath, trainingJSONL);
      fs.writeFileSync(validationFilePath, validationJSONL);
      
      // Step 5: Upload files to OpenAI
      const trainingFile = await openai.files.create({
        file: fs.createReadStream(trainingFilePath),
        purpose: "fine-tune",
      });
      
      const validationFile = await openai.files.create({
        file: fs.createReadStream(validationFilePath),
        purpose: "fine-tune",
      });
      
      // Step 6: Create fine-tuning job
      const fineTuningJob = await openai.fineTuning.jobs.create({
        training_file: trainingFile.id,
        validation_file: validationFile.id,
        model: baseModel,
        suffix: "intellaone-marketing",
      });
      
      // Step 7: Clean up temp files
      fs.unlinkSync(trainingFilePath);
      fs.unlinkSync(validationFilePath);
      
      res.json({
        message: "Model customization started successfully",
        jobId: fineTuningJob.id,
        status: fineTuningJob.status,
        trainingExamples: trainingData.length,
        validationExamples: validationData.length,
      });
    } catch (error: any) {
      console.error("Error starting model customization:", error);
      res.status(500).json({
        message: "Error starting model customization",
        error: error.message || "Unknown error",
      });
    }
  });
  
  // Admin: Get detailed info about a fine-tuning job
  app.get("/api/admin/model/jobs/:jobId", isAdmin, async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await openai.fineTuning.jobs.retrieve(jobId);
      res.json(job);
    } catch (error: any) {
      console.error("Error retrieving fine-tuning job:", error);
      res.status(500).json({
        message: "Error retrieving fine-tuning job",
        error: error.message || "Unknown error",
      });
    }
  });

  // Admin: List all fine-tuning jobs for IntellaOne
  app.get("/api/admin/model/jobs", isAdmin, async (req, res) => {
    try {
      const jobs = await openai.fineTuning.jobs.list();
      res.json(jobs.data);
    } catch (error: any) {
      console.error("Error listing fine-tuning jobs:", error);
      res.status(500).json({
        message: "Error listing fine-tuning jobs",
        error: error.message || "Unknown error",
      });
    }
  });

  // Admin: Cancel an in-progress fine-tuning job
  app.post("/api/admin/model/jobs/:jobId/cancel", isAdmin, async (req, res) => {
    try {
      const { jobId } = req.params;
      const canceledJob = await openai.fineTuning.jobs.cancel(jobId);
      res.json(canceledJob);
    } catch (error: any) {
      console.error("Error canceling fine-tuning job:", error);
      res.status(500).json({
        message: "Error canceling fine-tuning job",
        error: error.message || "Unknown error",
      });
    }
  });

  // Get stats about available training data
  app.get("/api/admin/model/data-stats", isAdmin, async (req, res) => {
    try {
      const stats = await getTrainingDataStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting training data stats:", error);
      res.status(500).json({
        message: "Error getting training data stats",
        error: error.message || "Unknown error",
      });
    }
  });
  
  // Upload and process training data file (CSV, Excel, JSONL, etc.)
  app.post("/api/admin/model/upload-data", isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { originalname, path: filePath, mimetype } = req.file;
      console.log(`Processing uploaded file: ${originalname} (${mimetype})`);
      
      let trainingData: any[] = [];
      
      // Process different file types
      console.log(`Starting file processing for ${originalname} (${mimetype})`);
      
      try {
        if (originalname.toLowerCase().endsWith('.csv')) {
          console.log(`Processing as CSV file: ${filePath}`);
          trainingData = await processCSVFile(filePath);
          console.log(`CSV processing complete. Found ${trainingData.length} examples.`);
        } else if (originalname.toLowerCase().endsWith('.xlsx') || originalname.toLowerCase().endsWith('.xls')) {
          console.log(`Processing as Excel file: ${filePath}`);
          trainingData = await processExcelFile(filePath);
          console.log(`Excel processing complete. Found ${trainingData.length} examples.`);
        } else if (originalname.toLowerCase().endsWith('.jsonl') || originalname.toLowerCase().endsWith('.json')) {
          console.log(`Processing as JSONL/JSON file: ${filePath}`);
          trainingData = await processJSONLFile(filePath);
          console.log(`JSONL processing complete. Found ${trainingData.length} examples.`);
        } else if (originalname.toLowerCase().endsWith('.zip')) {
          // For simplicity, we'll leave ZIP processing to be implemented later
          console.log(`ZIP processing not implemented yet: ${filePath}`);
          return res.status(400).json({ message: "ZIP processing not implemented yet" });
        } else {
          console.log(`Unsupported file format: ${originalname}`);
          return res.status(400).json({ message: "Unsupported file format" });
        }
      } catch (processingError) {
        console.error(`Error during file processing:`, processingError);
        return res.status(500).json({
          message: "Error processing file data",
          error: processingError.message || "Unknown processing error",
        });
      }
      
      // Cleanup the temporary file
      fs.unlinkSync(filePath);
      
      // Return validation results and some sample data
      const sampleData = trainingData.slice(0, 3); // Get first 3 examples for preview
      
      res.json({
        message: "File processed successfully",
        filename: originalname,
        format: originalname.split('.').pop(),
        recordCount: trainingData.length,
        sampleData
      });
    } catch (error: any) {
      console.error("Error processing uploaded file:", error);
      res.status(500).json({
        message: "Error processing uploaded file",
        error: error.message || "Unknown error",
      });
    }
  });
}

/**
 * Get statistics about available training data
 */
async function getTrainingDataStats() {
  // Count available examples from different sources
  const aiDraftsCount = await db.select({ count: sql`count(*)` }).from(aiDrafts);
  const campaignsCount = await db.select({ count: sql`count(*)` }).from(campaigns);
  const assetsCount = await db.select({ count: sql`count(*)` }).from(assets);
  
  return {
    aiDrafts: parseInt(aiDraftsCount[0].count as any),
    campaigns: parseInt(campaignsCount[0].count as any),
    assets: parseInt(assetsCount[0].count as any),
    totalAvailable: parseInt(aiDraftsCount[0].count as any) + parseInt(campaignsCount[0].count as any) + parseInt(assetsCount[0].count as any),
    estimatedTokens: (parseInt(aiDraftsCount[0].count as any) * 1000) + (parseInt(campaignsCount[0].count as any) * 1500) + (parseInt(assetsCount[0].count as any) * 800),
  };
}

/**
 * Prepare training data from various sources in the application
 */
async function prepareTrainingData(options: {
  includeAiDrafts: boolean;
  includeCampaigns: boolean;
  includeAssets: boolean;
  systemPromptOverride?: string;
}): Promise<any[]> {
  const trainingData = [];
  
  // Default system prompts for each agent type
  const systemPrompts = {
    default: options.systemPromptOverride || "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies.",
    maven: "You are Maven, an expert AI marketing agent specialized in market research and competitive intelligence.",
    matrix: "You are Matrix, an expert AI marketing agent specialized in crafting compelling messaging and positioning.",
    max: "You are Max, an expert AI marketing agent specialized in generating structured marketing documents and assets.",
    motion: "You are Motion, an expert AI marketing agent specialized in campaign planning and strategy."
  };
  
  // Get AI drafts if enabled
  if (options.includeAiDrafts) {
    const drafts = await storage.listAiDrafts();
    
    for (const draft of drafts) {
      if (!draft.brief) continue;
      
      // For AI drafts, we'll use the brief as the prompt and extract any generated content
      // from the variations field if available
      let content = "";
      if (draft.variations && typeof draft.variations === 'object') {
        try {
          // Try to extract content from variations
          const variationsArray = Array.isArray(draft.variations) ? draft.variations : [draft.variations];
          if (variationsArray.length > 0 && variationsArray[0].content) {
            content = variationsArray[0].content;
          }
        } catch (e) {
          console.warn("Could not parse variations for draft:", draft.id);
          continue; // Skip this draft if we can't get content
        }
      }
      
      if (!content) continue; // Skip if no content was found
      
      // Determine which agent type based on draft type
      let systemPrompt = systemPrompts.default;
      if (draft.type === 'research') systemPrompt = systemPrompts.maven;
      if (draft.type === 'copy' || draft.type === 'message') systemPrompt = systemPrompts.matrix;
      if (draft.type === 'document') systemPrompt = systemPrompts.max;
      if (draft.type === 'campaign') systemPrompt = systemPrompts.motion;
      
      trainingData.push({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: draft.brief },
          { role: "assistant", content: content }
        ]
      });
    }
  }
  
  // Get campaign data if enabled
  if (options.includeCampaigns) {
    const campaigns = await storage.listCampaigns();
    
    for (const campaign of campaigns) {
      // Use campaign description as the source of training data if available
      if (!campaign.description) continue;
      
      trainingData.push({
        messages: [
          { role: "system", content: systemPrompts.motion },
          { role: "user", content: `Create a campaign strategy for ${campaign.name}` },
          { role: "assistant", content: campaign.description }
        ]
      });
    }
  }
  
  // Get asset data if enabled
  if (options.includeAssets) {
    const assets = await storage.listAssets();
    
    for (const asset of assets) {
      // Skip assets that don't have both description and content
      if (!asset.description || !asset.content) continue;
      
      // Create training examples based on asset type
      if (asset.type === 'copy' || asset.type === 'message') {
        trainingData.push({
          messages: [
            { role: "system", content: systemPrompts.matrix },
            { role: "user", content: `Create marketing copy based on this description: ${asset.description}` },
            { role: "assistant", content: asset.content }
          ]
        });
      } else if (asset.type === 'research') {
        trainingData.push({
          messages: [
            { role: "system", content: systemPrompts.maven },
            { role: "user", content: `Provide market research insights for: ${asset.description}` },
            { role: "assistant", content: asset.content }
          ]
        });
      } else {
        trainingData.push({
          messages: [
            { role: "system", content: systemPrompts.default },
            { role: "user", content: `Create marketing content for: ${asset.description}` },
            { role: "assistant", content: asset.content }
          ]
        });
      }
    }
  }
  
  return trainingData;
}

/**
 * Utility function to convert data to JSONL format for OpenAI fine-tuning
 */
export function convertToJSONL(data: any[]): string {
  return data.map(item => JSON.stringify({
    messages: item.messages,
  })).join('\n');
}

/**
 * Process CSV file and convert to training data format
 */
export async function processCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let rowCount = 0;
    let successfulRows = 0;
    
    console.log(`Starting CSV stream from ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`CSV file does not exist: ${filePath}`);
      return reject(new Error(`File not found: ${filePath}`));
    }
    
    try {
      const stream = fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          rowCount++;
          
          // Log the structure of the first row to help with debugging
          if (rowCount === 1) {
            console.log('First CSV row structure:', Object.keys(data));
            console.log('First CSV row data sample:', JSON.stringify(data).substring(0, 200) + '...');
          }
          
          // Check if the CSV has the expected columns
          if (data.prompt && data.completion) {
            // Simple format with prompt and completion
            results.push({
              messages: [
                { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
                { role: "user", content: data.prompt },
                { role: "assistant", content: data.completion }
              ]
            });
            successfulRows++;
          } else if (data.user && data.assistant) {
            // Alternative column names
            results.push({
              messages: [
                { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
                { role: "user", content: data.user },
                { role: "assistant", content: data.assistant }
              ]
            });
            successfulRows++;
          } else if (data.input && data.output) {
            // Another alternative format
            results.push({
              messages: [
                { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
                { role: "user", content: data.input },
                { role: "assistant", content: data.output }
              ]
            });
            successfulRows++;
          } else {
            // Try to intelligently extract the columns
            const keys = Object.keys(data);
            
            // Log every 100th row to help with debugging
            if (rowCount % 100 === 0) {
              console.log(`Processing row ${rowCount}, current keys:`, keys);
            }
            
            const userField = keys.find(k => 
              k.toLowerCase().includes('prompt') || 
              k.toLowerCase().includes('user') || 
              k.toLowerCase().includes('input') || 
              k.toLowerCase().includes('question')
            );
            
            const assistantField = keys.find(k => 
              k.toLowerCase().includes('completion') || 
              k.toLowerCase().includes('assistant') || 
              k.toLowerCase().includes('output') || 
              k.toLowerCase().includes('answer') || 
              k.toLowerCase().includes('response')
            );
            
            if (userField && assistantField && data[userField] && data[assistantField]) {
              results.push({
                messages: [
                  { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
                  { role: "user", content: data[userField] },
                  { role: "assistant", content: data[assistantField] }
                ]
              });
              successfulRows++;
            } else {
              // If we couldn't find appropriate fields, try to use any two fields as a fallback
              if (keys.length >= 2 && data[keys[0]] && data[keys[1]]) {
                console.log(`Using fallback for row ${rowCount}: ${keys[0]} and ${keys[1]}`);
                results.push({
                  messages: [
                    { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
                    { role: "user", content: data[keys[0]] },
                    { role: "assistant", content: data[keys[1]] }
                  ]
                });
                successfulRows++;
              }
            }
          }
        })
        .on('end', () => {
          console.log(`CSV processing complete. Read ${rowCount} rows, successfully processed ${successfulRows} examples.`);
          console.log(`Sample data (first example):`, results.length > 0 ? JSON.stringify(results[0]).substring(0, 200) + '...' : 'No results');
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error processing CSV:', error);
          reject(error);
        });
    } catch (err) {
      console.error('Exception in CSV processing:', err);
      reject(err);
    }
  });
}

/**
 * Process Excel file and convert to training data format
 */
export async function processExcelFile(filePath: string): Promise<any[]> {
  const results: any[] = [];
  
  // Read Excel file
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Use the first sheet
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  // Process each row
  data.forEach((row: any) => {
    // Check different possible column names
    if (row.prompt && row.completion) {
      results.push({
        messages: [
          { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
          { role: "user", content: row.prompt },
          { role: "assistant", content: row.completion }
        ]
      });
    } else if (row.user && row.assistant) {
      results.push({
        messages: [
          { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
          { role: "user", content: row.user },
          { role: "assistant", content: row.assistant }
        ]
      });
    } else if (row.input && row.output) {
      results.push({
        messages: [
          { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
          { role: "user", content: row.input },
          { role: "assistant", content: row.output }
        ]
      });
    } else {
      // Try to intelligently extract the columns
      const keys = Object.keys(row);
      const userField = keys.find(k => 
        k.toLowerCase().includes('prompt') || 
        k.toLowerCase().includes('user') || 
        k.toLowerCase().includes('input') || 
        k.toLowerCase().includes('question')
      );
      
      const assistantField = keys.find(k => 
        k.toLowerCase().includes('completion') || 
        k.toLowerCase().includes('assistant') || 
        k.toLowerCase().includes('output') || 
        k.toLowerCase().includes('answer') || 
        k.toLowerCase().includes('response')
      );
      
      if (userField && assistantField) {
        results.push({
          messages: [
            { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
            { role: "user", content: row[userField] },
            { role: "assistant", content: row[assistantField] }
          ]
        });
      }
    }
  });
  
  return results;
}

/**
 * Process JSONL file and convert to training data format if needed
 */
export async function processJSONLFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    // Read file line by line
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContents.split('\n').filter(line => line.trim()); // Remove empty lines
    
    lines.forEach(line => {
      try {
        const json = JSON.parse(line);
        
        // Check if it's already in the expected format
        if (json.messages) {
          results.push(json);
        } else if (json.prompt && json.completion) {
          // Old format with prompt/completion
          results.push({
            messages: [
              { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
              { role: "user", content: json.prompt },
              { role: "assistant", content: json.completion }
            ]
          });
        } else if (json.input && json.output) {
          results.push({
            messages: [
              { role: "system", content: "You are IntellaOne, an expert AI marketing assistant trained to help marketing professionals create compelling content and strategies." },
              { role: "user", content: json.input },
              { role: "assistant", content: json.output }
            ]
          });
        }
      } catch (error) {
        console.warn('Error parsing JSON line:', error);
        // Continue processing other lines
      }
    });
    
    resolve(results);
  });
}