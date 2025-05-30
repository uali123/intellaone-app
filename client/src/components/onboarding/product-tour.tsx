import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, Status, Step } from 'react-joyride';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ProductTourProps {
  startTour?: boolean;
  onTourFinish?: () => void;
  tourType?: 'agent' | 'dashboard';
}

export function ProductTour({ 
  startTour = false, 
  onTourFinish,
  tourType = 'agent' 
}: ProductTourProps) {
  const { toast } = useToast();
  const [run, setRun] = useState(startTour);
  const [stepIndex, setStepIndex] = useState(0);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  
  // Check if this is the first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRun(true);
    } else {
      setShowWelcomeDialog(false);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
      if (onTourFinish) onTourFinish();
      
      toast({
        title: "Tour completed!",
        description: "You can restart the tour anytime from the help menu.",
      });
    } else if (status === 'step:after' as Status) {
      // Update step index
      setStepIndex(index + 1);
    }
  };

  const startProductTour = () => {
    setShowWelcomeDialog(false);
    setRun(true);
  };

  const skipProductTour = () => {
    setShowWelcomeDialog(false);
    setRun(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  // Define the tour steps based on the tour type
  let steps: Step[] = [];

  if (tourType === 'agent') {
    steps = [
      {
        target: '.agent-tabs',
        content: 'Meet your AI agents! Each agent specializes in different marketing tasks:',
        disableBeacon: true,
        placement: 'bottom',
      },
      {
        target: '[data-tour="maven-agent"]',
        content: 'Maven is your research specialist. Use Maven to gather market intelligence, analyze competitors, and uncover insights.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="matrix-agent"]',
        content: 'Matrix creates compelling messaging. Perfect for crafting headlines, value propositions, and core brand messaging.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="max-agent"]',
        content: 'Max specializes in campaign planning. Use Max to create timelines, channel strategies, and campaign briefs.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="prompt-area"]',
        content: 'Enter your brief here. Be specific about what you want to create.',
        placement: 'top',
      },
      {
        target: '[data-tour="parameters"]',
        content: 'Customize your generation with these parameters. Different agents have different parameter options.',
        placement: 'top',
      },
      {
        target: '[data-tour="examples"]',
        content: 'Need inspiration? Click here to view example prompts for each agent.',
        placement: 'left',
      },
      {
        target: '[data-tour="generate-button"]',
        content: 'Click here to generate content. You get 3 free generations to try out the platform.',
        placement: 'top',
      },
    ];
  } else if (tourType === 'dashboard') {
    // Dashboard tour steps would go here
    steps = [
      {
        target: '.navigation',
        content: 'Use the navigation to access different areas of the platform.',
        disableBeacon: true,
      },
      // Add more dashboard-specific steps as needed
    ];
  }

  return (
    <>
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to IntellaOne!</DialogTitle>
            <DialogDescription>
              Would you like a quick tour to learn how our AI marketing platform works?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our guided tour will show you how to use our specialized AI agents to create amazing marketing content.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={skipProductTour}>Skip for now</Button>
            <Button onClick={startProductTour}>Start the tour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        stepIndex={stepIndex}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#3b82f6',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#333',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
          },
          spotlight: {
            backgroundColor: 'transparent',
          },
          tooltip: {
            fontSize: '14px',
            borderRadius: '8px'
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontWeight: 500,
            borderRadius: '4px',
            padding: '8px 16px'
          },
          buttonBack: {
            color: '#3b82f6',
            marginRight: '8px'
          },
          buttonSkip: {
            color: '#6b7280',
          }
        }}
      />
    </>
  );
}

export default ProductTour;