import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAi } from "@/hooks/use-ai";
import { AiProvider } from "@/hooks/use-ai";
import { generateAiContent, generateVariations } from "@/lib/mock-api";

import AppShell from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Copy,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Edit,
  SquareAsterisk,
  FileText,
  Mail,
  Presentation,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAiDraftSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Extend the schema for form validation
const aiGeneratorFormSchema = insertAiDraftSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  brief: z.string().min(10, "Brief must be at least 10 characters").max(2000),
  type: z.enum(["email", "landing-page", "ad-copy", "product-brochure"], {
    required_error: "Please select a content type",
  }),
  targetAudience: z.string().min(2, "Please specify the target audience").max(100),
  tone: z.string().min(2, "Please specify the tone").max(100),
  brandStyle: z.string().min(2, "Please specify the brand style").max(100),
});

type AiGeneratorFormValues = z.infer<typeof aiGeneratorFormSchema>;

export default function AiGeneratorPage() {
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  
  // Check for free trial mode on component mount
  useEffect(() => {
    const freeTrial = localStorage.getItem('free-trial-mode') === 'true';
    setIsFreeTrial(freeTrial);
    console.log('Free trial mode:', freeTrial);
  }, []);
  
  return (
    <AiProvider>
      <AiGeneratorContent isFreeTrial={isFreeTrial} />
    </AiProvider>
  );
}

