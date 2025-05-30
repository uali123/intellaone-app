import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { OnboardingStep } from '@/components/onboarding/progress-indicator';

// Define the onboarding steps
const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'explore',
    label: 'Explore Agents',
    completed: false,
  },
  {
    id: 'try-agent',
    label: 'Try an Agent',
    completed: false,
  },
  {
    id: 'preview-results',
    label: 'Preview Results',
    completed: false,
  },
  {
    id: 'create-account',
    label: 'Create Account',
    completed: false,
  },
];

type OnboardingContextType = {
  steps: OnboardingStep[];
  currentStepIndex: number;
  currentStep: OnboardingStep;
  currentStepId: string;
  completeStep: (stepId: string) => void;
  setCurrentStep: (stepId: string) => void;
  resetOnboarding: () => void;
  isOnboardingCompleted: boolean;
  isOnboardingStarted: boolean;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<OnboardingStep[]>(() => {
    const savedSteps = localStorage.getItem('onboarding-steps');
    return savedSteps ? JSON.parse(savedSteps) : defaultOnboardingSteps;
  });
  
  const [isOnboardingStarted, setIsOnboardingStarted] = useState<boolean>(() => {
    return localStorage.getItem('onboarding-started') === 'true';
  });

  // Save steps to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('onboarding-steps', JSON.stringify(steps));
  }, [steps]);

  // Track current step separately since it's not part of the OnboardingStep interface anymore
  const [currentStepId, setCurrentStepId] = useState<string>('explore');
  
  // Find the current step index based on the current step ID
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  
  // Get the current step object
  const currentStep = steps[currentStepIndex >= 0 ? currentStepIndex : 0];
  
  // Check if onboarding is completed (all steps completed)
  const isOnboardingCompleted = steps.every(step => step.completed);

  // Complete a step and move to the next
  const completeStep = (stepId: string) => {
    setIsOnboardingStarted(true);
    localStorage.setItem('onboarding-started', 'true');
    
    const updatedSteps = steps.map(step => {
      // Find the step to complete
      if (step.id === stepId) {
        return { ...step, completed: true };
      }
      return step;
    });
    
    // Find the current step index
    const completedIndex = steps.findIndex(s => s.id === stepId);
    
    // Set the next step as current if it exists
    if (completedIndex < steps.length - 1) {
      setCurrentStepId(steps[completedIndex + 1].id);
    }
    
    setSteps(updatedSteps);
  };

  // Set a specific step as the current step
  const setCurrentStep = (stepId: string) => {
    setIsOnboardingStarted(true);
    localStorage.setItem('onboarding-started', 'true');
    setCurrentStepId(stepId);
  };

  // Reset the onboarding process
  const resetOnboarding = () => {
    setSteps(defaultOnboardingSteps);
    setIsOnboardingStarted(false);
    localStorage.removeItem('onboarding-started');
  };

  return (
    <OnboardingContext.Provider
      value={{
        steps,
        currentStepIndex,
        currentStep,
        currentStepId,
        completeStep,
        setCurrentStep,
        resetOnboarding,
        isOnboardingCompleted,
        isOnboardingStarted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
}

// Safe version for components that might render outside the provider
export function useSafeOnboarding() {
  try {
    return useOnboarding();
  } catch (e) {
    console.error("Onboarding context not available:", e);
    // Return default values
    return {
      steps: defaultOnboardingSteps,
      currentStepIndex: 0,
      currentStep: defaultOnboardingSteps[0],
      currentStepId: 'explore',
      completeStep: () => {},
      setCurrentStep: () => {},
      resetOnboarding: () => {},
      isOnboardingCompleted: false,
      isOnboardingStarted: false,
    };
  }
}