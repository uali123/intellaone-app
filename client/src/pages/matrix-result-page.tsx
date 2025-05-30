import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import FancyMatrixOutput from '@/components/ai/fancy-matrix-output';
import { useToast } from '@/hooks/use-toast';

// Default sample result for when first loading the page
const defaultResult = {
  headline: "Transforming Customer Experience with AI-Powered Solutions",
  tagline: "Intelligent Technology for a Smarter Future",
  value_proposition: "Our AI platform helps businesses deliver personalized, efficient customer experiences while reducing operational costs and increasing satisfaction scores.",
  key_messages: [
    "Reduce customer service costs by up to 30% through intelligent automation",
    "Deliver 24/7 personalized support across all channels",
    "Gain actionable insights from customer interactions with advanced analytics",
    "Seamlessly integrate with your existing CRM and service tools",
    "Implementation in weeks, not months, with our proven onboarding process"
  ],
  call_to_action: "Schedule a demo today to see how our AI platform can transform your customer experience.",
  tone_notes: "The messaging maintains a professional yet accessible tone, focusing on concrete business benefits rather than technical jargon. It emphasizes both efficiency improvements and enhanced customer satisfaction to appeal to multiple stakeholders."
};

export default function MatrixResultPage() {
  const { toast } = useToast();
  const [result] = useState(defaultResult);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Link href="/matrix-showcase">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Matrix
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-purple-500" /> Matrix Result
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About This Output</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This example shows how the Matrix agent creates consistent, structured messaging
                for your marketing needs. The output includes:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Headline & Tagline:</strong> Attention-grabbing statements</li>
                <li><strong>Value Proposition:</strong> Clear statement of the value provided</li>
                <li><strong>Key Messages:</strong> Specific points for consistent messaging</li>
                <li><strong>Call to Action:</strong> Direct statement of what action to take</li>
                <li><strong>Tone Notes:</strong> Guidance on maintaining consistent voice</li>
              </ul>
              
              <p>
                You can download this content as a nicely formatted HTML file or copy the text to use
                directly in your marketing materials. The Matrix agent ensures consistent messaging
                across all your campaigns.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* Using our fancy component for displaying Matrix output with download capability */}
          <FancyMatrixOutput data={result} />
        </div>
      </div>
    </div>
  );
}