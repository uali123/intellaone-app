/**
 * Gemini API integration for providing real-time research capabilities
 */
import axios from 'axios';

// Define search parameters interface
interface GeminiSearchOptions {
  query: string;
  numResults?: number;
  searchRecency?: 'day' | 'week' | 'month' | 'year';
}

// Define research result interface
export interface ResearchResult {
  title: string;
  summary: string;
  key_findings: string[];
  trends: string[];
  analysis: string;
  recommendations: string[];
  sources: {
    title: string;
    url: string;
  }[];
}

/**
 * Perform a web search and get research results using Gemini
 */
export async function performResearch(options: GeminiSearchOptions): Promise<ResearchResult> {
  // Create default result structure that can be used as fallback
  const defaultResult: ResearchResult = {
    title: "Research Results",
    summary: "Summary of research findings on the requested topic.",
    key_findings: [],
    trends: [],
    analysis: "",
    recommendations: [],
    sources: []
  };

  // Start timing the request
  const startTime = Date.now();

  // Validate API key before proceeding
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured");
    throw new Error("Gemini API key is not configured");
  }

  console.log(`Starting Gemini research query for: "${options.query}"`);
  
  // Construct a research-focused prompt for Gemini
  const researchPrompt = `
    I need comprehensive research on: "${options.query}"
    
    Please follow these steps:
    1. Search for the most current and reliable information on this topic
    2. Pay special attention to recent market trends, statistics, and expert insights
    3. Analyze the information and identify key patterns and insights
    4. Provide specific recommendations based on the findings
    
    Format your response as JSON with these sections:
    {
      "title": "A descriptive title for this research",
      "summary": "A brief 1-2 sentence overview of your findings",
      "key_findings": ["3-5 most important discoveries, with specific statistics when available"],
      "trends": ["3-5 current market trends related to the topic"],
      "analysis": "A detailed analysis with multiple paragraphs examining the topic in depth, including specific data points",
      "recommendations": ["3-5 data-backed recommendations"],
      "sources": [{"title": "Source name", "url": "URL of the source"}]
    }
    
    Important: Include only factual information that can be verified and cite specific sources.
    Include URLs to your sources whenever possible.
  `;

  // Set timeout for request to prevent long-hanging connections
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.error("Gemini API request aborted due to timeout (30s)");
  }, 30000); // 30 second timeout

  try {
    // Use the Google AI model to process the search and analysis
    console.log("Sending request to Gemini API...");
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      contents: [
        {
          parts: [
            {
              text: researchPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    }, {
      params: {
        key: process.env.GEMINI_API_KEY
      },
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    // Clear the timeout since request completed
    clearTimeout(timeoutId);

    // Calculate response time
    const responseTime = Date.now() - startTime;
    console.log(`Gemini API response received in ${responseTime}ms. Status: ${response.status}`);

    // Process and extract the structured research data
    if (!response.data || 
        !response.data.candidates || 
        !response.data.candidates[0] || 
        !response.data.candidates[0].content ||
        !response.data.candidates[0].content.parts || 
        !response.data.candidates[0].content.parts[0] ||
        !response.data.candidates[0].content.parts[0].text) {
      
      console.error("Invalid or unexpected response structure from Gemini API");
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from text (in case it's surrounded by markdown code blocks)
    const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonMatch = text.match(/{[\s\S]*?}/);
    
    let jsonContent = '';
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1];
    } else if (jsonMatch) {
      jsonContent = jsonMatch[0];
    } else {
      jsonContent = text;
    }
    
    try {
      // Parse the JSON response
      const result = JSON.parse(jsonContent);
      
      // Return formatted research data with validation of each field
      return {
        title: result.title || defaultResult.title,
        summary: result.summary || defaultResult.summary,
        key_findings: Array.isArray(result.key_findings) ? result.key_findings : defaultResult.key_findings,
        trends: Array.isArray(result.trends) ? result.trends : defaultResult.trends,
        analysis: result.analysis || defaultResult.analysis,
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : defaultResult.recommendations,
        sources: Array.isArray(result.sources) ? result.sources : defaultResult.sources
      };
    } catch (error) {
      console.error("Error parsing Gemini JSON response:", error);
      throw new Error("Failed to parse research results from Gemini API");
    }
    
  } catch (error: any) {
    // Clear timeout if it's still active
    clearTimeout(timeoutId);
    
    // Log detailed debugging information
    console.error("-------- Gemini API Error --------");
    console.error(`Query: "${options.query.substring(0, 50)}..."`);
    console.error(`Error time: ${new Date().toISOString()}`);
    console.error(`Error type: ${error.name || 'Unknown'}`);
    console.error(`Error message: ${error.message || 'No message'}`);
    console.error(`Error stack: ${error.stack || 'No stack trace'}`);
    console.error("----------------------------------");
    
    // Handle abort/timeout errors
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      console.error("Gemini API request timed out after 30 seconds");
      throw new Error("Research request timed out. Please try again with a more specific query.");
    }
    
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error(`Gemini API error: Status ${error.response.status}`);
      console.error("Response data:", JSON.stringify(error.response.data || {}));
      
      // Handle specific error codes
      if (error.response.status === 403) {
        throw new Error("Gemini API access denied. Please check API key permissions.");
      } else if (error.response.status === 429) {
        throw new Error("Gemini API rate limit exceeded. Please try again later.");
      } else {
        throw new Error(`Gemini API error: ${error.response.status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from Gemini API");
      throw new Error("No response received from Gemini API. Please check network connectivity.");
    }
    
    // For other errors
    console.error("Unhandled error with Gemini research:", error.message || error);
    throw new Error("An unexpected error occurred with the research service. Please try again later.");
  }
}