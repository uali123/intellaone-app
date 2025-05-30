import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { setFreeTrial } from "@/lib/queryClient";

// The maximum number of generations allowed in trial mode
const MAX_TRIAL_GENERATIONS = 3;

// Empty component to maintain exports (for compatibility)
export function FreeTrialBanner() {
  return null;
}

// Helper hook for trial management
export function useFreeTrial() {
  // A global store of how many generations the user has done in free trial mode
  const [trialGenerations, setTrialGenerations] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('trial-generations');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Try to use Auth context if available, otherwise assume not authenticated
  let isAuthenticated = false;
  try {
    const { user } = useAuth();
    isAuthenticated = !!user;
  } catch (e) {
    // Auth context not available, default to not authenticated
    console.log("Auth context not available, assuming not authenticated");
  }
  
  useEffect(() => {
    // Set the global free trial state based on authentication
    if (!isAuthenticated) {
      setFreeTrial(true);
    }
  }, [isAuthenticated]);
  
  // Calculate remaining generations
  const remaining = MAX_TRIAL_GENERATIONS - trialGenerations;
  const isLimitReached = trialGenerations >= MAX_TRIAL_GENERATIONS;
  
  // Function to increment generation count
  const incrementGenerations = () => {
    if (isAuthenticated) return; // Only track for non-authenticated users
    
    const newCount = trialGenerations + 1;
    setTrialGenerations(newCount);
    localStorage.setItem('trial-generations', newCount.toString());
  };
  
  return {
    inFreeTrial: !isAuthenticated,
    trialGenerations,
    remaining,
    isLimitReached,
    incrementGenerations,
  };
}