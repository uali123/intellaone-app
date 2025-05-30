import React from 'react';
import { CheckCircle, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface OnboardingStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
}

interface OnboardingProgressIndicatorProps {
  steps: OnboardingStep[];
  currentStepId: string;
}

// The maximum number of generations allowed in trial mode
const MAX_TRIAL_GENERATIONS = 3;



export function OnboardingProgressIndicator({ 
  steps, 
  currentStepId 
}: OnboardingProgressIndicatorProps) {
  // Helper function to provide default descriptions for steps
  function getDefaultDescription(stepId: string): string {
    switch (stepId) {
      case 'choose-agent':
        return "Select which AI marketing specialist you'd like to work with based on your current needs";
      case 'describe-needs':
        return "Tell the AI agent about your campaign goals, target audience, and content requirements";
      case 'view-results':
        return "Review, save, and download your professionally formatted marketing content";
      default:
        return "Complete this step to continue";
    }
  }
  // Calculate the completion percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  // Get the trial generations count from localStorage
  const trialGenerations = React.useMemo(() => {
    const saved = localStorage.getItem('trial-generations');
    return saved ? parseInt(saved, 10) : 0;
  }, []);
  
  // Calculate remaining generations
  const remaining = MAX_TRIAL_GENERATIONS - trialGenerations;
  const percentUsed = (trialGenerations / MAX_TRIAL_GENERATIONS) * 100;
  
  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      {/* Simplified header with generations count */}
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center">
          <div className="relative mr-2 w-4 h-4 animate-pulse">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-50"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
          </div>
          <h3 className="font-medium text-sm">Free Trial Guide</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-xs border-blue-300 text-blue-700 dark:text-blue-300 dark:bg-blue-900/30">
            {remaining} generations left
          </Badge>
          <button className="text-sm px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors" onClick={() => window.location.href = '/auth'}>
            Sign Up
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isCompleted = step.completed;
          
          return (
            <div 
              key={step.id}
              className={cn(
                "relative flex-1 min-w-[100px]",
                index !== steps.length - 1 && "after:hidden md:after:block after:content-[''] after:absolute after:top-4 after:right-[-12px] after:w-6 after:h-[2px]",
                // Change the color of connecting lines based on step status
                index !== steps.length - 1 && isCompleted ? "after:bg-green-300 dark:after:bg-green-700" :
                index !== steps.length - 1 && isActive ? "after:bg-blue-300 dark:after:bg-blue-700" :
                "after:bg-gray-200 dark:after:bg-gray-700"
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "mb-1 flex items-center",
                      // Dim future steps slightly
                      !isActive && !isCompleted && "opacity-70"
                    )}>
                      <div 
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-2 transition-all duration-200",
                          // Use different colors for different states
                          isCompleted ? "bg-green-100 dark:bg-green-900 shadow-sm" : 
                          isActive ? "bg-blue-100 dark:bg-blue-900 shadow-sm animate-pulse" : 
                          "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                          // Scale up the active step slightly
                          isActive && "scale-110"
                        )}
                        style={isActive ? { animationDuration: '3s' } : {}}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <span className={cn(
                            "text-sm font-medium",
                            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                          )}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "text-sm font-medium",
                        isCompleted ? "text-green-600 dark:text-green-400" :
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {step.label}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px] text-center p-3">
                    {step.description || getDefaultDescription(step.id)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className={cn(
                "text-xs ml-10",
                isActive ? "text-blue-600/70 dark:text-blue-400/70" : "text-gray-500/70 dark:text-gray-400/70"
              )}>
                {isActive ? (
                  <span className="font-medium">Current Step</span>
                ) : isCompleted ? (
                  "Completed"
                ) : (
                  <span className="opacity-70">Upcoming</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}