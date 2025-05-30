import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createMatrixMessaging, AgentParams } from "@/lib/ai-service";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Download,
  Copy,
  RefreshCw,
  ChevronLeft,
  Share2,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

export default function MatrixAgentPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [params, setParams] = useState<AgentParams>({
    tone: "professional",
    targetAudience: "business professionals",
    brandStyle: "modern",
  });

  // Generate content with Matrix agent
  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await createMatrixMessaging(prompt, params);
      setResult(response);
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    if (!result) return;
    
    // Format the content nicely for copying
    const textToCopy = `
# ${result.headline}
## ${result.tagline}

${result.value_proposition}

### Key Messages:
${result.key_messages.map((msg: string) => `• ${msg}`).join('\n')}

### Call to Action:
${result.call_to_action}

${result.tone_notes ? `\n### Tone Notes:\n${result.tone_notes}` : ''}
    `.trim();
    
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

  // Download as a nicely formatted HTML file
  const downloadAsHTML = () => {
    if (!result) return;

    const element = document.createElement("a");
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.headline}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .headline {
      font-size: 28px;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 10px;
    }
    .tagline {
      font-size: 20px;
      color: #4a5568;
      margin-bottom: 20px;
      font-style: italic;
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
      color: #718096;
      margin-top: 30px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #a0aec0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="headline">${result.headline}</div>
    <div class="tagline">${result.tagline}</div>
    
    <div class="value-proposition">
      ${result.value_proposition}
    </div>
    
    <div class="key-messages">
      <h3>Key Messages</h3>
      <ul>
        ${result.key_messages.map((message: string) => `<li>${message}</li>`).join('')}
      </ul>
    </div>
    
    <div class="cta">
      ${result.call_to_action}
    </div>
    
    ${result.tone_notes ? `
    <div class="tone-notes">
      <strong>Tone Notes:</strong><br>
      ${result.tone_notes}
    </div>
    ` : ''}
    
    <div class="footer">
      Generated by IntellaOne Marketing Platform - ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>
    `;

    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${result.headline.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_messaging.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded successfully",
      description: "The content has been downloaded as an HTML file.",
    });
  };

  return (
    <div className="container mx-auto py-10 max-w-5xl px-4">
      <div className="mb-8 flex items-center">
        <Link href="/agent-playground" className="mr-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          Matrix - Messaging Agent
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Create Messaging</CardTitle>
              <CardDescription>
                Matrix creates compelling messaging and positioning tailored to your target audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  What would you like Matrix to create?
                </label>
                <Textarea
                  placeholder="E.g., Create messaging for our new business insurance service that focuses on simplicity and reliability for small businesses"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <Select 
                    value={params.targetAudience} 
                    onValueChange={(value) => setParams({...params, targetAudience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business professionals">Business Professionals</SelectItem>
                      <SelectItem value="small business owners">Small Business Owners</SelectItem>
                      <SelectItem value="enterprise executives">Enterprise Executives</SelectItem>
                      <SelectItem value="marketing teams">Marketing Teams</SelectItem>
                      <SelectItem value="tech-savvy consumers">Tech-Savvy Consumers</SelectItem>
                      <SelectItem value="general consumers">General Consumers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tone</label>
                  <Select 
                    value={params.tone} 
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
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Brand Style</label>
                <Select 
                  value={params.brandStyle} 
                  onValueChange={(value) => setParams({...params, brandStyle: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="innovative">Innovative</SelectItem>
                    <SelectItem value="luxurious">Luxurious</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={generateContent} 
                  className="w-full" 
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Generate Messaging
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Results Section */}
        <div>
          {result ? (
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle>{result.headline}</CardTitle>
                <CardDescription className="italic text-base">{result.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm uppercase text-muted-foreground font-semibold mb-2">Value Proposition</h3>
                  <p className="text-base">{result.value_proposition}</p>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase text-muted-foreground font-semibold mb-2">Key Messages</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    {result.key_messages.map((message: string, idx: number) => (
                      <li key={idx} className="text-base">{message}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase text-muted-foreground font-semibold mb-2">Call to Action</h3>
                  <p className="text-base font-medium text-primary">{result.call_to_action}</p>
                </div>
                
                {result.tone_notes && (
                  <div className="bg-muted/30 rounded-md p-4">
                    <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Tone Notes</h3>
                    <p className="text-sm">{result.tone_notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-2 bg-muted/20 pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsHTML}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button variant="ghost" size="sm" onClick={generateContent} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Regenerate
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="shadow-sm w-full bg-muted/10">
                <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-[400px]">
                  <MessageSquare className="h-12 w-12 text-muted mb-4" />
                  <p className="text-center text-muted-foreground">
                    Enter your requirements and click "Generate Messaging" to create compelling content with Matrix
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}