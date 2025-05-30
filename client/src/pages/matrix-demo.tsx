import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Download, Copy, Loader2, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { createMatrixMessaging } from '@/lib/ai-service';

// Sample result to show initially
const sampleResult = {
  headline: "Transform Your Marketing with IntellaOne AI",
  tagline: "Intelligent Solutions for Modern Marketing Teams",
  value_proposition: "IntellaOne combines powerful AI technology with marketing expertise to help teams create compelling content, optimize campaigns, and drive measurable results with less effort and time.",
  key_messages: [
    "Reduce content creation time by up to 70% with AI-powered tools",
    "Maintain brand consistency across all channels with intelligent templates",
    "Get data-driven insights that optimize your campaign performance",
    "Seamlessly integrate with your existing marketing stack",
    "Enterprise-grade security and compliance built into every feature"
  ],
  call_to_action: "Start your free trial today and see how IntellaOne can transform your marketing strategy.",
  tone_notes: "The messaging adopts a professional yet approachable tone, emphasizing innovation and results while avoiding overly technical language. It focuses on concrete benefits rather than abstract features."
};

export default function MatrixDemo() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('Create messaging for a B2B marketing platform with AI capabilities');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(sampleResult);

  // Handle generation of new content
  const generateContent = async () => {
    if (!prompt) {
      toast({
        title: "Input required",
        description: "Please enter a description for your messaging needs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await createMatrixMessaging(prompt, {
        tone: "professional",
        targetAudience: "marketing teams",
        brandStyle: "modern"
      });
      
      setResult(response);
      toast({
        title: "Content generated",
        description: "Your messaging has been created successfully"
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate messaging. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    const textContent = `
# ${result.headline}
## ${result.tagline}

${result.value_proposition}

### Key Messages:
${result.key_messages.map(msg => `- ${msg}`).join('\n')}

### Call to Action:
${result.call_to_action}

${result.tone_notes ? `### Tone Notes:\n${result.tone_notes}` : ''}
    `.trim();

    navigator.clipboard.writeText(textContent)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard"
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy content",
          variant: "destructive",
        });
      });
  };

  // Download as HTML file
  const downloadHTML = () => {
    const htmlContent = `
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
        ${result.key_messages.map(message => `<li>${message}</li>`).join('')}
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
</html>`;

    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${result.headline.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_messaging.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded successfully",
      description: "Content has been downloaded as an HTML file"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-purple-500" /> Matrix Messaging Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter a prompt below to create on-brand marketing content with consistent structure and messaging
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Prompt</CardTitle>
            <CardDescription>
              Describe what you need messaging for (product, service, campaign, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Create messaging for our new cloud security product aimed at enterprise IT managers..."
              className="h-28"
            />
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={generateContent}
              disabled={loading}
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
          </CardFooter>
        </Card>
        
        {/* Output Section */}
        <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {result.headline}
            </CardTitle>
            <CardDescription className="text-md italic font-medium text-primary/70">{result.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500">
              <h3 className="text-sm uppercase font-semibold text-blue-700 dark:text-blue-300 mb-2">Value Proposition</h3>
              <p className="text-blue-900 dark:text-blue-100">{result.value_proposition}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500">
              <h3 className="text-sm uppercase font-semibold text-purple-700 dark:text-purple-300 mb-2">Key Messages</h3>
              <ul className="ml-5 space-y-2 list-disc text-purple-900 dark:text-purple-100">
                {result.key_messages.map((message, idx) => (
                  <li key={idx}>{message}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500">
              <h3 className="text-sm uppercase font-semibold text-green-700 dark:text-green-300 mb-2">Call to Action</h3>
              <p className="font-medium text-green-900 dark:text-green-100">{result.call_to_action}</p>
            </div>
            
            {result.tone_notes && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500">
                <h3 className="text-sm uppercase font-semibold text-amber-700 dark:text-amber-300 mb-2">Tone Notes</h3>
                <p className="text-sm text-amber-900 dark:text-amber-100">{result.tone_notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between gap-2 bg-gradient-to-r from-primary/5 to-primary/10 py-4">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="hover:bg-primary/20 border border-primary/30">
              <Copy className="h-4 w-4 mr-2" /> Copy Text
            </Button>
            <Button variant="outline" size="sm" onClick={downloadHTML} className="hover:bg-primary/20 border border-primary/30">
              <Download className="h-4 w-4 mr-2" /> Download HTML
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}