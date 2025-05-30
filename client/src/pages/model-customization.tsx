import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Database, Brain, CircleCheck, AlertCircle, Upload, FileUp } from "lucide-react";

// Mock data for model status
const mockModelStatus = {
  hasCustomModel: true,
  modelId: "ft:gpt-3.5-turbo-0125:intellaone:v1:1747310000",
  lastTrainedAt: "2025-05-15T12:30:00Z",
  trainingStats: {
    aiDrafts: 152,
    campaigns: 28,
    assets: 93,
    totalAvailable: 273,
    estimatedTokens: 127500
  }
};

// Mock data for current jobs
const mockJobs = [
  {
    id: "ftjob-1234567890",
    status: "succeeded",
    created_at: "2025-05-15T12:00:00Z",
    finished_at: "2025-05-15T12:30:00Z", 
    fine_tuned_model: "ft:gpt-3.5-turbo-0125:intellaone:v1:1747310000",
    model: "gpt-3.5-turbo",
    training_file: "file-abcdef123456"
  }
];

export default function ModelCustomizationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("status");
  const [baseModel, setBaseModel] = useState("gpt-3.5-turbo");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState(mockModelStatus);
  const [jobs, setJobs] = useState<any[]>(mockJobs);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  // Function to upload training data file  
  const uploadTrainingFile = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      console.log("Uploading file:", selectedFile.name, "Size:", selectedFile.size);
      
      // Send the request
      const response = await fetch('/api/admin/model/upload-data', {
        method: 'POST',
        body: formData,
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("Server response error:", response.status, errorText);
        throw new Error(`Upload failed (${response.status}): ${response.statusText}`);
      }
      
      // Parse the response
      const result = await response.json();
      console.log("Upload successful:", result);
      
      // Update UI
      setUploadResult(result);
      
      // Show success notification
      toast({
        title: "Upload successful",
        description: `Processed ${result.recordCount} examples from ${result.filename}`,
      });
      
    } catch (error: any) {
      // Handle error
      console.error("Error uploading file:", error);
      
      // Show error message
      toast({
        title: "Upload failed",
        description: error?.message || "An error occurred during file upload",
        variant: "destructive"
      });
      
      // Clear upload result on error
      setUploadResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  const startTraining = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Training initiated",
        description: "Your custom model training has started. This process will take approximately 1-2 hours.",
      });
      
      // Mock success
      setTimeout(() => {
        const newJob = {
          id: "ftjob-" + Math.random().toString().substring(2, 12),
          status: "running",
          created_at: new Date().toISOString(),
          finished_at: null,
          fine_tuned_model: null,
          model: baseModel,
          training_file: "file-" + Math.random().toString(36).substring(2, 10)
        };
        
        setJobs([newJob, ...jobs]);
        setActiveTab("jobs");
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Training failed",
        description: "There was an error starting the training. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Customization</h1>
          <p className="text-muted-foreground">
            Train specialized marketing models for your organization's content
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Model Status</TabsTrigger>
          <TabsTrigger value="train">Train New Model</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
        </TabsList>
        
        {/* Model Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>IntellaOne Custom Model</CardTitle>
              <CardDescription>
                Your organization's specialized marketing AI model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {modelStatus.hasCustomModel ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                      <CircleCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Custom model active</h3>
                      <p className="text-sm text-muted-foreground">
                        {modelStatus.modelId}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Last trained</span>
                      <span>{new Date(modelStatus.lastTrainedAt).toLocaleDateString()} ({new Date(modelStatus.lastTrainedAt).toLocaleTimeString()})</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">AI Drafts</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{modelStatus.trainingStats.aiDrafts}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Campaigns</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{modelStatus.trainingStats.campaigns}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Assets</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{modelStatus.trainingStats.assets}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Total</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{modelStatus.trainingStats.totalAvailable}</p>
                      </CardContent>
                    </Card>
                  </div>
                
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        ~{modelStatus.trainingStats.estimatedTokens.toLocaleString()} tokens of training data
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Refreshed statistics",
                          description: "Training data statistics have been updated."
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Stats
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-6">
                    <Brain className="h-12 w-12 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">No custom model yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                      You haven't trained a specialized model for your organization yet.
                      Custom models improve the accuracy and relevance of AI-generated
                      marketing content.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("train")}>
                    Train Your First Model
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant={modelStatus.hasCustomModel ? "default" : "outline"} 
                onClick={() => setActiveTab("train")}
              >
                {modelStatus.hasCustomModel ? "Train New Version" : "Train Model"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Train New Model Tab */}
        <TabsContent value="train">
          <Card>
            <CardHeader>
              <CardTitle>Train Custom Model</CardTitle>
              <CardDescription>
                Create a specialized model using your organization's marketing content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="base-model">Base Model</Label>
                <Select value={baseModel} onValueChange={setBaseModel}>
                  <SelectTrigger id="base-model">
                    <SelectValue placeholder="Select a base model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, Good)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Slower, Best)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The base model determines the underlying capabilities.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt Override (Optional)</Label>
                <Textarea 
                  id="system-prompt" 
                  placeholder="Enter a custom system prompt to further specialize model behavior..."
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Custom instructions to further guide the model's output style and focus.
                </p>
              </div>
              
              {/* UPLOAD TRAINING DATA SECTION */}
              <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/30 mb-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3 mb-4">
                    <FileUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload Your Training Data</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Upload your training data in CSV, Excel (.xlsx, .xls), JSONL or ZIP format. 
                    We'll automatically convert your spreadsheet data into the format needed for training.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-4">
                    <div>
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        accept=".jsonl,.json,.zip,.txt,.csv,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSelectedFile(file);
                          
                          if (file) {
                            setFileName(file.name);
                            setFileSize((file.size / 1024 / 1024).toFixed(2));
                            toast({
                              title: `Selected: ${file.name}`,
                              description: `${(file.size / 1024 / 1024).toFixed(2)} MB file ready to upload`,
                            });
                          } else {
                            setFileName("");
                            setFileSize("");
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        {fileName ? `${fileName} (${fileSize} MB)` : "Choose File"}
                      </Button>
                    </div>
                    
                    <div>
                      <Button 
                        variant="default"
                        className="w-full"
                        disabled={!selectedFile || isUploading}
                        onClick={uploadTrainingFile}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : "Upload & Validate"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Accepted formats: .csv, .xlsx, .xls, .jsonl, .json, .zip, .txt (max 100MB)</p>
                  </div>
                  
                  {uploadResult && (
                    <div className="mt-4 w-full border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <div className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-400">Upload Successful!</h4>
                          <p className="text-sm text-green-800 dark:text-green-500 mt-1">
                            Processed {uploadResult.recordCount} examples from {uploadResult.filename}
                          </p>
                          {uploadResult.sampleData && uploadResult.sampleData.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-green-800 dark:text-green-500">Sample Data:</p>
                              <div className="mt-1 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-800 max-h-32 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(uploadResult.sampleData[0], null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2 mt-1">
                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Existing Training Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll use {modelStatus.trainingStats.totalAvailable} examples from your organization's marketing content:
                    </p>
                    <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <li className="flex items-center">
                        <CircleCheck className="h-4 w-4 mr-1.5 text-green-600" />
                        <span>{modelStatus.trainingStats.aiDrafts} AI drafts</span>
                      </li>
                      <li className="flex items-center">
                        <CircleCheck className="h-4 w-4 mr-1.5 text-green-600" />
                        <span>{modelStatus.trainingStats.campaigns} campaigns</span>
                      </li>
                      <li className="flex items-center">
                        <CircleCheck className="h-4 w-4 mr-1.5 text-green-600" />
                        <span>{modelStatus.trainingStats.assets} marketing assets</span>
                      </li>
                    </ul>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm">~{modelStatus.trainingStats.estimatedTokens.toLocaleString()} tokens estimated</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Refreshed statistics",
                            description: "Training data statistics have been updated."
                          });
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="system-prompt-override" defaultChecked />
                <Label htmlFor="system-prompt-override">
                  Use optimized IntellaOne agent prompts with this model
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                disabled={isLoading} 
                onClick={startTraining}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Training Job...
                  </>
                ) : (
                  "Start Training"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Training Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>
                Status of your model training jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                          <div>
                            <div className="flex items-center space-x-2">
                              {job.status === "running" ? (
                                <div className="flex items-center text-amber-600">
                                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                  <span className="font-medium">Running</span>
                                </div>
                              ) : job.status === "succeeded" ? (
                                <div className="flex items-center text-green-600">
                                  <CircleCheck className="h-4 w-4 mr-1.5" />
                                  <span className="font-medium">Completed</span>
                                </div>
                              ) : job.status === "failed" ? (
                                <div className="flex items-center text-red-600">
                                  <AlertCircle className="h-4 w-4 mr-1.5" />
                                  <span className="font-medium">Failed</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-blue-600">
                                  <Loader2 className="h-4 w-4 mr-1.5" />
                                  <span className="font-medium">{job.status}</span>
                                </div>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {job.id}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Started:</span> {new Date(job.created_at).toLocaleString()}
                              </p>
                              {job.finished_at && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Finished:</span> {new Date(job.finished_at).toLocaleString()}
                                </p>
                              )}
                              {job.fine_tuned_model && (
                                <p className="text-sm mt-2 font-medium">
                                  {job.fine_tuned_model}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {job.status === "running" && (
                              <div className="w-40">
                                <Progress value={45} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1 text-right">~45% complete</p>
                              </div>
                            )}
                            {job.status === "succeeded" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Model activated",
                                    description: "Your custom model is now being used for all IntellaOne AI agents."
                                  });
                                }}
                              >
                                Activate Model
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                    <Database className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No training jobs yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                      You haven't started any model training jobs. Go to the Train tab to create your first custom model.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}