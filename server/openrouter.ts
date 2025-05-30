/**
 * OpenRouter integration for accessing multiple AI models through a single API
 */

export interface OpenRouterCompletionOptions {
  prompt: string;
  system?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  json?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a request to OpenRouter for AI completions
 */
export async function getOpenRouterCompletion(options: OpenRouterCompletionOptions): Promise<OpenRouterResponse> {
  const {
    prompt,
    system = "",
    model = "mistralai/mistral-7b-instruct", // Free tier default
    temperature = 0.7,
    max_tokens = 800, // Increased token limit for more detailed responses
    top_p = 1,
    json = false
  } = options;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key is not available");
  }

  const messages = [];
  
  // Add system message if provided
  if (system) {
    messages.push({
      role: "system",
      content: system
    });
  }
  
  // Add user prompt
  messages.push({
    role: "user",
    content: prompt
  });

  const requestBody: any = {
    model,
    messages,
    temperature,
    max_tokens,
    top_p
  };

  // Request JSON response if needed
  if (json) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://replit.com", // Required for OpenRouter
      "X-Title": "IntellaOne Marketing Platform" // For identifying your app on OpenRouter
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${text}`);
  }

  return await response.json();
}

/**
 * Helper to get the appropriate model name for different agent types
 */
export function getModelForAgent(agent: string): string {
  // Mapping agent types to appropriate models
  // Using valid models from OpenRouter's free tier
  // See: https://openrouter.ai/docs
  switch (agent) {
    case "maven": // Research needs more factual, less creative model
      return "mistralai/mistral-7b-instruct";
    case "matrix": // Messaging needs more creative capabilities
      // Using Claude 3 Haiku for creative messaging
      return "anthropic/claude-3-haiku";
    case "max": // Documents need structured outputs
      return "mistralai/mistral-7b-instruct";
    case "motion": // Campaign planning needs strategic thinking
      return "anthropic/claude-3-haiku"; 
    default:
      return "mistralai/mistral-7b-instruct"; // Default to Mistral
  }
}

/**
 * Test the OpenRouter connection
 */
export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    console.log("Testing OpenRouter connection...");
    const response = await getOpenRouterCompletion({
      prompt: "Hello, please respond with 'OpenRouter is working!'",
      max_tokens: 20
    });
    
    console.log(`OpenRouter test successful. Used model: ${response.model}`);
    console.log(`Response: "${response.choices[0].message.content}"`);
    return true;
  } catch (error) {
    console.error("OpenRouter test failed:", error);
    return false;
  }
}