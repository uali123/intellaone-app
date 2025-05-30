import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import PublicAppShell from "@/components/layout/public-app-shell";
// Using a simplified Matrix agent implementation directly in this file
import { createMatrixMessaging, runMavenResearch, planMaxCampaign } from "@/lib/ai-service";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BrainCircuit, Sparkles, Search, MessageSquare, FileText, BarChart3, Info, ExternalLink, Copy, Download, Save, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AgentName } from "@/lib/openai";
import { useSafeOnboarding } from "@/hooks/use-onboarding";
import { OnboardingProgressIndicator } from "@/components/onboarding/progress-indicator";
import { GuidedTour } from "@/components/onboarding/guided-tour";
import { OnboardingTooltip } from "@/components/onboarding/onboarding-tooltip";

export default function AgentPlaygroundPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeAgent, setActiveAgent] = useState<AgentName>("Matrix");
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [hasInteractedWithAgents, setHasInteractedWithAgents] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [matrixResult, setMatrixResult] = useState<any>(null);
  const [mavenResult, setMavenResult] = useState<any>(null);
  const [maxResult, setMaxResult] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  
  // Get onboarding context
  const onboarding = useSafeOnboarding();
  
  // Check for free trial mode and show guided tour for new users
  useEffect(() => {
    // Check if the user is in free trial mode
    const freeTrialMode = localStorage.getItem('free-trial-mode') === 'true';
    setIsFreeTrial(freeTrialMode);
    
    // Track when users arrive from the free trial button
    if (freeTrialMode) {
      console.log("Free trial mode set to:", freeTrialMode);
      console.log("User accessed Agent Playground in free trial mode");
      
      // When in free trial mode, make sure user can still generate content
      // by setting authenticated status for free trial users
      localStorage.setItem('authenticated', 'true');
    }
    
    // Check if this is the user's first visit
    const hasVisitedBefore = localStorage.getItem('has-visited-playground') === 'true';
    
    // If it's their first visit and they haven't interacted yet, show the tour popup
    if (!hasVisitedBefore && !hasInteractedWithAgents) {
      // Show tour popup after a slight delay
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      // Mark that they've visited
      localStorage.setItem('has-visited-playground', 'true');
      
      // Clean up timer
      return () => clearTimeout(timer);
    }
  }, [hasInteractedWithAgents]);
  
  // Helper to save content (used for both agents)
  const handleSaveContent = (content: any) => {
    // This would normally save to the database, but for the demo we just show a toast
    toast({
      title: "Content saved",
      description: "Your content has been saved successfully",
    });
  };

  return (
    <PublicAppShell>
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Animated Banner with Agent Introduction */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg overflow-hidden relative">
          {/* Animated background effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-[100px] opacity-10">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-purple-300 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Meet Our AI Marketing Specialists
            </h2>
            <p className="text-purple-100 mb-5 max-w-3xl">
              Each specialist is designed to help with different aspects of your marketing needs
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Maven - Keep the consistent order */}
              <div 
                className={`group bg-white/10 backdrop-blur-sm rounded-lg p-3 border ${activeAgent === 'Maven' ? 'border-white border-opacity-60 shadow-glow' : 'border-white/20'} hover:bg-white/20 hover:shadow-lg transition-all transform hover:scale-[1.03] cursor-pointer relative overflow-hidden`}
                onClick={() => setActiveAgent('Maven')}
              >
                {/* Selection Animation */}
                {activeAgent === 'Maven' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 animate-pulse" style={{ animationDuration: '2s' }}></div>
                )}
                <div className="flex items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full ${activeAgent === 'Maven' ? 'bg-purple-500/50' : 'bg-purple-500/30'} flex items-center justify-center mr-3 group-hover:ring-2 group-hover:ring-purple-300/50 transition-all`}>
                    <Search className={`w-5 h-5 text-white ${activeAgent === 'Maven' ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-purple-100 transition-colors">Maven</h3>
                    <p className="text-xs text-purple-100">Research Assistant</p>
                  </div>
                </div>
              </div>
              
              {/* Matrix */}
              <div 
                className={`group bg-white/10 backdrop-blur-sm rounded-lg p-3 border ${activeAgent === 'Matrix' ? 'border-white border-opacity-60 shadow-glow' : 'border-white/20'} hover:bg-white/20 hover:shadow-lg transition-all transform hover:scale-[1.03] cursor-pointer relative overflow-hidden`}
                onClick={() => setActiveAgent('Matrix')}
              >
                {/* Selection Animation */}
                {activeAgent === 'Matrix' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 animate-pulse" style={{ animationDuration: '2s' }}></div>
                )}
                <div className="flex items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full ${activeAgent === 'Matrix' ? 'bg-indigo-500/50' : 'bg-indigo-500/30'} flex items-center justify-center mr-3 group-hover:ring-2 group-hover:ring-indigo-300/50 transition-all`}>
                    <MessageSquare className={`w-5 h-5 text-white ${activeAgent === 'Matrix' ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-indigo-100 transition-colors">Matrix</h3>
                    <p className="text-xs text-purple-100">Content Creator</p>
                  </div>
                </div>
              </div>
              
              {/* Max */}
              <div 
                className={`group bg-white/10 backdrop-blur-sm rounded-lg p-3 border ${activeAgent === 'Max' ? 'border-white border-opacity-60 shadow-glow' : 'border-white/20'} hover:bg-white/20 hover:shadow-lg transition-all transform hover:scale-[1.03] cursor-pointer relative overflow-hidden`}
                onClick={() => setActiveAgent('Max')}
              >
                {/* Selection Animation */}
                {activeAgent === 'Max' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-teal-400/10 animate-pulse" style={{ animationDuration: '2s' }}></div>
                )}
                <div className="flex items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full ${activeAgent === 'Max' ? 'bg-blue-500/50' : 'bg-blue-500/30'} flex items-center justify-center mr-3 group-hover:ring-2 group-hover:ring-blue-300/50 transition-all`}>
                    <BarChart3 className={`w-5 h-5 text-white ${activeAgent === 'Max' ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-blue-100 transition-colors">Max</h3>
                    <p className="text-xs text-purple-100">Campaign Strategist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Onboarding Progress Indicator */}
        {!hasGeneratedContent && (
          <div className="mb-8">
            <OnboardingProgressIndicator
              steps={[
                { id: 'choose-agent', label: 'Choose Agent', completed: true },
                { id: 'describe-needs', label: 'Describe Needs', completed: hasInteractedWithAgents },
                { id: 'view-results', label: 'View Results', completed: hasGeneratedContent }
              ]}
              currentStepId={hasInteractedWithAgents ? 'describe-needs' : 'choose-agent'}
            />
          </div>
        )}
        
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Experience the power of AI-driven marketing content creation
          </p>
        </div>
        
        {/* Agent Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Maven Agent Card - First */}
          <div 
            className={`p-4 border ${
              activeAgent === "Maven" 
                ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" 
                : "border-gray-200 hover:border-blue-200 dark:border-gray-700 hover:dark:border-blue-800"
            } rounded-xl cursor-pointer transition-all duration-200`}
            onClick={() => setActiveAgent("Maven")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  Maven
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Research Assistant</p>
              </div>
              {activeAgent === "Maven" && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium dark:bg-blue-900/40 dark:text-blue-300">
                  Active
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Research assistant that analyzes market trends, competitive positioning, and audience insights.
            </p>
            
            <div className="mb-3">
              <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">Ideal for:</p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">Market Research</span>
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">Competitive Analysis</span>
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">Trend Reports</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              "Ask me to research market trends or analyze competitors"
            </p>
          </div>

          {/* Matrix Agent Card - Second */}
          <div 
            className={`p-4 border ${
              activeAgent === "Matrix" 
                ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20" 
                : "border-gray-200 hover:border-purple-200 dark:border-gray-700 hover:dark:border-purple-800"
            } rounded-xl cursor-pointer transition-all duration-200`}
            onClick={() => setActiveAgent("Matrix")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  Matrix
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Content Creator</p>
              </div>
              {activeAgent === "Matrix" && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium dark:bg-purple-900/40 dark:text-purple-300">
                  Active
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Intelligent creator that generates marketing messaging, positioning, and documents with brand voice control.
            </p>
            
            <div className="mb-3">
              <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">Ideal for:</p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded dark:bg-purple-900/30 dark:text-purple-300">Messaging</span>
                <span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded dark:bg-purple-900/30 dark:text-purple-300">Positioning</span>
                <span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded dark:bg-purple-900/30 dark:text-purple-300">One-Pagers</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              "Ask me to create product messaging or marketing content"
            </p>
          </div>
          
          {/* Max Agent Card - Third */}
          <div 
            className={`p-4 border ${
              activeAgent === "Max" 
                ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20" 
                : "border-gray-200 hover:border-green-200 dark:border-gray-700 hover:dark:border-green-800"
            } rounded-xl cursor-pointer transition-all duration-200`}
            onClick={() => setActiveAgent("Max")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                  Max
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Campaign Strategist</p>
              </div>
              {activeAgent === "Max" && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium dark:bg-green-900/40 dark:text-green-300">
                  Active
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Strategy agent that develops comprehensive marketing campaign plans, timelines, and tactics.
            </p>
            
            <div className="mb-3">
              <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">Ideal for:</p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-300">Campaign Planning</span>
                <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-300">Marketing Strategy</span>
                <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-300">Launch Plans</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              "Ask me to plan a product launch or create a marketing campaign"
            </p>
          </div>
        </div>
      
        {/* Simplified Agent Interface */}
        <AnimatedCard hoverEffect="glow" className="mt-4 border-none">
          <div className="agent-interface">
            {activeAgent === "Matrix" ? (
              <div className="p-6 border bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  Matrix Messaging Creator
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium mb-1">
                      What type of messaging would you like to create?
                    </label>
                    <textarea
                      id="prompt"
                      placeholder="e.g., Create product messaging for our new AI-powered sales assistant that helps sales teams quickly identify leads and create personalized outreach..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 min-h-[100px]"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="audience" className="block text-sm font-medium mb-1">
                        Target Audience
                      </label>
                      <input
                        id="audience"
                        type="text"
                        placeholder="e.g., Sales managers at B2B SaaS companies"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tone" className="block text-sm font-medium mb-1">
                        Tone
                      </label>
                      <select
                        id="tone"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                      >
                        <option value="professional">Professional</option>
                        <option value="conversational">Conversational</option>
                        <option value="enthusiastic">Enthusiastic</option>
                        <option value="technical">Technical</option>
                        <option value="empathetic">Empathetic</option>
                        <option value="authoritative">Authoritative</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (!prompt) {
                          toast({
                            title: "Input required",
                            description: "Please enter a description of the messaging you want to create",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        setIsLoading(true);
                        setHasInteractedWithAgents(true);
                        
                        // Build the enhanced prompt with audience and tone
                        const enhancedPrompt = `
                          Create ${prompt}
                          ${audience ? `Target audience: ${audience}` : ''}
                          ${tone ? `Tone: ${tone}` : ''}
                        `;
                        
                        createMatrixMessaging(enhancedPrompt)
                          .then(result => {
                            if (result) {
                              setMatrixResult(result);
                              setHasGeneratedContent(true);
                              console.log("Matrix content generated:", result);
                            } else {
                              toast({
                                title: "Generation failed",
                                description: "Something went wrong during content generation. Please try again.",
                                variant: "destructive"
                              });
                            }
                          })
                          .catch(error => {
                            console.error("Error generating Matrix content:", error);
                            toast({
                              title: "Error",
                              description: "Failed to generate content. Please try again later.",
                              variant: "destructive"
                            });
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                      }}
                      disabled={isLoading}
                      variant={isLoading ? "outline" : "default"}
                      className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">
                            <Sparkles className="h-5 w-5" />
                          </span>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          <span>Generate Messaging</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : activeAgent === "Maven" ? (
              <div className="p-6 border bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-2">
                    <Search className="h-5 w-5 text-blue-500" />
                  </div>
                  Maven Research Assistant
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="researchTopic" className="block text-sm font-medium mb-1">
                      What would you like to research?
                    </label>
                    <textarea
                      id="researchTopic"
                      placeholder="e.g., Current trends in B2B SaaS marketing for 2025, or competitive analysis of project management tools..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 min-h-[100px]"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (!prompt) {
                          toast({
                            title: "Input required",
                            description: "Please enter a research topic or question",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        setIsLoading(true);
                        setHasInteractedWithAgents(true);
                        
                        runMavenResearch(prompt)
                          .then(result => {
                            console.log("Raw Maven research result:", result);
                            
                            // Handle different kinds of responses
                            try {
                              let processedResult = result;
                              
                              // Check for error state from our enhanced error handling
                              if (result.error === true) {
                                toast({
                                  title: "Research Service Issue",
                                  description: result.errorDetails || "The research service is temporarily unavailable. Please try again later.",
                                  variant: "destructive"
                                });
                                
                                // Still show the fallback result with error styling
                                setMavenResult(result);
                                setHasGeneratedContent(true);
                                return;
                              }
                              
                              // If the result is HTML (which happens in production sometimes)
                              if (typeof result === 'string' && 
                                  (result.includes('<!DOCTYPE') || result.includes('<html'))) {
                                // Create a fallback structured response
                                processedResult = {
                                  title: `Research: ${prompt.substring(0, 40)}...`,
                                  summary: "Our research system is experiencing temporary issues.",
                                  key_findings: [
                                    "The research system received an HTML response instead of data",
                                    "This is usually temporary and resolves quickly",
                                    "Please try your query again in a moment"
                                  ],
                                  trends: [],
                                  analysis: "The research system is currently unable to provide detailed analysis. This is typically a temporary issue. Please try again with your query in a few moments.",
                                  recommendations: [
                                    "Try your query again in a few moments",
                                    "Be more specific with your research question",
                                    "Try a different topic if the issue persists"
                                  ],
                                  sources: []
                                };
                              }
                              
                              // If the result is a string (which might happen with JSON parsing issues)
                              if (typeof result === 'string' && !result.includes('<!DOCTYPE') && !result.includes('<html')) {
                                try {
                                  processedResult = JSON.parse(result);
                                  console.log("Parsed string to JSON:", processedResult);
                                } catch (e) {
                                  console.error("Failed to parse result string as JSON:", e);
                                  // Create a minimal structure with the string as analysis
                                  processedResult = {
                                    title: `Research: ${prompt}`,
                                    summary: "Research completed with formatting issues.",
                                    key_findings: ["The research data was received but had formatting issues"],
                                    trends: [],
                                    analysis: result, // Use the full string as analysis
                                    recommendations: ["Try again with more specific query"],
                                    sources: []
                                  };
                                }
                              }
                              
                              // Add minimal default properties if they're missing
                              const enhancedResult = {
                                title: processedResult?.title || processedResult?.Title || prompt.substring(0, 50) + "...",
                                summary: processedResult?.summary || processedResult?.Summary || "",
                                key_findings: processedResult?.key_findings || processedResult?.["Key Findings"] || [],
                                trends: processedResult?.trends || processedResult?.Trends || processedResult?.["Market Trends"] || [],
                                analysis: processedResult?.analysis || processedResult?.Analysis || "Research completed, but detailed analysis is not available.",
                                recommendations: processedResult?.recommendations || processedResult?.Recommendations || [],
                                sources: processedResult?.sources || processedResult?.Sources || []
                              };
                              
                              console.log("Enhanced Maven result:", enhancedResult);
                              setMavenResult(enhancedResult);
                              setHasGeneratedContent(true);
                              console.log("Maven research generated successfully");
                            } catch (error) {
                              console.error("Error processing Maven result:", error);
                              toast({
                                title: "Research processing error",
                                description: "There was an issue processing the research results. Please try again.",
                                variant: "destructive"
                              });
                            }
                          })
                          .catch(error => {
                            console.error("Error generating Maven research:", error);
                            toast({
                              title: "Error",
                              description: "Failed to generate research. Please try again later.",
                              variant: "destructive"
                            });
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                      }}
                      disabled={isLoading}
                      variant={isLoading ? "outline" : "default"}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">
                            <Search className="h-5 w-5" />
                          </span>
                          <span>Researching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          <span>Generate Research</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : activeAgent === "Max" ? (
              <div className="p-6 border bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 mr-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                  </div>
                  Max Campaign Planner
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="campaignBrief" className="block text-sm font-medium mb-1">
                      What kind of campaign would you like to plan?
                    </label>
                    <textarea
                      id="campaignBrief"
                      placeholder="e.g., Plan a product launch campaign for our new AI-powered marketing platform targeting SMB marketing teams. Include social media, email, and content marketing tactics..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-900 min-h-[100px]"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="audience" className="block text-sm font-medium mb-1">
                        Target Audience
                      </label>
                      <input
                        id="audience"
                        type="text"
                        placeholder="e.g., Marketing teams at B2B SaaS companies"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-900"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="campaignDuration" className="block text-sm font-medium mb-1">
                        Campaign Duration (weeks)
                      </label>
                      <select
                        id="campaignDuration"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-green-500 dark:bg-gray-900"
                        defaultValue="4"
                      >
                        <option value="2">2 weeks</option>
                        <option value="4">4 weeks</option>
                        <option value="6">6 weeks</option>
                        <option value="8">8 weeks</option>
                        <option value="12">12 weeks</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        if (!prompt) {
                          toast({
                            title: "Input required",
                            description: "Please enter details for the campaign you want to plan",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        setIsLoading(true);
                        setHasInteractedWithAgents(true);
                        
                        // Build the enhanced prompt with audience
                        const enhancedPrompt = `
                          Plan a campaign: ${prompt}
                          ${audience ? `Target audience: ${audience}` : ''}
                        `;
                        
                        planMaxCampaign(enhancedPrompt)
                          .then(result => {
                            if (result) {
                              setMaxResult(result);
                              setHasGeneratedContent(true);
                              console.log("Max campaign plan generated:", result);
                            } else {
                              toast({
                                title: "Campaign planning failed",
                                description: "Something went wrong during campaign generation. Please try again.",
                                variant: "destructive"
                              });
                            }
                          })
                          .catch(error => {
                            console.error("Error generating campaign plan:", error);
                            toast({
                              title: "Error",
                              description: "Failed to generate campaign plan. Please try again later.",
                              variant: "destructive"
                            });
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                      }}
                      disabled={isLoading}
                      variant={isLoading ? "outline" : "default"}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">
                            <BarChart3 className="h-5 w-5" />
                          </span>
                          <span>Planning...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-5 w-5 mr-2" />
                          <span>Generate Campaign</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow">
                <h2 className="text-xl font-semibold mb-4">Agent Selection</h2>
                <p className="mb-4">
                  Please select Matrix, Maven, or Max from the options above to get started.
                </p>
              </div>
            )}
          </div>
        </AnimatedCard>
        
        {/* Enhanced Matrix Output Display */}
        {activeAgent === "Matrix" && matrixResult && matrixResult.headline && (
          <div className="mt-8 mb-12 shadow-lg border-2 border-primary/20 rounded-lg overflow-hidden">
            <div className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 p-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-400 dark:to-purple-300">
                {matrixResult.headline}
              </h3>
              {matrixResult.tagline && (
                <p className="text-md italic font-medium text-purple-600 dark:text-purple-300 mt-1">{matrixResult.tagline}</p>
              )}
            </div>
            
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main content - 8 columns on medium+ screens */}
                <div className="md:col-span-8 space-y-6">
                  {matrixResult.value_proposition && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500">
                      <h3 className="text-sm uppercase font-semibold text-blue-700 dark:text-blue-300 mb-2">Value Proposition</h3>
                      <p className="text-blue-900 dark:text-blue-100">{matrixResult.value_proposition}</p>
                    </div>
                  )}
                  
                  {matrixResult.key_messages && matrixResult.key_messages.length > 0 && (
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500">
                      <h3 className="text-sm uppercase font-semibold text-purple-700 dark:text-purple-300 mb-2">Key Messages</h3>
                      <ul className="ml-5 space-y-2 list-disc text-purple-900 dark:text-purple-100">
                        {matrixResult.key_messages.map((message: string, idx: number) => (
                          <li key={idx}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {matrixResult.call_to_action && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500">
                      <h3 className="text-sm uppercase font-semibold text-green-700 dark:text-green-300 mb-2">Call to Action</h3>
                      <p className="font-medium text-green-900 dark:text-green-100">{matrixResult.call_to_action}</p>
                    </div>
                  )}
                </div>
                
                {/* Sidebar content - 4 columns on medium+ screens */}
                <div className="md:col-span-4 space-y-6">
                  {/* Target Audience Box */}
                  <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                    <h3 className="text-sm uppercase font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Target Audience</h3>
                    <p className="text-indigo-900 dark:text-indigo-100">{audience || "Not specified"}</p>
                  </div>
                  
                  {/* Social Proof/Differentiators Box */}
                  <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                    <h3 className="text-sm uppercase font-semibold text-teal-700 dark:text-teal-300 mb-2">Differentiators</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-100 dark:bg-teal-900 mr-2">
                          <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <p className="text-sm text-teal-900 dark:text-teal-100">Unique messaging that stands out</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-100 dark:bg-teal-900 mr-2">
                          <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <p className="text-sm text-teal-900 dark:text-teal-100">Professionally crafted by AI</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tone Notes */}
                  {matrixResult.tone_notes && (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <h3 className="text-sm uppercase font-semibold text-amber-700 dark:text-amber-300 mb-2">Tone Notes</h3>
                      <p className="text-sm text-amber-900 dark:text-amber-100">{matrixResult.tone_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-4 gap-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const textContent = `
# ${matrixResult.headline}
${matrixResult.tagline ? `## ${matrixResult.tagline}\n\n` : ''}
${matrixResult.value_proposition ? `${matrixResult.value_proposition}\n\n` : ''}
${matrixResult.key_messages && matrixResult.key_messages.length > 0 ? 
  `### Key Messages:\n${matrixResult.key_messages.map((msg: string) => `- ${msg}`).join('\n')}\n\n` : ''}
${matrixResult.call_to_action ? `### Call to Action:\n${matrixResult.call_to_action}\n\n` : ''}
${matrixResult.tone_notes ? `### Tone Notes:\n${matrixResult.tone_notes}` : ''}
                  `.trim();
                  
                  navigator.clipboard.writeText(textContent);
                  toast({
                    title: "Copied to clipboard",
                    description: "The content has been copied to your clipboard",
                  });
                }}
                className="hover:bg-purple-100 border border-purple-300"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Text
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const element = document.createElement("a");
                  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${matrixResult.headline}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
      background-color: white;
    }
    .headline {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .tagline {
      font-size: 18px;
      font-weight: normal;
      margin-top: 10px;
      font-style: italic;
      opacity: 0.9;
    }
    .value-proposition {
      font-size: 16px;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .key-messages {
      margin-bottom: 25px;
    }
    .key-messages h3 {
      font-size: 18px;
      color: #2d3748;
      margin-bottom: 10px;
    }
    .key-messages ul {
      padding-left: 20px;
    }
    .key-messages li {
      margin-bottom: 10px;
    }
    .cta {
      font-size: 18px;
      font-weight: bold;
      color: #2c5282;
      margin: 25px 0;
    }
    .tone-notes {
      background-color: #f7fafc;
      padding: 15px;
      border-radius: 6px;
      font-size: 14px;
    }
    .audience {
      margin-bottom: 20px;
      font-size: 16px;
    }
    .audience strong {
      color: #4a5568;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #718096;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="headline">${matrixResult.headline}</h1>
      ${matrixResult.tagline ? `<p class="tagline">${matrixResult.tagline}</p>` : ''}
    </div>
    <div class="content">
      ${audience ? `
      <div class="audience">
        <strong>Target Audience:</strong> ${audience}
      </div>
      ` : ''}

      ${matrixResult.value_proposition ? `
      <div class="value-proposition">
        ${matrixResult.value_proposition}
      </div>
      ` : ''}
      
      ${matrixResult.key_messages && matrixResult.key_messages.length > 0 ? `
      <div class="key-messages">
        <h3>Key Messages</h3>
        <ul>
          ${matrixResult.key_messages.map((message: string) => `<li>${message}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${matrixResult.call_to_action ? `
      <div class="cta">
        ${matrixResult.call_to_action}
      </div>
      ` : ''}
      
      ${matrixResult.tone_notes ? `
      <div class="tone-notes">
        <strong>Tone Notes:</strong><br>
        ${matrixResult.tone_notes}
      </div>
      ` : ''}
      
      <div class="footer">
        Generated by IntellaOne Marketing Platform - ${new Date().toLocaleDateString()}
      </div>
    </div>
  </div>
</body>
</html>`;

                  const file = new Blob([content], { type: 'text/html' });
                  element.href = URL.createObjectURL(file);
                  element.download = `${matrixResult.headline.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_messaging.html`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);

                  toast({
                    title: "Downloaded successfully",
                    description: "Content has been downloaded as an HTML file",
                  });
                }}
                className="hover:bg-purple-100 border border-purple-300"
              >
                <Download className="h-4 w-4 mr-2" /> Download HTML
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleSaveContent(matrixResult)}
                className="hover:bg-purple-100 border border-purple-300"
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        )}
        
        {/* Maven Research Output Display */}
        {activeAgent === "Maven" && mavenResult && (
          <div className="mt-8 mb-12 shadow-lg border-2 border-primary/20 rounded-lg overflow-hidden">
            <div className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 p-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300">
                Research Report: {mavenResult.title || prompt}
              </h3>
              {mavenResult.summary && (
                <p className="text-md italic font-medium text-blue-600 dark:text-blue-300 mt-1">{mavenResult.summary}</p>
              )}
            </div>
            
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
              {/* Key Findings */}
              {mavenResult.key_findings && mavenResult.key_findings.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500">
                  <h3 className="text-sm uppercase font-semibold text-blue-700 dark:text-blue-300 mb-2">Key Findings</h3>
                  <ul className="ml-5 space-y-2 list-disc text-blue-900 dark:text-blue-100">
                    {mavenResult.key_findings.map((finding: string, idx: number) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Trends */}
              {mavenResult.trends && mavenResult.trends.length > 0 && (
                <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border-l-4 border-teal-500">
                  <h3 className="text-sm uppercase font-semibold text-teal-700 dark:text-teal-300 mb-2">Market Trends</h3>
                  <ul className="ml-5 space-y-2 list-disc text-teal-900 dark:text-teal-100">
                    {mavenResult.trends.map((trend: string, idx: number) => (
                      <li key={idx}>{trend}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Analysis */}
              {mavenResult.analysis && (
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-indigo-500">
                  <h3 className="text-sm uppercase font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Analysis</h3>
                  <div className="text-indigo-900 dark:text-indigo-100 prose dark:prose-invert max-w-none">
                    {typeof mavenResult.analysis === 'string' ? (
                      // Format the analysis text by splitting into paragraphs
                      mavenResult.analysis.split('\n\n').map((paragraph: string, i: number) => (
                        <p key={i} className="mb-4">{paragraph}</p>
                      ))
                    ) : (
                      Object.entries(mavenResult.analysis).map(([section, content]: [string, any], idx: number) => (
                        <div key={idx} className="mb-6 pb-4 border-b border-indigo-200 dark:border-indigo-800">
                          <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2 text-lg">
                            {section !== "0" && section !== "1" && section !== "2" && section !== "3" && section !== "4" ? section : `Key Insight ${Number(section) + 1}`}
                          </h4>
                          <p>{String(content)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {mavenResult.recommendations && mavenResult.recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500">
                  <h3 className="text-sm uppercase font-semibold text-green-700 dark:text-green-300 mb-2">Recommendations</h3>
                  <ul className="ml-5 space-y-2 list-disc text-green-900 dark:text-green-100">
                    {mavenResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Sources */}
              {mavenResult.sources && mavenResult.sources.length > 0 && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border-l-4 border-gray-500">
                  <h3 className="text-sm uppercase font-semibold text-gray-700 dark:text-gray-300 mb-2">Sources</h3>
                  <ul className="ml-5 space-y-2 list-disc text-gray-900 dark:text-gray-100">
                    {mavenResult.sources.map((source: {title: string, url: string}, idx: number) => (
                      <li key={idx}>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        >
                          {source.title} <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-4 gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Create a text version of the research
                  const textContent = `
# Research Report: ${mavenResult.title || prompt}
${mavenResult.summary ? `\n${mavenResult.summary}\n` : ''}

${mavenResult.key_findings && mavenResult.key_findings.length > 0 ? 
  `## Key Findings\n${mavenResult.key_findings.map((finding: string) => `- ${finding}`).join('\n')}\n\n` : ''}

${mavenResult.trends && mavenResult.trends.length > 0 ? 
  `## Market Trends\n${mavenResult.trends.map((trend: string) => `- ${trend}`).join('\n')}\n\n` : ''}

${mavenResult.analysis ? `## Analysis\n${typeof mavenResult.analysis === 'string' ? 
  mavenResult.analysis : 
  Object.entries(mavenResult.analysis)
    .map(([section, content]: [string, any]) => `### ${section}\n${String(content)}`)
    .join('\n\n')
  }\n\n` : ''}
  
${mavenResult.recommendations && mavenResult.recommendations.length > 0 ? 
  `## Recommendations\n${mavenResult.recommendations.map((rec: string) => `- ${rec}`).join('\n')}` : ''}
                  `.trim();
                  
                  navigator.clipboard.writeText(textContent);
                  toast({
                    title: "Copied to clipboard",
                    description: "The research content has been copied to your clipboard",
                  });
                }}
                className="hover:bg-blue-100 border border-blue-300"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Text
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleSaveContent(mavenResult)}
                className="hover:bg-blue-100 border border-blue-300"
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        )}
        
        {/* Max Campaign Plan Output Display */}
        {activeAgent === "Max" && maxResult && (
          <div className="mt-8 mb-12 shadow-lg border-2 border-primary/20 rounded-lg overflow-hidden">
            <div className="pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 p-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500 dark:from-green-400 dark:to-green-300">
                Campaign Plan: {maxResult.title || prompt}
              </h3>
              {maxResult.summary && (
                <p className="text-md italic font-medium text-green-600 dark:text-green-300 mt-1">{maxResult.summary}</p>
              )}
            </div>
            
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
              {/* Campaign Overview */}
              {maxResult.overview && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500">
                  <h3 className="text-sm uppercase font-semibold text-green-700 dark:text-green-300 mb-2">Campaign Overview</h3>
                  <p className="text-green-900 dark:text-green-100">{maxResult.overview}</p>
                </div>
              )}
              
              {/* Target Audience */}
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-indigo-500">
                <h3 className="text-sm uppercase font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Target Audience</h3>
                <p className="text-indigo-900 dark:text-indigo-100">{audience || (maxResult.target_audience || "Not specified")}</p>
              </div>
              
              {/* Key Objectives */}
              {maxResult.objectives && maxResult.objectives.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500">
                  <h3 className="text-sm uppercase font-semibold text-blue-700 dark:text-blue-300 mb-2">Campaign Objectives</h3>
                  <ul className="ml-5 space-y-2 list-disc text-blue-900 dark:text-blue-100">
                    {maxResult.objectives.map((objective: string, idx: number) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Campaign Tactics */}
              {maxResult.tactics && maxResult.tactics.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500">
                  <h3 className="text-sm uppercase font-semibold text-amber-700 dark:text-amber-300 mb-2">Campaign Tactics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {maxResult.tactics.map((tactic: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-md shadow">
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">{tactic.channel || `Tactic ${idx + 1}`}</h4>
                        <p className="text-sm text-amber-900 dark:text-amber-100">{tactic.description || tactic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Timeline */}
              {maxResult.timeline && (
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500">
                  <h3 className="text-sm uppercase font-semibold text-purple-700 dark:text-purple-300 mb-2">Campaign Timeline</h3>
                  <div className="relative">
                    {/* Timeline visualization */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-300 dark:bg-purple-700"></div>
                    
                    <div className="space-y-4 ml-10">
                      {typeof maxResult.timeline === 'string' ? (
                        <p className="text-purple-900 dark:text-purple-100">{maxResult.timeline}</p>
                      ) : (
                        Array.isArray(maxResult.timeline) ? 
                          maxResult.timeline.map((phase: any, idx: number) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-10 mt-1 w-6 h-6 rounded-full bg-purple-300 dark:bg-purple-700 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{idx + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">
                                  {phase.name || phase.phase || `Week ${idx + 1}`}
                                </h4>
                                <p className="text-sm text-purple-900 dark:text-purple-100">
                                  {phase.description || phase.activities || String(phase)}
                                </p>
                              </div>
                            </div>
                          )) :
                          Object.entries(maxResult.timeline).map(([phase, activities]: [string, any], idx: number) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-10 mt-1 w-6 h-6 rounded-full bg-purple-300 dark:bg-purple-700 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{idx + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">{phase}</h4>
                                <p className="text-sm text-purple-900 dark:text-purple-100">{String(activities)}</p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* KPIs & Metrics */}
              {(maxResult.kpis || maxResult.metrics) && (
                <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border-l-4 border-teal-500">
                  <h3 className="text-sm uppercase font-semibold text-teal-700 dark:text-teal-300 mb-2">KPIs & Success Metrics</h3>
                  <ul className="ml-5 space-y-2 list-disc text-teal-900 dark:text-teal-100">
                    {(maxResult.kpis || maxResult.metrics || []).map((metric: string, idx: number) => (
                      <li key={idx}>{metric}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-4 gap-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const textContent = `
# Campaign Plan: ${maxResult.title || prompt}
${maxResult.summary ? `\n${maxResult.summary}\n\n` : ''}

${maxResult.overview ? `## Campaign Overview\n${maxResult.overview}\n\n` : ''}

## Target Audience
${audience || (maxResult.target_audience || "Not specified")}

${maxResult.objectives && maxResult.objectives.length > 0 ? 
  `## Campaign Objectives\n${maxResult.objectives.map((obj: string) => `- ${obj}`).join('\n')}\n\n` : ''}

${maxResult.tactics && maxResult.tactics.length > 0 ? 
  `## Campaign Tactics\n${maxResult.tactics.map((tactic: any) => 
    `- ${tactic.channel || 'Tactic'}: ${tactic.description || tactic}`
  ).join('\n')}\n\n` : ''}

${maxResult.timeline ? `## Campaign Timeline\n${
  typeof maxResult.timeline === 'string' ? maxResult.timeline :
  Array.isArray(maxResult.timeline) ?
    maxResult.timeline.map((phase: any, idx: number) => 
      `### ${phase.name || phase.phase || `Week ${idx + 1}`}\n${phase.description || phase.activities || String(phase)}`
    ).join('\n\n') :
    Object.entries(maxResult.timeline).map(([phase, activities]: [string, any]) => 
      `### ${phase}\n${String(activities)}`
    ).join('\n\n')
}\n\n` : ''}

${(maxResult.kpis || maxResult.metrics) ? 
  `## KPIs & Success Metrics\n${(maxResult.kpis || maxResult.metrics || []).map((metric: string) => `- ${metric}`).join('\n')}` : ''}
                  `.trim();
                  
                  navigator.clipboard.writeText(textContent);
                  toast({
                    title: "Copied to clipboard",
                    description: "The campaign plan has been copied to your clipboard",
                  });
                }}
                className="hover:bg-green-100 border border-green-300"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Text
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleSaveContent(maxResult)}
                className="hover:bg-green-100 border border-green-300"
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicAppShell>
  );
}