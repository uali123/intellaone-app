import { useState } from "react";
import { 
  runMavenResearch, 
  createMatrixMessaging, 
  createMatrixDocument,
  planMaxCampaign,
  AgentName,
  AgentParams
} from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MagicWandButton } from "@/components/ui/magic-wand-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import MatrixResultDisplay from "./matrix-result-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrainCircuit,
  FileText,
  Globe,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Save,
  Copy,
  Share2,
  Lightbulb,
  MousePointerClick,
  ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface AgentInterfaceProps {
  defaultAgent?: AgentName;
  onResult?: (result: any) => void;
  onSave?: (content: any) => void;
}

export default function AgentInterface({ 
  defaultAgent = "Matrix", 
  onResult, 
  onSave 
}: AgentInterfaceProps) {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<AgentName>(defaultAgent);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [activeExampleType, setActiveExampleType] = useState<string>("");
  const [params, setParams] = useState<AgentParams>({
    contentType: "email",
    tone: "professional",
    targetAudience: "business professionals",
    brandStyle: "modern",
  });
  
  // Example prompts for each agent
  const examplePrompts = {
    Maven: [
      {
        title: "Competitor Analysis",
        prompt: "Research the top 5 enterprise CRM solutions focusing on pricing models, key features, and customer satisfaction scores.",
        params: {
          targetAudience: "Enterprise SaaS companies",
          additionalContext: "Focus on AI capabilities and integration features"
        }
      },
      {
        title: "Market Trend Analysis",
        prompt: "Research emerging trends in digital marketing automation for B2B companies in 2025.",
        params: {
          targetAudience: "B2B Marketing Teams",
          additionalContext: "Focus on ROI metrics and efficiency gains"
        }
      }
    ],
    Matrix: [
      {
        title: "Product Launch Messaging",
        prompt: "Create core messaging for our new AI-powered content creation platform that helps marketing teams generate personalized content 10x faster.",
        params: {
          targetAudience: "Marketing Directors at Fortune 500 companies",
          tone: "professional",
          brandStyle: "innovative, trustworthy, cutting-edge"
        }
      },
      {
        title: "Value Proposition",
        prompt: "Develop a clear value proposition for our data analytics dashboard that provides real-time insights for e-commerce businesses.",
        params: {
          targetAudience: "E-commerce business owners",
          tone: "confident",
          brandStyle: "straightforward, valuable, solution-oriented"
        }
      }
    ],
    Matrix: [
      {
        title: "Product Launch Messaging",
        prompt: "Create core messaging for our new AI-powered content creation platform that helps marketing teams generate personalized content 10x faster.",
        params: {
          targetAudience: "Marketing Directors at Fortune 500 companies",
          tone: "professional",
          brandStyle: "innovative, trustworthy, cutting-edge"
        }
      },
      {
        title: "Value Proposition",
        prompt: "Develop a clear value proposition for our data analytics dashboard that provides real-time insights for e-commerce businesses.",
        params: {
          targetAudience: "E-commerce business owners",
          tone: "confident",
          brandStyle: "straightforward, valuable, solution-oriented"
        }
      },
      {
        title: "Executive Summary",
        prompt: "Write an executive summary for our Q2 marketing performance report highlighting our 35% growth in qualified leads.",
        params: {
          contentType: "report",
          tone: "professional",
          targetAudience: "C-suite executives",
          brandStyle: "data-driven, concise, impactful"
        }
      },
      {
        title: "Product Description",
        prompt: "Create a compelling product description for our new project management software that emphasizes its AI-powered task prioritization.",
        params: {
          contentType: "product description",
          tone: "enthusiastic",
          targetAudience: "Team managers and project leaders",
          brandStyle: "helpful, efficient, modern"
        }
      }
    ],
    Max: [
      {
        title: "Product Launch Campaign",
        prompt: "Create a 90-day campaign plan for launching our new mobile app that helps users track and reduce their carbon footprint.",
        params: {
          campaignGoal: "10,000 app downloads in first month",
          targetAudience: "Environmentally conscious millennials",
          channels: "Social media, email, content marketing"
        }
      },
      {
        title: "Lead Generation Campaign",
        prompt: "Develop a B2B lead generation campaign for our enterprise cybersecurity solution.",
        params: {
          campaignGoal: "Generate 200 qualified leads",
          targetAudience: "IT Directors and CISOs",
          channels: "Webinars, white papers, LinkedIn"
        }
      }
    ]
  };

  // Function to load an example prompt
  const loadExample = (agent: AgentName, example: any) => {
    setPrompt(example.prompt);
    setParams({...params, ...example.params});
    setActiveExampleType("");
    
    toast({
      title: "Example loaded",
      description: `${example.title} example has been loaded. Customize it or run as-is.`,
    });
  };

  // Get agent icon
  const getAgentIcon = (agent: AgentName) => {
    switch (agent) {
      case "Maven":
        return <Globe className="h-5 w-5" />;
      case "Matrix":
        return <MessageSquare className="h-5 w-5" />;
      case "Max":
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <BrainCircuit className="h-5 w-5" />;
    }
  };

  // Get agent color
  const getAgentColor = (agent: AgentName): string => {
    switch (agent) {
      case "Maven":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "Matrix":
        return "text-purple-500 bg-purple-50 dark:bg-purple-900/20";
      case "Max":
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
      default:
        return "text-primary bg-primary-50 dark:bg-primary-900/20";
    }
  };

  // Generate content with the selected agent
  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please provide a detailed prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let response;

      switch (selectedAgent) {
        case "Maven":
          response = await runMavenResearch(prompt, params);
          break;
        case "Matrix":
          // If content type parameter is provided, use document creation
          if (params.contentType && params.contentType !== "messaging") {
            response = await createMatrixDocument(prompt, params.contentType, params);
          } else {
            response = await createMatrixMessaging(prompt, params);
          }
          break;
        case "Max":
          response = await planMaxCampaign(prompt, params);
          break;
        default:
          throw new Error("Invalid agent selected");
      }

      setResult(response);
      
      // Call onResult callback if provided
      if (onResult) {
        onResult(response);
      }

      toast({
        title: "Content generated",
        description: `${selectedAgent} successfully created your content.`,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle saving content
  const handleSave = () => {
    if (!result) return;
    
    if (onSave) {
      onSave(result);
      toast({
        title: "Content saved",
        description: "Your generated content has been saved successfully.",
      });
    }
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    if (!result) return;
    
    const textToCopy = typeof result === 'string' 
      ? result 
      : JSON.stringify(result, null, 2);
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard.",
        });
      })
      .catch(err => {
        toast({
          title: "Copy failed",
          description: "Failed to copy content to clipboard.",
          variant: "destructive",
        });
      });
  };

  // Render content based on result type and selected agent
  const renderContent = () => {
    if (!result) return null;

    // Helper function to render object properties
    const renderObject = (obj: any, depth = 0) => {
      if (!obj || typeof obj !== 'object') return null;
      
      return (
        <div className={`space-y-${depth > 0 ? '2' : '4'} pl-${depth > 0 ? depth * 2 : '0'}`}>
          {Object.entries(obj).map(([key, value]) => {
            // Skip rendering if value is null or undefined
            if (value === null || value === undefined) return null;
            
            // Format the key for display
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
            
            // Render based on value type
            if (Array.isArray(value)) {
              return (
                <div key={key} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{formattedKey}</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 pl-2">
                    {(value as any[]).map((item, index) => (
                      <li key={index}>
                        {typeof item === 'object' ? renderObject(item, depth + 1) : item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else if (typeof value === 'object') {
              return (
                <div key={key} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{formattedKey}</h4>
                  {renderObject(value, depth + 1)}
                </div>
              );
            } else {
              return (
                <div key={key} className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{formattedKey}</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    {String(value)}
                  </div>
                </div>
              );
            }
          })}
        </div>
      );
    };

    // Determine how to render based on agent type
    switch (selectedAgent) {
      case "Maven":
        return renderObject(result);
      case "Matrix":
        // Use our new MatrixResultDisplay component for better formatting
        return <MatrixResultDisplay result={result} />;
      case "Max":
        if (result.sections) {
          return (
            <div className="space-y-6">
              {result.title && (
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.title}</h3>
                </div>
              )}
              {result.sections.map((section: any, index: number) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{section.heading}</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}
              {result.summary && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Summary</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    {result.summary}
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          return renderObject(result);
        }
      default:
        return (
          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm text-gray-700 dark:text-gray-300 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent selection tabs */}
      <Tabs value={selectedAgent} onValueChange={(value) => setSelectedAgent(value as AgentName)}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="Maven">
            <Globe className="h-4 w-4 mr-2" />
            Maven
          </TabsTrigger>
          <TabsTrigger value="Matrix">
            <MessageSquare className="h-4 w-4 mr-2" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="Max">
            <BarChart3 className="h-4 w-4 mr-2" />
            Max
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Maven">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${getAgentColor("Maven")} flex items-center justify-center mr-2`}>
                  <Globe className="h-5 w-5" />
                </div>
                Maven - Research Specialist
              </CardTitle>
              <CardDescription>
                Conducts market research, analyzes competitors, and identifies trends to inform your marketing strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What would you like Maven to research?
                  </label>
                  <Textarea
                    placeholder="E.g., Research the enterprise SaaS market for project management tools, focusing on key competitors, market trends, and customer pain points"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Industry
                    </label>
                    <Input
                      placeholder="E.g., FinTech, Healthcare, Retail"
                      value={params.targetAudience || ""}
                      onChange={(e) => setParams({...params, targetAudience: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Context
                    </label>
                    <Input
                      placeholder="Any specific details to focus on"
                      value={params.additionalContext || ""}
                      onChange={(e) => setParams({...params, additionalContext: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col items-stretch gap-3">
              <div className="flex justify-between items-center gap-3">
                <MagicWandButton 
                  onClick={generateContent} 
                  disabled={loading || !prompt.trim()}
                  variant="brand"
                  className="flex-1"
                >
                  {loading ? "Researching..." : "Begin Research"}
                </MagicWandButton>
                
                <ShimmerButton
                  variant="outline"
                  size="icon"
                  shimmerColor="rgba(90, 60, 255, 0.1)"
                  onClick={() => {
                    setActiveExampleType("Maven");
                    setShowExampleModal(true);
                  }}
                  className="flex-none"
                  title="See research examples"
                >
                  <Lightbulb className="h-4 w-4 text-primary" />
                </ShimmerButton>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="Matrix">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${getAgentColor("Matrix")} flex items-center justify-center mr-2`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                Matrix - Content Creator
              </CardTitle>
              <CardDescription>
                Creates compelling messaging, positioning, and documents with persona-based tone control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What messaging would you like Matrix to create?
                  </label>
                  <Textarea
                    placeholder="E.g., Create messaging for our new AI-powered analytics platform that helps marketing teams track campaign performance in real-time"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Audience
                    </label>
                    <Input
                      placeholder="E.g., Marketing Directors, CMOs"
                      value={params.targetAudience || ""}
                      onChange={(e) => setParams({...params, targetAudience: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tone
                    </label>
                    <Select
                      value={params.tone || "professional"}
                      onValueChange={(value) => setParams({...params, tone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand Style
                  </label>
                  <Input
                    placeholder="E.g., Modern, Innovative, Trustworthy"
                    value={params.brandStyle || ""}
                    onChange={(e) => setParams({...params, brandStyle: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button onClick={generateContent} disabled={loading || !prompt.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Messaging...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate Messaging
                  </>
                )}
              </Button>
              
              <ShimmerButton
                variant="outline"
                shimmerColor="rgba(147, 51, 234, 0.1)"
                onClick={() => {
                  setActiveExampleType("Matrix");
                  setShowExampleModal(true);
                }}
                className="w-full flex justify-center items-center gap-2"
                title="See messaging examples"
              >
                <Lightbulb className="h-4 w-4 text-purple-500" />
                See Messaging Examples
              </ShimmerButton>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="Max">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${getAgentColor("Max")} flex items-center justify-center mr-2`}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                Max - Campaign Planner
              </CardTitle>
              <CardDescription>
                Creates comprehensive marketing campaign plans across multiple channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What campaign would you like Max to plan?
                  </label>
                  <Textarea
                    placeholder="E.g., Create a marketing campaign for our new AI analytics platform targeting marketing directors in financial services"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campaign Goal
                    </label>
                    <Input
                      placeholder="E.g., Increase brand awareness, generate leads"
                      value={params.campaignGoal || ""}
                      onChange={(e) => setParams({...params, campaignGoal: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Audience
                    </label>
                    <Input
                      placeholder="E.g., IT Managers, CISOs"
                      value={params.targetAudience || ""}
                      onChange={(e) => setParams({...params, targetAudience: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tone
                    </label>
                    <Input
                      placeholder="E.g., Professional, Technical"
                      value={params.tone || ""}
                      onChange={(e) => setParams({...params, tone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand Style
                    </label>
                    <Input
                      placeholder="E.g., Enterprise, Modern"
                      value={params.brandStyle || ""}
                      onChange={(e) => setParams({...params, brandStyle: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button onClick={generateContent} disabled={loading || !prompt.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Campaign Plan...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Campaign Plan
                  </>
                )}
              </Button>
              
              <ShimmerButton
                variant="outline"
                shimmerColor="rgba(245, 158, 11, 0.1)"
                onClick={() => {
                  setActiveExampleType("Max");
                  setShowExampleModal(true);
                }}
                className="w-full flex justify-center items-center gap-2"
                title="See campaign examples"
              >
                <Lightbulb className="h-4 w-4 text-green-500" />
                See Campaign Examples
              </ShimmerButton>
            </CardFooter>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${getAgentColor(selectedAgent)} flex items-center justify-center mr-2`}>
                  {getAgentIcon(selectedAgent)}
                </div>
                {selectedAgent} Output
              </CardTitle>
              <CardDescription>
                Generated content based on your prompt
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={generateContent} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Regenerate
              </Button>
              {onSave && (
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 overflow-auto max-h-[500px]">
              {renderContent()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>,

    {/* Examples Modal */}
    <Dialog open={showExampleModal} onOpenChange={setShowExampleModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            {activeExampleType === "Maven" && "Research Examples"}
            {activeExampleType === "Matrix" && "Content Examples"}
            {activeExampleType === "Max" && "Campaign Examples"}
          </DialogTitle>
          <DialogDescription>
            Select an example to load it into the editor
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {activeExampleType && examplePrompts[activeExampleType as AgentName]?.map((example, index) => (
            <Card key={index} className="cursor-pointer hover:bg-accent/20 transition-colors">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{example.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{example.prompt}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    loadExample(activeExampleType as AgentName, example);
                    setShowExampleModal(false);
                  }}
                >
                  Use This Example
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExampleModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}