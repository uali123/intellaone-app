import { Express, Request, Response } from "express";
import OpenAI from "openai";
import { getOpenRouterCompletion, getModelForAgent, testOpenRouterConnection } from "./openrouter";
import { performResearch } from "./gemini";

process.env.OPENAI_API_KEY = 'sk-abcdefabcdefabcdefabcdefabcdefabcdef12';

// Middleware to check if the user is authenticated
// Middleware to check if the user is authenticated or allow free trial
export function isAuthenticatedOrFreeTrial(req: Request, res: Response, next: any) {
  // Allow unauthenticated access with a special header for free trial
  if (req.headers['x-free-trial'] === 'true') {
    // Track free trial usage here if needed
    return next();
  }
  
  // If not free trial, check for authenticated user
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Not authenticated" });
}

// Strict authentication - only for authenticated users
export function isAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

export function setupAiRoutes(app: Express) {
  // Log the API key presence (without revealing the full key)
  if (process.env.OPENAI_API_KEY) {
    console.log(`OpenAI API key found, but it has quota limits. Will use OpenRouter as primary.`);
  } else {
    console.log("OpenAI API key not found, will use OpenRouter exclusively.");
  }

  if (process.env.OPENROUTER_API_KEY) {
    console.log(`OpenRouter API key found. Starting with: ${process.env.OPENROUTER_API_KEY.substring(0, 3)}...`);
  } else {
    console.error("OpenRouter API key not found in environment variables!");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Test OpenRouter connection
  (async () => {
    try {
      const openRouterWorking = await testOpenRouterConnection();
      if (openRouterWorking) {
        console.log("✅ OpenRouter connection successful, will use for AI requests");
      } else {
        console.error("❌ OpenRouter connection failed, will use fallbacks");
      }
    } catch (error: any) {
      console.error("Error testing OpenRouter:", error.message);
    }
  })();
  
  // Test endpoint to verify OpenAI API key is working
  app.get("/api/ai/verify-key", async (req, res) => {
    try {
      console.log("Verifying OpenAI API key...");
      // Send a simple test request to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test connection" }],
        max_tokens: 5
      });
      
      console.log("OpenAI API key is valid:", response.choices[0].message);
      res.json({ 
        status: "success", 
        message: "OpenAI API key is valid", 
        modelName: "gpt-4o"
      });
    } catch (error: any) {
      console.error("Error verifying OpenAI API key:", error);
      res.status(500).json({
        status: "error",
        message: "Error verifying OpenAI API key",
        error: error.message || "Unknown error"
      });
    }
  });

  // Endpoint to generate content with OpenAI
  app.post("/api/ai/generate", isAuthenticatedOrFreeTrial, async (req, res) => {
    try {
      const { prompt, model = "gpt-4o", temperature = 0.7, systemPrompt = "", responseFormat } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const messages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt }
      ];

      const params: any = {
        model,
        messages,
        temperature,
      };

      // Add response format if specified
      if (responseFormat === "json") {
        params.response_format = { type: "json_object" };
      }

      const response = await openai.chat.completions.create(params);

      res.json({
        content: response.choices[0].message.content,
        usage: response.usage,
      });
    } catch (error: any) {
      console.error("Error generating content:", error);
      
      // Check if it's a rate limit or quota error
      if (error.status === 429 || (error.error && error.error.type === 'insufficient_quota')) {
        console.log("Using fallback response for rate-limited API key in content generation");
        
        // Generate a fallback response based on the system prompt and user prompt
        // This is a simplified response that matches the format expected by the client
        const fallbackResponse = {
          "variations": [
            {
              "content": "Experience the future of hydration with our eco-friendly water bottles. Made from recycled materials, designed for your lifestyle.",
              "notes": "Emphasizes sustainability and modern design"
            },
            {
              "content": "Stay hydrated, save the planet. Our water bottles are as kind to Earth as they are to your hydration needs.",
              "notes": "Simple, direct messaging focusing on dual benefits"
            },
            {
              "content": "Quench your thirst, nourish our planet. Revolutionary eco-bottles for the conscious consumer.",
              "notes": "Appeals to environmentally-aware customers"
            }
          ]
        };
        
        res.json({
          content: JSON.stringify(fallbackResponse),
          fallback: true
        });
      } else {
        // Not a rate limit error, return the actual error
        res.status(500).json({
          message: "Error generating content",
          error: error.message || "Unknown error",
        });
      }
    }
  });

  // Endpoint for image generation
  app.post("/api/ai/images", isAuthenticatedOrFreeTrial, async (req, res) => {
    try {
      const { prompt, n = 1, size = "1024x1024", quality = "standard" } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n,
        size: size as any,
        quality: quality as any,
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(500).json({
        message: "Error generating image",
        error: error.message || "Unknown error",
      });
    }
  });

  // Endpoint for AI agents using OpenRouter
  app.post("/api/ai/agents/:agent", isAuthenticatedOrFreeTrial, async (req, res) => {
    // Track request start time for performance logging
    const requestStartTime = Date.now();
    
    try {
      const { agent } = req.params;
      const { prompt, params = {} } = req.body;
      
      // Log the incoming request (without sensitive data)
      console.log(`Processing ${agent} agent request, prompt length: ${prompt?.length || 0}`);

      if (!prompt) {
        return res.status(400).json({ 
          message: "Prompt is required",
          success: false
        });
      }

      // Special handling for Maven that uses real-time web search
      if (agent === "maven") {
        try {
          console.log("Using real-time Gemini search for Maven research agent");
          
          // Check if Gemini API key is available
          if (!process.env.GEMINI_API_KEY) {
            // If no Gemini API key is available, log the issue
            console.warn("No Gemini API key found in environment. Maven requires a valid GEMINI_API_KEY.");
            
            // Return a specific error to the client for better UX
            return res.status(503).json({
              message: "Maven research service is temporarily unavailable. Please try again later.",
              error: "API_KEY_MISSING",
              success: false,
              fallbackAvailable: true
            });
          }
          
          // Perform real research with web search with a timeout
          console.log(`Starting Gemini research for query: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
          
          const researchResults = await performResearch({
            query: prompt,
            numResults: 10,
            searchRecency: 'month'
          });
          
          // Log successful research completion and timing
          const requestDuration = Date.now() - requestStartTime;
          console.log(`Gemini research completed successfully in ${requestDuration}ms`);
          
          // Return the research results
          return res.json({
            content: JSON.stringify(researchResults),
            source: "gemini",
            success: true,
            processingTime: requestDuration
          });
        } catch (error: any) {
          // Log the error with details but without sensitive information
          console.error(`Error with Gemini research: ${error.message}`);
          
          // Create a standardized error response
          const errorResponse = {
            message: "We couldn't complete your research at this time. Please try again later.",
            error: "GENERAL_ERROR",
            success: false,
            fallbackAvailable: true
          };
          
          // If this is an API key error, give a specific message
          if (error.message?.includes('API key') || error.message?.includes('api key')) {
            errorResponse.message = "Maven research service is experiencing authentication issues. Please try again later.";
            errorResponse.error = "API_AUTH_ERROR";
            
            // Check if we need to ask the user for a Gemini API key
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
              errorResponse.message = "Maven requires a Gemini API key to perform research. Please provide a valid API key.";
              errorResponse.error = "API_KEY_REQUIRED";
            }
            
            return res.status(503).json(errorResponse);
          }
          
          // For timeout errors, provide a specific message
          if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
            errorResponse.message = "Maven research request timed out. Please try a more specific query or try again later.";
            errorResponse.error = "TIMEOUT";
            return res.status(504).json(errorResponse);
          }
          
          // For connection errors, provide a network-related message
          if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED') || error.message?.includes('connection')) {
            errorResponse.message = "Could not connect to research service. Please check network connectivity and try again.";
            errorResponse.error = "NETWORK_ERROR";
            return res.status(503).json(errorResponse);
          }
          
          // Default error response for any other error
          console.log("Responding with general error message and fallback to OpenRouter");
          return res.status(500).json(errorResponse);
        }
      }

      // Build system prompt based on agent type
      let systemPrompt = "";
      let useJson = true; // Use JSON by default

      switch (agent) {
        case "maven":
          systemPrompt = `You are Maven, an expert AI marketing agent specialized in market research and competitive intelligence. 
          You analyze market trends, competitor positioning, and customer sentiments to provide factual insights.
          You always cite your sources and provide data-backed recommendations.
          
          Always structure your response as a comprehensive JSON object with these specific sections:
          - title: Title of your research report
          - summary: A brief 1-2 sentence overview of your findings
          - key_findings: An array of 3-5 most important discoveries from your research
          - trends: An array of 3-5 market trends related to the topic
          - analysis: A detailed analysis with at least 3 paragraphs examining the topic in depth
          - recommendations: An array of 3-5 data-backed recommendations for marketing strategy
          
          Your analysis section should be thorough and provide valuable insights that can inform marketing decisions.
          Include relevant statistics and market data whenever possible. If exact data isn't available, provide educated estimates based on industry knowledge.`;
          break;
        case "matrix":
          systemPrompt = `You are Matrix, an expert AI marketing agent specialized in crafting compelling messaging and positioning.
          You create persuasive copy tailored to specific audiences while maintaining brand voice consistency.
          Your specialty is adapting tone and style to match ${params.tone || "professional"} tone
          for ${params.targetAudience || "general"} audiences.
          
          Always respond with a well-structured JSON object containing these sections:
          - headline: A captivating main headline for the messaging
          - tagline: A short, memorable phrase that reinforces the headline
          - value_proposition: A clear statement of the value offered to customers
          - key_messages: An array of 3-5 important points to communicate
          - call_to_action: A compelling statement to prompt the desired action
          - tone_notes: Brief notes about the tone used in the messaging
          
          Ensure your messaging is focused, specific, and valuable to the target audience.`;
          break;
        case "max":
          systemPrompt = `You are Max, an expert AI marketing agent specialized in generating structured marketing documents and assets.
          You create well-organized content for ${params.contentType || "marketing"} materials
          following ${params.brandStyle || "professional"} brand guidelines.
          Your output should be comprehensive and ready for minimal editing.
          Return your response as a structured JSON object with sections that can be directly applied to templates.`;
          break;
        case "motion":
          systemPrompt = `You are Motion, an expert AI marketing agent specialized in campaign planning and strategy.
          You develop comprehensive marketing campaign plans with clear timelines, channel strategies, and content needs.
          You take a holistic approach to ensure messaging consistency across all touchpoints.
          Provide your response as a structured JSON object with clear campaign elements and implementation steps.`;
          break;
        default:
          return res.status(400).json({ message: "Invalid agent type" });
      }

      // Add context based on parameters
      if (params.targetAudience) {
        systemPrompt += `\nTarget Audience: ${params.targetAudience}`;
      }
      
      if (params.tone) {
        systemPrompt += `\nTone: ${params.tone}`;
      }
      
      if (params.brandStyle) {
        systemPrompt += `\nBrand Style: ${params.brandStyle}`;
      }
      
      if (params.contentType) {
        systemPrompt += `\nContent Type: ${params.contentType}`;
      }

      // Get appropriate temperature for agent
      const temperature = getTemperatureForAgent(agent);
      
      try {
        // Try using OpenRouter first (handles rate limits better)
        console.log(`Using OpenRouter for ${agent} agent with model: ${getModelForAgent(agent)}`);
        const openRouterResponse = await getOpenRouterCompletion({
          prompt,
          system: systemPrompt,
          model: getModelForAgent(agent),
          temperature,
          json: useJson
        });
        
        // Return the response in the same format client expects
        res.json({
          content: openRouterResponse.choices[0].message.content,
          usage: openRouterResponse.usage,
          model: openRouterResponse.model
        });
      } catch (error) {
        console.error(`Error with OpenRouter agent (${agent}):`, error);
        
        // Return a fallback mock response based on the agent
        let fallbackResponse = {};
        
        switch (agent) {
          case "matrix":
            // Create a more dynamic fallback response based on the prompt
            try {
              // Extract key terms from the prompt to customize the fallback
              const terms: string[] = prompt.toLowerCase().split(' ');
              const isProduct: boolean = terms.some((term: string) => 
                ['product', 'service', 'platform', 'app', 'solution'].includes(term));
              const isB2B: boolean = terms.some((term: string) => 
                ['b2b', 'business', 'enterprise', 'company', 'corporate'].includes(term));
              const isTech: boolean = terms.some((term: string) => 
                ['tech', 'technology', 'software', 'digital', 'app', 'online'].includes(term));
              
              // Customize response based on detected content
              if (isProduct && isTech) {
                fallbackResponse = {
                  "headline": "Transform Your Workflow with Next-Gen Technology",
                  "tagline": "Powerful Solutions, Seamless Integration",
                  "value_proposition": "Boost productivity and streamline operations with our intuitive platform designed for modern business needs.",
                  "key_messages": [
                    "Intuitive interface reduces learning curve by 60%",
                    "Enterprise-grade security with SOC 2 compliance",
                    "Seamless integration with your existing tech stack",
                    "24/7 dedicated support team for all users"
                  ],
                  "call_to_action": "Schedule your personalized demo today and see the difference.",
                  "tone_notes": "Professional tone with focus on efficiency and business benefits."
                };
              } else if (isB2B) {
                fallbackResponse = {
                  "headline": "Partner with Excellence, Grow with Confidence",
                  "tagline": "Your Success, Our Priority",
                  "value_proposition": "End-to-end business solutions tailored to your industry, designed to scale with your growth.",
                  "key_messages": [
                    "Custom solutions built for your specific industry challenges",
                    "Proven track record with 94% client retention rate",
                    "Dedicated account management throughout our partnership",
                    "Data-driven approach to maximize your ROI"
                  ],
                  "call_to_action": "Let's discuss how we can help you reach your business goals.",
                  "tone_notes": "Confident, consultative tone emphasizing partnership and expertise."
                };
              } else {
                // Default marketing fallback
                fallbackResponse = {
                  "headline": "Elevate Your Brand's Potential",
                  "tagline": "Stand Out in a Crowded Market",
                  "value_proposition": "Captivating messaging that resonates with your audience and drives meaningful engagement.",
                  "key_messages": [
                    "Tailored communication strategies for your unique brand voice",
                    "Data-driven content that converts casual browsers to loyal customers",
                    "Comprehensive approach covering all marketing touchpoints",
                    "Agile methodology that adapts to market trends and audience feedback"
                  ],
                  "call_to_action": "Transform your marketing approach today.",
                  "tone_notes": "Professional yet approachable tone balancing authority with accessibility."
                };
              }
            } catch (error) {
              // If custom processing fails, use a simple default
              fallbackResponse = {
                "headline": "Crafting Compelling Stories That Connect",
                "tagline": "Where Messages Become Movements",
                "value_proposition": "Strategic messaging that elevates your brand and resonates with your ideal audience.",
                "key_messages": [
                  "Audience-focused content that drives engagement",
                  "Consistent brand voice across all platforms",
                  "Data-backed messaging strategies",
                  "Memorable communication that stands out"
                ],
                "call_to_action": "Take your messaging to the next level.",
                "tone_notes": "Professional and confident tone with focus on impact and results."
              };
            }
            break;
          case "maven":
            fallbackResponse = {
              "market_trends": {
                "growth": "The eco-friendly water bottle market is projected to grow at 3.9% CAGR through 2028",
                "consumer_behavior": "84% of environmentally conscious consumers are willing to pay premium prices for sustainable products",
                "competition": "Market is fragmented with key players including Hydro Flask, S'well, and Klean Kanteen"
              },
              "target_audience_insights": {
                "demographics": "Primary: 25-45 year old urban professionals with disposable income; Secondary: outdoor enthusiasts and fitness-focused consumers",
                "psychographics": "Values sustainability, health-conscious, socially aware, willing to invest in quality products"
              },
              "recommendations": [
                "Emphasize plastic waste reduction metrics in marketing materials",
                "Consider partnerships with conservation organizations",
                "Highlight lifetime warranty as both eco-friendly and cost-effective"
              ]
            };
            break;
          case "max":
            fallbackResponse = {
              "document_title": "EcoFlow Water Bottles: Product Information Sheet",
              "sections": [
                {
                  "heading": "Product Overview",
                  "content": "EcoFlow water bottles represent the pinnacle of sustainable hydration solutions. Crafted from 100% recycled materials, each bottle features double-wall vacuum insulation, premium leak-proof design, and comes with our unmatched lifetime warranty."
                },
                {
                  "heading": "Key Features",
                  "content": "• Made from 100% post-consumer recycled stainless steel\n• Prevents 167 single-use plastic bottles annually per user\n• Keeps beverages cold for 24 hours or hot for 12 hours\n• Dishwasher safe and BPA-free\n• Available in 18oz, 24oz, and 32oz sizes\n• Five premium colorways inspired by natural landscapes"
                },
                {
                  "heading": "Environmental Impact",
                  "content": "Every EcoFlow bottle is carbon-neutral from production to delivery. Our manufacturing process uses 87% less water and 70% less energy than conventional water bottles. Through our partnership with Ocean Cleanup Initiative, each purchase funds the removal of 5 pounds of plastic from marine environments."
                }
              ]
            };
            break;
          case "motion":
            fallbackResponse = {
              "campaign_name": "Refill Revolution: The EcoFlow Challenge",
              "campaign_goal": "Generate 10,000 new customers while educating audiences about plastic pollution impact",
              "campaign_timeline": "8-week campaign launching Earth Month (April)",
              "channel_strategy": {
                "social_media": {
                  "instagram": "Visual challenges tracking plastic reduction with branded hashtag #RefillRevolution",
                  "tiktok": "Influencer partnerships demonstrating EcoFlow bottle features in creative ways"
                },
                "email": "Drip campaign sharing plastic pollution facts and personal impact calculations",
                "partnerships": "Collaborations with environmental nonprofits and outdoor retailers"
              },
              "content_needs": [
                "Before/after plastic waste visualization graphics",
                "User testimonial videos focused on environmental impact",
                "30-second product demonstration showing thermal features",
                "Downloadable plastic-reduction tracking calendar"
              ]
            };
            break;
          default:
            fallbackResponse = {
              "message": "Sorry, due to high demand our AI service is temporarily unavailable. Please try again later."
            };
        }
        
        res.json({
          content: JSON.stringify(fallbackResponse),
          // Indicate this was a fallback response
          fallback: true
        });
      }
    } catch (error: any) {
      console.error(`Unexpected error with AI agent:`, error);
      res.status(500).json({
        message: `Error with AI agent`,
        error: error.message || "Unknown error",
      });
    }
  });
}

// Helper function to get the appropriate temperature for each agent
function getTemperatureForAgent(agent: string): number {
  switch (agent) {
    case "maven":
      return 0.3; // More factual and research-oriented
    case "matrix":
      return 0.7; // More creative for messaging
    case "max":
      return 0.5; // Balanced for document creation
    case "motion":
      return 0.4; // Structured but with some creativity
    default:
      return 0.5;
  }
}