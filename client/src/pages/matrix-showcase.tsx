import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { MessageSquare, ChevronRight, ArrowRight, Download, Copy } from 'lucide-react';
import AgentInterface from '@/components/ai/agent-interface-new';

const exampleOutput = {
  headline: "Transform Your Digital Experience With IntellaOne",
  tagline: "AI-Powered Marketing Solutions That Get Results",
  value_proposition: "IntellaOne combines advanced AI technology with marketing expertise to help businesses create compelling content, optimize campaigns, and drive measurable results with less effort and time.",
  key_messages: [
    "Reduce content creation time by up to 70% with our AI-powered tools",
    "Maintain brand consistency across all marketing channels with intelligent templates",
    "Get data-driven insights that optimize your campaign performance",
    "Seamlessly integrate with your existing marketing stack",
    "Enterprise-grade security and compliance built into every feature"
  ],
  call_to_action: "Start your free trial today and see how IntellaOne can transform your marketing strategy.",
  tone_notes: "The messaging adopts a professional yet approachable tone, emphasizing innovation and results while avoiding overly technical language. It focuses on concrete benefits rather than abstract features."
};

export default function MatrixShowcase() {
  const renderStaticExample = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 bg-muted/30">
        <CardTitle className="text-xl font-bold">{exampleOutput.headline}</CardTitle>
        <CardDescription className="text-md italic">{exampleOutput.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Value Proposition</h3>
          <p>{exampleOutput.value_proposition}</p>
        </div>
        
        <div>
          <h3 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Key Messages</h3>
          <ul className="ml-5 space-y-2 list-disc">
            {exampleOutput.key_messages.map((message, idx) => (
              <li key={idx}>{message}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Call to Action</h3>
          <p className="font-medium text-primary">{exampleOutput.call_to_action}</p>
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-md">
          <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Tone Notes</h3>
          <p className="text-sm">{exampleOutput.tone_notes}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-muted/20 pt-4">
        <Link href="/matrix-preview">
          <Button>
            Try it yourself <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <MessageSquare className="h-7 w-7 mr-2 text-purple-500" /> Matrix Agent
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Transform Your Marketing Messaging</h2>
          <p className="text-lg mb-6">
            Matrix is our specialized messaging agent that creates strategic, on-brand marketing content optimized for your specific audience and goals.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Consistent Brand Voice</h3>
                <p className="text-muted-foreground">Create perfectly structured messaging that maintains your brand's unique personality across all channels.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Exportable Formats</h3>
                <p className="text-muted-foreground">Download your generated content as beautifully formatted HTML documents to share with your team.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                <Copy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Ready to Use</h3>
                <p className="text-muted-foreground">Copy professional, ready-to-use content directly into your marketing materials.</p>
              </div>
            </div>
          </div>
          
          <Link href="/matrix-preview">
            <Button size="lg" className="mt-2">
              Try Matrix Agent <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        <div>
          {renderStaticExample()}
        </div>
      </div>
      
      <div className="mt-12 bg-muted/10 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">How Matrix Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <CardTitle>Describe Your Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Enter what you need messaging for—whether it's a product launch, service offering, or brand positioning.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <CardTitle>AI Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our AI analyzes your input and creates structured, professional messaging optimized for your audience.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <CardTitle>Download & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get your messaging as beautifully formatted HTML or copy the text directly into your materials.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}