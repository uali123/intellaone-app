import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, ChevronLeft, Download, Copy, Loader2 } from 'lucide-react';
import { createMatrixMessaging } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

// Example insurance messaging data for demonstration
const sampleResult = {
  headline: "Insuring Your Future, Seamlessly",
  tagline: "The Insurance Partner Your Business Deserves",
  value_proposition: "Our innovative insurance solutions empower businesses to navigate the complexities of risk management with confidence and ease.",
  key_messages: [
    "Tailored coverage to protect your unique business needs",
    "Streamlined onboarding and claims processing for maximum efficiency",
    "Personalized guidance from industry experts to optimize your insurance strategy",
    "Cutting-edge technology that delivers real-time insights and transparency",
    "Unwavering commitment to exceptional customer service and support"
  ],
  call_to_action: "Elevate your business with an insurance partner you can trust. Contact us today to get started.",
  tone_notes: "The messaging adopts a professional, authoritative, and forward-thinking tone to establish the brand as a trusted and innovative insurance provider for business professionals. The language is clear, concise, and focused on the key benefits and differentiators that will resonate with the target audience."
};

export default function MatrixPreview() {
  const { toast } = useToast();
  const [result, setResult] = useState<any>(sampleResult);
  const [prompt, setPrompt] = useState("Create messaging for a business insurance service that focuses on simplicity and reliability");
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = () => {
    if (!result) return;
    
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
          description: "The content has been copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy content to clipboard.",
          variant: "destructive",
        });
      });
  };

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

  const generateNewContent = async () => {
    if (!prompt) {
      toast({
        title: "Input required",
        description: "Please enter a prompt for Matrix agent",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const generatedContent = await createMatrixMessaging(prompt, {
        tone: "professional",
        targetAudience: "business professionals",
        brandStyle: "modern"
      });
      setResult(generatedContent);
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Link href="/agents">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Agents
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-purple-500" /> Matrix Agent Output
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create Your Own Messaging</CardTitle>
              <CardDescription>
                Enter your messaging brief and generate custom content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create messaging for our new product launch..."
                className="h-40"
              />
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={generateNewContent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate New Content
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-xl font-bold">{result.headline}</CardTitle>
              <CardDescription className="text-md italic">{result.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Value Proposition</h3>
                <p>{result.value_proposition}</p>
              </div>
              
              <div>
                <h3 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Key Messages</h3>
                <ul className="ml-5 space-y-2 list-disc">
                  {result.key_messages.map((message: string, idx: number) => (
                    <li key={idx}>{message}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Call to Action</h3>
                <p className="font-medium text-primary">{result.call_to_action}</p>
              </div>
              
              {result.tone_notes && (
                <div className="mt-6 p-4 bg-muted/30 rounded-md">
                  <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Tone Notes</h3>
                  <p className="text-sm">{result.tone_notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between gap-2 bg-muted/20 pt-4">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" /> Copy Text
              </Button>
              <Button variant="outline" size="sm" onClick={downloadAsHTML}>
                <Download className="h-4 w-4 mr-2" /> Download HTML
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 bg-muted/10 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">About Matrix Agent</h2>
        <p className="mb-4">
          The Matrix agent creates professionally formatted marketing messaging with a consistent structure. 
          Each output includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Headline and Tagline:</strong> Attention-grabbing main message and supporting phrase</li>
          <li><strong>Value Proposition:</strong> Clear statement of the value offered to customers</li>
          <li><strong>Key Messages:</strong> Consistent talking points for all marketing communications</li>
          <li><strong>Call to Action:</strong> Specific prompt encouraging the desired customer behavior</li>
        </ul>
        <p>
          You can download the output as a nicely formatted HTML file that can be shared with your team or clients.
        </p>
      </div>
    </div>
  );
}