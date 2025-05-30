import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, RefreshCw, AlertCircle, Terminal, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

interface ModelStatus {
  hasCustomModel: boolean;
  modelId: string | null;
  lastTrainedAt: string | null;
  trainingStats: {
    aiDrafts: number;
    campaigns: number;
    assets: number;
    totalAvailable: number;
    estimatedTokens: number;
  };
}

interface FineTuningJob {
  id: string;
  status: "validating" | "queued" | "running" | "succeeded" | "failed" | "cancelled";
  created_at: string;
  finished_at: string | null;
  fine_tuned_model: string | null;
  model: string;
  training_file: string;
  validation_file?: string;
}

export default function AdminModelPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [includeAiDrafts, setIncludeAiDrafts] = useState(true);
  const [includeCampaigns, setIncludeCampaigns] = useState(true);
  const [includeAssets, setIncludeAssets] = useState(true);
  const [baseModel, setBaseModel] = useState("gpt-3.5-turbo");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("status");

  // Temporarily disabled admin check for testing
  // if (!user || user.role !== 'admin') {
  //   return <Redirect to="/" />;
  // }

  // Query for model status
  const modelStatusQuery = useQuery({
    queryKey: ["/api/admin/model/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Query for fine-tuning jobs
  const jobsQuery = useQuery({
    queryKey: ["/api/admin/model/jobs"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation for starting model training
  const trainModelMutation = useMutation({
    mutationFn: async (trainingData: {
      systemPromptOverride?: string;
      baseModel: string;
      includeAiDrafts: boolean;
      includeCampaigns: boolean;
      includeAssets: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/admin/model/train", trainingData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Model training started",
        description: `Training job ${data.jobId} started with ${data.trainingExamples} examples.`,
      });
      // Refresh jobs list
      jobsQuery.refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error starting model training",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for canceling a job
  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest("POST", `/api/admin/model/jobs/${jobId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job cancelled",
        description: "The fine-tuning job has been cancelled.",
      });
      // Refresh jobs list
      jobsQuery.refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start training handler
  const handleStartTraining = () => {
    // Validate at least one data source is selected
    if (!includeAiDrafts && !includeCampaigns && !includeAssets) {
      toast({
        title: "Validation Error",
        description: "Please select at least one data source for training.",
        variant: "destructive",
      });
      return;
    }

    trainModelMutation.mutate({
      systemPromptOverride: systemPrompt || undefined,
      baseModel,
      includeAiDrafts,
      includeCampaigns,
      includeAssets,
    });
  };

  // Cancel job handler
  const handleCancelJob = (jobId: string) => {
    if (confirm("Are you sure you want to cancel this fine-tuning job?")) {
      cancelJobMutation.mutate(jobId);
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">IntellaOne Model Customization</h1>
      <p className="text-muted-foreground mb-8">
        Customize the AI model with your company's marketing data to improve outputs for all users.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="train">Train Model</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Status</CardTitle>
              <CardDescription>
                Current status of your custom IntellaOne model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelStatusQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : modelStatusQuery.error ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Error loading model status</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Custom Model</h3>
                      {(modelStatusQuery.data as ModelStatus)?.hasCustomModel ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" /> Active
                          </Badge>
                          <span className="text-sm">
                            {(modelStatusQuery.data as ModelStatus)?.modelId}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline">Not Yet Trained</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Last Trained</h3>
                      {(modelStatusQuery.data as ModelStatus)?.lastTrainedAt ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date((modelStatusQuery.data as ModelStatus)?.lastTrainedAt || "").toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Available Training Data</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1">AI Drafts</h4>
                        <p className="text-2xl font-semibold">
                          {(modelStatusQuery.data as ModelStatus)?.trainingStats.aiDrafts || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1">Campaigns</h4>
                        <p className="text-2xl font-semibold">
                          {(modelStatusQuery.data as ModelStatus)?.trainingStats.campaigns || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="text-xs text-muted-foreground mb-1">Assets</h4>
                        <p className="text-2xl font-semibold">
                          {(modelStatusQuery.data as ModelStatus)?.trainingStats.assets || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-xs text-muted-foreground mb-1">Total Available Examples</h4>
                      <p className="text-2xl font-semibold">
                        {(modelStatusQuery.data as ModelStatus)?.trainingStats.totalAvailable || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated {Math.round(((modelStatusQuery.data as ModelStatus)?.trainingStats.estimatedTokens || 0) / 1000)}K tokens
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => modelStatusQuery.refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Train Model Tab */}
        <TabsContent value="train" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Train Custom Model</CardTitle>
              <CardDescription>
                Create a fine-tuned model using your platform's marketing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Data Sources</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="aiDrafts" 
                        checked={includeAiDrafts}
                        onCheckedChange={(checked) => setIncludeAiDrafts(!!checked)}
                      />
                      <Label htmlFor="aiDrafts">AI Drafts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="campaigns" 
                        checked={includeCampaigns}
                        onCheckedChange={(checked) => setIncludeCampaigns(!!checked)}
                      />
                      <Label htmlFor="campaigns">Campaigns</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assets" 
                        checked={includeAssets}
                        onCheckedChange={(checked) => setIncludeAssets(!!checked)}
                      />
                      <Label htmlFor="assets">Assets</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Model Configuration</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="baseModel">Base Model</Label>
                    <select
                      id="baseModel"
                      className="w-full h-10 px-3 py-2 border rounded-md"
                      value={baseModel}
                      onChange={(e) => setBaseModel(e.target.value)}
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4o">GPT-4o (More expensive)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt Override (Optional)</Label>
                    <Textarea 
                      id="systemPrompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Optional custom system prompt for the model"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="secondary" onClick={() => setActiveTab("status")}>
                Cancel
              </Button>
              <Button 
                onClick={handleStartTraining} 
                disabled={trainModelMutation.isPending || (!includeAiDrafts && !includeCampaigns && !includeAssets)}
              >
                {trainModelMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Training"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fine-Tuning Jobs</CardTitle>
              <CardDescription>
                View and manage model training jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : jobsQuery.error ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Error loading jobs</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {(jobsQuery.data as FineTuningJob[])?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No fine-tuning jobs found</p>
                  ) : (
                    <div className="space-y-4">
                      {(jobsQuery.data as FineTuningJob[])?.map((job) => (
                        <Card key={job.id} className="overflow-hidden">
                          <div className={`h-2 ${
                            job.status === 'succeeded' ? 'bg-green-500' :
                            job.status === 'failed' ? 'bg-red-500' :
                            job.status === 'cancelled' ? 'bg-gray-500' :
                            'bg-blue-500'
                          }`} />
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                              <div>
                                <h3 className="font-medium flex items-center gap-2">
                                  <Terminal className="h-4 w-4" />
                                  <span className="font-mono text-sm">{job.id}</span>
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={
                                      job.status === 'succeeded' ? 'default' :
                                      job.status === 'failed' ? 'destructive' :
                                      job.status === 'running' ? 'secondary' :
                                      'outline'
                                    }
                                  >
                                    {job.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Started: {new Date(job.created_at).toLocaleString()}
                                  </span>
                                </div>
                                {job.status === 'running' && (
                                  <div className="mt-4">
                                    <Progress value={60} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Fine-tuning in progress...
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Base model:</span> {job.model}
                                </div>
                                {job.fine_tuned_model && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Fine-tuned model:</span>{" "}
                                    <span className="font-mono">{job.fine_tuned_model}</span>
                                  </div>
                                )}
                                {(job.status === 'validating' || job.status === 'queued' || job.status === 'running') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleCancelJob(job.id)}
                                    disabled={cancelJobMutation.isPending}
                                  >
                                    {cancelJobMutation.isPending ? "Cancelling..." : "Cancel Job"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => jobsQuery.refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Jobs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}