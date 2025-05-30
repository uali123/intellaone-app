import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: 'sk-abcdefabcdefabcdefabcdefabcdefabcdef12',
});

export type AgentName = "Maven" | "Matrix" | "Max";

export interface AgentParams {
  content?: string;
  contentType?: string;
  tone?: string;
  targetAudience?: string;
  brandStyle?: string;
  additionalContext?: string;
  campaignGoal?: string;
  channels?: string;
}

export async function generateWithAgent(
  agentName: AgentName,
  prompt: string,
  params: AgentParams
): Promise<any> {
  try {
    // Build full system prompt based on agent type
    const systemPrompt = getAgentSystemPrompt(agentName, params);
    
    // Build the user prompt
    const userPrompt = buildUserPrompt(agentName, prompt, params);
    
    // Call OpenAI API with appropriate parameters
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: getTemperatureForAgent(agentName),
    });
    
    // Parse and return the response
    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error: any) {
    console.error(`Error generating content with ${agentName}:`, error);
    throw new Error(`Failed to generate content with ${agentName}: ${error?.message || 'Unknown error'}`);
  }
}

// Helper function to get the appropriate system prompt for each agent
function getAgentSystemPrompt(agentName: AgentName, params: AgentParams): string {
  const basePrompt = `You are ${agentName}, an expert AI marketing agent specialized in `;
  
  switch (agentName) {
    case "Maven":
      return `${basePrompt} market research and competitive intelligence. 
      You analyze market trends, competitor positioning, and customer sentiments to provide factual insights.
      You always cite your sources and provide data-backed recommendations.
      Always structure your response as a comprehensive JSON object with clear sections.`;
      
    case "Matrix":
      return `${basePrompt} crafting compelling messaging and content creation.
      You create persuasive copy and marketing content tailored to specific audiences while maintaining brand voice consistency.
      Your specialty is adapting tone and style to match ${params.tone || "professional"} tone
      for ${params.targetAudience || "general"} audiences, and creating well-structured marketing materials.
      Format your response as a structured JSON object with clear sections for different messaging components.`;
      
    case "Max":
      return `${basePrompt} campaign planning and strategy.
      You develop comprehensive marketing campaign plans with clear timelines, channel strategies, and content needs.
      You take a holistic approach to ensure messaging consistency across all touchpoints.
      You excel at creating strategic marketing plans for ${params.contentType || "marketing"} initiatives
      following ${params.brandStyle || "professional"} brand guidelines.
      Provide your response as a structured JSON object with clear campaign elements and implementation steps.`;
      
    default:
      return `${basePrompt} marketing content generation. Provide your response as a structured JSON object.`;
  }
}

// Helper function to build a user prompt based on agent and parameters
function buildUserPrompt(agentName: AgentName, prompt: string, params: AgentParams): string {
  let fullPrompt = prompt;
  
  // Add context based on the parameters and agent type
  const contextBlocks = [];
  
  if (params.contentType) {
    contextBlocks.push(`Content Type: ${params.contentType}`);
  }
  
  if (params.targetAudience) {
    contextBlocks.push(`Target Audience: ${params.targetAudience}`);
  }
  
  if (params.tone) {
    contextBlocks.push(`Tone: ${params.tone}`);
  }
  
  if (params.brandStyle) {
    contextBlocks.push(`Brand Style: ${params.brandStyle}`);
  }
  
  if (params.additionalContext) {
    contextBlocks.push(`Additional Context: ${params.additionalContext}`);
  }
  
  // Add agent-specific instructions
  switch (agentName) {
    case "Maven":
      contextBlocks.push(
        "Please provide your research in the following JSON format: " +
        "{ \"marketInsights\": [...], \"competitorAnalysis\": {...}, \"customerSentiment\": {...}, \"recommendations\": [...] }"
      );
      break;
      
    case "Matrix":
      contextBlocks.push(
        "Please format your messaging and content in the following JSON format: " +
        "{ \"headline\": \"...\", \"subheadline\": \"...\", \"valueProposition\": \"...\", \"keyMessages\": [...], \"content\": \"...\", \"sections\": [...], \"callToAction\": \"...\" }"
      );
      break;
      
    case "Max":
      contextBlocks.push(
        "Please format your campaign plan in the following JSON format: " +
        "{ \"campaignName\": \"...\", \"objectives\": [...], \"targetAudience\": {...}, \"channels\": [...], \"timeline\": [...], \"contentNeeds\": [...] }"
      );
      break;
  }
  
  // Combine context blocks with the original prompt
  if (contextBlocks.length > 0) {
    fullPrompt += "\n\n" + contextBlocks.join("\n");
  }
  
  return fullPrompt;
}

