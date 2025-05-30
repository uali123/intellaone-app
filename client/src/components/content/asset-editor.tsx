import { useState, useEffect } from "react";
import { Asset } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, EyeIcon, History, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { analyzeContent } from "@/lib/mock-api";

interface AssetEditorProps {
  asset: Asset;
}

export default function AssetEditor({ asset }: AssetEditorProps) {
  const [content, setContent] = useState(asset.content);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setContent(asset.content);
  }, [asset]);

  const versionHistory = Array.isArray(asset.versionHistory) 
    ? asset.versionHistory 
    : [];

  const handleSave = async () => {
    if (content === asset.content) return;
    
    setIsSaving(true);
    try {
      await apiRequest("PATCH", `/api/assets/${asset.id}`, {
        content
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${asset.id}`] });
      toast({
        title: "Asset saved",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeContent(content);
      setAnalysis(result.analysis);
      setActiveTab("analyze");
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderComments = () => {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p>No comments yet</p>
          <p className="text-sm mt-1">Be the first to add a comment</p>
        </div>
        
        <div className="flex items-start space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Avatar>
            <AvatarImage 
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}`} 
              alt={user?.fullName} 
            />
            <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Add a comment..." 
              className="w-full min-h-[100px]"
            />
            <Button className="mt-2">Add Comment</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => {
    if (!analysis) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p>Click "Analyze Content" to get AI-powered suggestions</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Readability</h3>
            <div className="text-3xl font-bold mt-2 text-primary">{analysis.readabilityScore}</div>
            <p className="text-xs mt-1 text-center text-gray-500">
              {analysis.readabilityScore > 80 ? "Excellent" : analysis.readabilityScore > 60 ? "Good" : "Needs improvement"}
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tone Analysis</h3>
            {Object.entries(analysis.tone).map(([tone, value]: [string, any]) => (
              <div key={tone} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize">{tone}</span>
                  <span>{value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Content Length</h3>
            <p className="text-2xl font-semibold">{content.length} chars</p>
            <p className="text-xs text-gray-500">
              {content.split(/\s+/).length} words
            </p>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-green-600 dark:text-green-400">Strengths</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.strengths.map((strength: string, i: number) => (
                <li key={i} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-amber-600 dark:text-amber-400">Suggestions</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.suggestions.map((suggestion: string, i: number) => (
                <li key={i} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderVersionHistory = () => {
    if (versionHistory.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p>No version history available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        {versionHistory.map((version: any, index: number) => (
          <Card key={index} className="overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Version {version.version}</span>
                <p className="text-xs text-gray-500">
                  {new Date(version.timestamp).toLocaleString()}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setContent(version.content)}
              >
                Restore
              </Button>
            </div>
            <CardContent className="p-3 max-h-40 overflow-hidden text-ellipsis text-sm bg-white dark:bg-gray-950">
              {version.content.substring(0, 200)}
              {version.content.length > 200 && '...'}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1).replace('-', ' ')}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing || content.trim().length === 0}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Content"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || content === asset.content}
            size="sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="edit"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col h-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="analyze">Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <TabsContent value="edit" className="flex-1 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none p-4 rounded-none border-0 focus-visible:ring-0"
              placeholder="Start writing your content here..."
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                {content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analyze" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {renderAnalysis()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {renderVersionHistory()}
            </ScrollArea>
          </TabsContent>
        </Card>
      </Tabs>

      <Separator className="my-6" />

      <Card>
        <CardContent className="p-0">
          <h3 className="font-medium text-sm p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            Comments
          </h3>
          <ScrollArea className="max-h-[300px]">
            {renderComments()}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
