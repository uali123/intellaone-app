import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import FancyMatrixOutput from '@/components/ai/fancy-matrix-output';

// Sample insurance messaging data created by Matrix agent
const insuranceMessaging = {
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

export default function MatrixExamplePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/agents">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to Agents
              </Button>
            </Link>
            <h1 className="text-2xl font-bold ml-2">Matrix Agent - Example Output</h1>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Below is an example of the formatted, downloadable content created by the Matrix AI agent for business insurance messaging.
          You can copy the text or download it as a nicely formatted HTML page.
        </p>
      </div>
      
      {/* Example output using the FancyMatrixOutput component */}
      <FancyMatrixOutput data={insuranceMessaging} />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Want to generate your own custom messaging with the Matrix agent?
        </p>
        <Link href="/matrix-agent">
          <Button>Try the Matrix Agent</Button>
        </Link>
      </div>
    </div>
  );
}