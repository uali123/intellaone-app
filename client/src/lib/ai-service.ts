import { apiRequest } from "./queryClient";
import { AgentName as OpenAIAgentName, AgentParams as OpenAIAgentParams } from "./openai";

// Re-export types for use in components
export type AgentName = OpenAIAgentName;
export type AgentParams = OpenAIAgentParams;

/**
 * Service for interacting with AI capabilities through the server
 */

/**
 * Generate content using a specific AI agent
 */
export async function generateWithAgent(
  agentName: AgentName,
  prompt: string,
  params: AgentParams = {}
): Promise<any> {
  try {
    const response = await apiRequest(
      "POST",
      `/api/ai/agents/${agentName.toLowerCase()}`,
      {
        prompt,
        params,
      }
    );

    const data = await response.json();
    if (data.content) {
      try {
        // Check if content is already an object (pre-parsed JSON)
        if (typeof data.content === 'object') {
          return data.content;
        }
        
        // Try to parse the content as JSON, fall back to raw content if it fails
        const trimmedContent = data.content.trim();
        // Handle potential markdown code blocks in the content
        const jsonMatch = trimmedContent.match(/```json\n([\s\S]*?)\n```/) || 
                         trimmedContent.match(/```\n([\s\S]*?)\n```/) || 
                         trimmedContent.match(/^({[\s\S]*})$/);
                         
        const contentToParse = jsonMatch ? jsonMatch[1] : trimmedContent;
        
        try {
          return JSON.parse(contentToParse);
        } catch (innerError: any) {
          console.warn(`Could not parse as JSON, using raw content: ${innerError?.message || 'Unknown error'}`);
          return data.content;
        }
      } catch (e: any) {
        console.warn(`Error processing content: ${e?.message || 'Unknown error'}`);
        return data.content;
      }
    }
    return data;
  } catch (error: any) {
    console.error(`Error generating content with ${agentName}:`, error);
    throw new Error(
      `Failed to generate content with ${agentName}: ${
        error?.message || "Unknown error"
      }`
    );
  }
}

/**
 * Generate content variations
 */
export async function generateContentVariations(
  originalContent: string,
  contentType: string,
  count: number = 3,
  params: AgentParams = {}
): Promise<any[]> {
  try {
    const response = await apiRequest("POST", "/api/ai/generate", {
      prompt: `Generate ${count} variations of this ${contentType} content: ${originalContent}`,
      systemPrompt: `You are an expert marketing content generator. Generate ${count} unique variations 
      of the provided content while maintaining the core message and intent. 
      For each variation, use a different approach or style while keeping the same target 
      audience (${params.targetAudience || "general"}) and tone (${
        params.tone || "professional"
      }).
      Return your response as a JSON array with ${count} objects, each containing a variation.`,
      responseFormat: "json",
      temperature: 0.8,
    });

    const data = await response.json();
    if (data.content) {
      try {
        const parsed = JSON.parse(data.content);
        return parsed.variations || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  } catch (error: any) {
    console.error("Error generating content variations:", error);
    throw new Error(
      `Failed to generate content variations: ${
        error?.message || "Unknown error"
      }`
    );
  }
}

/**
 * Generate an image using DALL-E
 */
export async function generateImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/ai/images", {
      prompt,
      n: 1,
      size,
      quality: "standard",
    });

    const data = await response.json();
    if (data[0]?.url) {
      return data[0].url;
    }
    throw new Error("No image URL returned");
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(
      `Failed to generate image: ${error?.message || "Unknown error"}`
    );
  }
}

