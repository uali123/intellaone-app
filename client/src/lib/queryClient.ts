import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Add a property to track if user is in free trial mode
// Initialize from localStorage if available
let isFreeTrial = localStorage.getItem('free-trial-mode') === 'true' || false;

// Function to set free trial mode
export function setFreeTrial(value: boolean) {
  isFreeTrial = value;
  // Persist to localStorage
  localStorage.setItem('free-trial-mode', value ? 'true' : 'false');
  console.log("Free trial mode set to:", value);
}

export function getFreeTrial(): boolean {
  return isFreeTrial;
}

// Import the API URL configuration
import { getApiUrl } from './apiConfig';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  freeTrialOverride?: boolean,
  options?: { retries?: number, retryDelay?: number }
): Promise<Response> {
  // Default headers
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // If in free trial mode or explicitly overridden, add the free trial header
  if (isFreeTrial || freeTrialOverride) {
    headers["x-free-trial"] = "true";
  }

  // Get the full API URL for the request
  const fullUrl = getApiUrl(url);
  console.log(`Making API request to: ${fullUrl}`);

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors"
  });

  // Handle 401 Unauthorized by retrying with free trial header if not already in free trial
  if (res.status === 401 && !isFreeTrial && !freeTrialOverride) {
    // Retry with free trial header
    console.log("Unauthorized. Retrying as free trial user...");
    return apiRequest(method, url, data, true);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add free trial header for authenticated-only endpoints
    const headers: Record<string, string> = {};
    if (isFreeTrial) {
      headers["x-free-trial"] = "true";
    }
    
    // Get the full API URL
    const fullUrl = getApiUrl(queryKey[0] as string);
    console.log(`Making GET request to: ${fullUrl}`);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers
    });

    // Handle 401 by retrying with free trial header if not already in free trial
    if (res.status === 401 && !isFreeTrial) {
      console.log("Unauthorized GET request. Retrying as free trial user...");
      const retryRes = await fetch(fullUrl, {
        credentials: "include",
        headers: { "x-free-trial": "true" }
      });
      
      // If retry is successful, set free trial mode
      if (retryRes.ok) {
        setFreeTrial(true);
        return await retryRes.json();
      }
      
      // Otherwise handle 401 as before
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      await throwIfResNotOk(retryRes);
      return await retryRes.json();
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