// Helper function to get the appropriate temperature for each agent
function getTemperatureForAgent(agentName: AgentName): number {
  switch (agentName) {
    case "Maven":
      return 0.3; // More factual and research-oriented
    case "Matrix":
      return 0.7; // More creative for messaging and content
    case "Max":
      return 0.4; // Structured but with some creativity for campaign planning
    default:
      return 0.5;
  }
}

// Function specifically for generating content variations
export async function generateContentVariations(
  originalContent: string,
  contentType: string,
  count: number = 3,
  params: AgentParams
): Promise<any[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            `You are an expert marketing content generator. Generate ${count} unique variations 
            of the provided content while maintaining the core message and intent. 
            For each variation, use a different approach or style while keeping the same target 
            audience (${params.targetAudience || "general"}) and tone (${params.tone || "professional"}).
            Return your response as a JSON array with ${count} objects, each containing a variation.`
        },
        {
          role: "user",
          content: 
            `Please generate ${count} variations of this ${contentType} content:
            
            ${originalContent}
            
            Additional parameters:
            - Target Audience: ${params.targetAudience || "general"}
            - Tone: ${params.tone || "professional"}
            - Brand Style: ${params.brandStyle || "standard"}
            
            Return each variation as a JSON object in this format:
            {
              "id": "variation-1",
              "title": "Variation title or summary",
              "content": "The full content of the variation",
              "approach": "Brief description of the approach used in this variation"
            }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
    
    const content = response.choices[0].message.content;
    return content ? JSON.parse(content).variations : [];
  } catch (error: any) {
    console.error("Error generating content variations:", error);
    throw new Error(`Failed to generate content variations: ${error?.message || 'Unknown error'}`);
  }
}

// Maven agent - research and market analysis
export async function runMavenResearch(topic: string, params: AgentParams = {}): Promise<any> {
  return generateWithAgent("Maven", topic, params);
}

// Matrix agent - messaging, positioning, and content creation
export async function createMatrixMessaging(brief: string, params: AgentParams = {}): Promise<any> {
  return generateWithAgent("Matrix", brief, params);
}

// Matrix agent function for document creation (previously Max)
export async function createMatrixDocument(
  brief: string, 
  documentType: string,
  params: AgentParams = {}
): Promise<any> {
  return generateWithAgent("Matrix", brief, { ...params, contentType: documentType });
}

// Max agent - campaign planning (previously Motion)
export async function planMaxCampaign(
  campaignBrief: string,
  params: AgentParams = {}
): Promise<any> {
  return generateWithAgent("Max", campaignBrief, params);
}

// Legacy functions for backward compatibility
export async function generateMaxDocument(brief: string, documentType: string, params: AgentParams = {}): Promise<any> {
  console.warn("generateMaxDocument is deprecated, use createMatrixDocument instead");
  return createMatrixDocument(brief, documentType, params);
}

export async function planMotionCampaign(campaignBrief: string, params: AgentParams = {}): Promise<any> {
  console.warn("planMotionCampaign is deprecated, use planMaxCampaign instead");
  return planMaxCampaign(campaignBrief, params);
}