// Maven agent - research and market analysis with enhanced error handling
export async function runMavenResearch(
  topic: string,
  params: AgentParams = {}
): Promise<any> {
  // Default fallback structure for graceful error recovery
  const fallbackResult = {
    title: "Research Results",
    summary: "We couldn't complete your research at this time. Please try again later.",
    key_findings: ["Unable to generate research findings at this moment."],
    trends: [],
    analysis: "Our research service is temporarily unavailable. We apologize for the inconvenience.",
    recommendations: ["Try a more specific query", "Try again in a few minutes"],
    sources: [],
    error: true
  };
  
  try {
    // Maximum timeout for request (30 seconds)
    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 30000);
    });
    
    // Actual API request
    const resultPromise = generateWithAgent("Maven", topic, params);
    
    // Race between timeout and actual request
    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    // Validate the result structure
    if (!result || typeof result !== 'object') {
      console.error("Invalid Maven research result structure:", result);
      return {
        ...fallbackResult,
        errorDetails: "Invalid response structure"
      };
    }
    
    // If there's an error flag in the response, return it with the error info
    if (result.error) {
      console.warn("Maven research returned an error:", result);
      return {
        ...fallbackResult,
        errorDetails: result.message || "Unknown error in research service"
      };
    }
    
    // Return the valid result
    return result;
  } catch (error: any) {
    // Log the error with details
    console.error("Error in Maven research agent:", error);
    
    // Return a graceful error response with user-friendly message
    return {
      ...fallbackResult,
      errorDetails: error?.message || "Unknown error",
      errorCode: error?.status || 500
    };
  }
}

// Matrix agent - messaging and content creation (merged with document generation)
export async function createMatrixMessaging(
  brief: string,
  params: AgentParams = {}
): Promise<any> {
  try {
    const result = await generateWithAgent("Matrix", brief, params);
    
    // Ensure the response has the expected structure
    const validatedResult = validateMatrixResponse(result);
    return validatedResult;
  } catch (error) {
    console.error("Error in Matrix messaging agent:", error);
    throw error;
  }
}

// Helper function to validate Matrix agent responses
function validateMatrixResponse(response: any): any {
  // If response is already valid, return it
  if (response && 
      response.headline && 
      response.tagline && 
      response.key_messages &&
      Array.isArray(response.key_messages)) {
    return response;
  }
  
  // Try to fix common issues with the response
  const fixedResponse = { ...response };
  
  // Ensure key_messages is an array
  if (fixedResponse.key_messages && !Array.isArray(fixedResponse.key_messages)) {
    if (typeof fixedResponse.key_messages === 'string') {
      const messageString: string = fixedResponse.key_messages;
      fixedResponse.key_messages = messageString.split('\n').filter((message: string) => message.trim().length > 0);
    } else {
      fixedResponse.key_messages = [];
    }
  }
  
  // Add missing fields with placeholders if needed
  if (!fixedResponse.headline) fixedResponse.headline = fixedResponse.title || "Compelling Headline";
  if (!fixedResponse.tagline) fixedResponse.tagline = fixedResponse.subtitle || "Engaging Tagline";
  if (!fixedResponse.value_proposition) fixedResponse.value_proposition = "Value proposition highlighting benefits.";
  if (!fixedResponse.key_messages) fixedResponse.key_messages = [];
  if (!fixedResponse.call_to_action) fixedResponse.call_to_action = "Take action now.";
  
  return fixedResponse;
}

// Matrix agent - document creation (previously Max)
export async function createMatrixDocument(
  brief: string,
  documentType: string,
  params: AgentParams = {}
): Promise<any> {
  return generateWithAgent("Matrix", brief, {
    ...params,
    contentType: documentType,
  });
}

// Max agent - campaign planning (previously Motion)
export async function planMaxCampaign(
  campaignBrief: string,
  params: AgentParams = {}
): Promise<any> {
  return generateWithAgent("Max", campaignBrief, params);
}

// Legacy functions for backward compatibility
export async function generateMaxDocument(
  brief: string,
  documentType: string,
  params: AgentParams = {}
): Promise<any> {
  console.warn("generateMaxDocument is deprecated, use createMatrixDocument instead");
  return createMatrixDocument(brief, documentType, params);
}

export async function planMotionCampaign(
  campaignBrief: string,
  params: AgentParams = {}
): Promise<any> {
  console.warn("planMotionCampaign is deprecated, use planMaxCampaign instead");
  return planMaxCampaign(campaignBrief, params);
}