function AiGeneratorContent({ isFreeTrial = false }: { isFreeTrial?: boolean }) {
  const [location] = useLocation();
  const { toast } = useToast();
  // Try to use AI context safely
  const aiContext = (() => {
    try {
      return useAi();
    } catch (e) {
      console.error("AI provider not available:", e);
      return {
        drafts: [],
        isLoading: false,
        error: null,
        createDraftMutation: {
          mutateAsync: async () => {
            toast({
              title: "Free Trial Mode",
              description: "This is a demo. Sign up for full functionality.",
            });
            return null;
          },
          isPending: false,
        },
        pollingEnabled: false,
        setPollingEnabled: () => {},
      };
    }
  })();
  
  const { drafts, createDraftMutation } = aiContext;
  const [activeTab, setActiveTab] = useState<string>("create");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

  // Extract draft ID from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('draft');
    if (id) {
      setDraftId(id);
      setActiveTab("results");
    }
  }, [location]);

  // Form for creating AI content
  const form = useForm<AiGeneratorFormValues>({
    resolver: zodResolver(aiGeneratorFormSchema),
    defaultValues: {
      name: "",
      brief: "",
      type: "email",
      targetAudience: "",
      tone: "",
      brandStyle: "",
    },
  });

  // Get the selected draft from the drafts list
  const selectedDraft = draftId 
    ? drafts.find(draft => draft.id.toString() === draftId) || null
    : null;

  // Handle form submission
  const onSubmit = async (data: AiGeneratorFormValues) => {
    try {
      await createDraftMutation.mutateAsync({
        ...data,
        createdById: 1, // This will be overridden on the server with the actual user ID
      });
      
      // Switch to results tab after successful submission
      setActiveTab("drafts");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Generate a quick preview
  const handlePreview = async () => {
    const formData = form.getValues();
    if (!formData.brief || !formData.type) {
      toast({
        title: "Missing information",
        description: "Please provide at least a brief and content type to generate a preview.",
        variant: "destructive",
      });
      return;
    }

    setIsPreviewLoading(true);
    try {
      const preview = await generateAiContent(
        formData.brief,
        formData.type,
        {
          tone: formData.tone || "professional",
          targetAudience: formData.targetAudience || "general audience",
          brandStyle: formData.brandStyle || "modern",
        }
      );
      
      setPreviewContent(preview.content);
      setActiveTab("preview");
    } catch (error) {
      toast({
        title: "Preview generation failed",
        description: "An error occurred while generating the preview.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Save a variation to assets
  const saveVariation = async (variation: any) => {
    try {
      // Prepare content based on variation structure
      let content = "";
      if (typeof variation === "object" && variation !== null) {
        if (typeof variation.content === "string") {
          content = variation.content;
        } else if (variation.elements) {
          // Convert elements object to string content
          content = Object.entries(variation.elements)
            .map(([key, value]) => `# ${key}\n\n${value}`)
            .join("\n\n");
        }
      }

      // Save as new asset
      if (selectedDraft) {
        await apiRequest("POST", "/api/assets", {
          name: `${selectedDraft.name} - Variation ${variation.id || ''}`,
          description: `Generated from AI draft: ${selectedDraft.name}`,
          type: selectedDraft.type,
          content: content,
          status: "draft",
          targetAudience: selectedDraft.targetAudience,
          tone: selectedDraft.tone,
          brandStyle: selectedDraft.brandStyle,
        });

        queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
        toast({
          title: "Saved to Assets",
          description: "The variation has been saved to your Assets Library.",
        });
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "landing-page":
        return <FileText className="h-5 w-5" />;
      case "ad-copy":
        return <SquareAsterisk className="h-5 w-5" />;
      case "product-brochure":
        return <Presentation className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            Complete
          </Badge>
        );
      case "in-review":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
            In Review
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
            Processing
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </Badge>
        );
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Content Generator</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create marketing content in seconds with AI assistance
        </p>
      </div>

      {/* Main Content */}
      <Tabs 
        defaultValue="create" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="drafts">Your Drafts</TabsTrigger>
          <TabsTrigger value="results" disabled={!selectedDraft}>
            Results {selectedDraft ? `(${selectedDraft.name})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* Create New Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Content</CardTitle>
              <CardDescription>
                Describe what you want to create and let AI generate it for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name your content*</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Summer Sale Email Campaign" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="landing-page">Landing Page</SelectItem>
                            <SelectItem value="ad-copy">Ad Copy</SelectItem>
                            <SelectItem value="product-brochure">Product Brochure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brief"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Brief*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you want to create in detail..." 
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about the purpose, key messages, and any important details.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Young professionals" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Professional, Casual" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brandStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Style*</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Modern, Minimalist" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreview}
                disabled={isPreviewLoading || !form.getValues().brief}
              >
                {isPreviewLoading ? "Generating..." : "Quick Preview"}
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={createDraftMutation.isPending}
              >
                {createDraftMutation.isPending ? "Generating..." : "Generate Content"}
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Preview Tab - This is part of the create tab but shown conditionally */}
          {activeTab === "preview" && previewContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  Preview
                </CardTitle>
                <CardDescription>
                  This is a quick preview based on your brief. Generate full content for more variations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(previewContent).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <h3 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("create")}>
                  Back to Editor
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>
                  Generate Full Content
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Content Drafts</CardTitle>
              <CardDescription>
                View and manage your AI-generated content drafts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {drafts.length === 0 ? (
                <div className="text-center py-10">
                  <Sparkles className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No drafts yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first AI-generated content draft
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    Create New Draft
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.map((draft) => (
                    <Card key={draft.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-50 dark:bg-primary-900/30 rounded-md flex items-center justify-center text-primary mr-3">
                            {getContentTypeIcon(draft.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{draft.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(draft.createdAt).toLocaleDateString()} • {draft.type.replace("-", " ")}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(draft.status)}
                          
                          {draft.status === "processing" ? (
                            <div className="flex items-center gap-2 w-32">
                              <Progress value={draft.progress} className="flex-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {draft.progress}%
                              </span>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setDraftId(draft.id.toString());
                                setActiveTab("results");
                              }}
                            >
                              View Results
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("create")}>
                Create New Draft
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {selectedDraft ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        {getContentTypeIcon(selectedDraft.type)}
                        <CardTitle className="ml-2">{selectedDraft.name}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">
                        Generated {new Date(selectedDraft.createdAt).toLocaleDateString()} • {getStatusBadge(selectedDraft.status)}
                      </CardDescription>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("drafts")}>
                      Back to Drafts
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Brief</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedDraft.brief}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Target Audience:</span> {selectedDraft.targetAudience}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Tone:</span> {selectedDraft.tone}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Brand Style:</span> {selectedDraft.brandStyle}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {selectedDraft.status === "processing" ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                    <h3 className="text-lg font-medium mb-2">Generating Content</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Your content is being generated. This may take a minute.
                    </p>
                    <Progress value={selectedDraft.progress} className="mx-auto max-w-md mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedDraft.progress}% complete
                    </p>
                  </CardContent>
                </Card>
              ) : selectedDraft.variations && selectedDraft.variations.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">Generated Variations</h2>
                    <Button variant="outline" size="sm">
                      Regenerate <RefreshCw className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {selectedDraft.variations.map((variation: any, index: number) => (
                      <Card key={index} className={`overflow-hidden ${selectedVariation === index ? 'ring-2 ring-primary' : ''}`}>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800 py-3 px-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Variation {variation.id || index + 1}</h3>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-4 w-4 mr-1" /> Like
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ThumbsDown className="h-4 w-4 mr-1" /> Dislike
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedVariation(index === selectedVariation ? null : index)}
                              >
                                {index === selectedVariation ? <Check className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />} 
                                {index === selectedVariation ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {variation.elements ? (
                              // Display structured content
                              Object.entries(variation.elements).map(([key, value]: [string, any]) => (
                                <div key={key} className="space-y-2">
                                  <h4 className="text-sm font-medium capitalize">{key}</h4>
                                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                                    {value}
                                  </div>
                                </div>
                              ))
                            ) : (
                              // Display as plain text
                              <p className="text-sm whitespace-pre-wrap">{variation.content || "No content available"}</p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t flex justify-between">
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => saveVariation(variation)}
                          >
                            Save to Assets
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <h3 className="text-lg font-medium mb-2">No Variations Available</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No content variations have been generated yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <h3 className="text-lg font-medium mb-2">No Draft Selected</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select a draft from your drafts list to view results
                </p>
                <Button onClick={() => setActiveTab("drafts")}>
                  View Drafts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
