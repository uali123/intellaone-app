import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface GuidedTourProps {
  steps: Step[];
  isActive: boolean;
  tourId: string;
  onComplete?: () => void;
}

export function GuidedTour({ 
  steps, 
  isActive, 
  tourId, 
  onComplete 
}: GuidedTourProps) {
  const [run, setRun] = useState(false);
  
  // Start the tour when isActive changes to true
  useEffect(() => {
    if (isActive) {
      // Small delay to ensure DOM elements are ready
      const timer = setTimeout(() => {
        setRun(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    // Save tour completion status to localStorage
    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem(`tour-${tourId}-completed`, 'true');
      setRun(false);
      
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      disableScrolling={false}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          primaryColor: '#3b82f6',
          textColor: '#334155',
          zIndex: 10000,
        },
        spotlight: {
          backgroundColor: 'transparent',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          fontSize: 14,
          padding: '8px 15px',
        },
        buttonBack: {
          color: '#64748b',
          fontSize: 14,
          marginRight: 10,
        },
        buttonSkip: {
          color: '#64748b',
          fontSize: 14,
        }
      }}
      callback={handleJoyrideCallback}
    />
  );
}