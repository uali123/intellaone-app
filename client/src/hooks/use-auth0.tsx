import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Define the user type based on Auth0 profile
type Auth0User = {
  id: number;
  email: string;
  fullName: string;
  username: string | null;
  role: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  authMethod: string;
};

type Auth0ContextType = {
  user: Auth0User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export const Auth0Context = createContext<Auth0ContextType | null>(null);

export function Auth0Provider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Auth0User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user");
        if (res.status === 401) {
          setIsAuthenticated(false);
          return null;
        }
        const data = await res.json();
        setIsAuthenticated(true);
        return data;
      } catch (err) {
        setIsAuthenticated(false);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
  });

  // Login function - redirects to Auth0
  const login = () => {
    // Redirect to Auth0 login page with return_to parameter for proper redirection after login
    window.location.href = `/api/auth/login?return_to=${window.location.origin}/dashboard`;
  };

  // Logout function - calls Auth0 logout
  const logout = () => {
    // Redirect to Auth0 logout endpoint which will clear the session and redirect back to the app
    window.location.href = `/api/auth/logout?return_to=${window.location.origin}`;
  };

  useEffect(() => {
    // Check if the URL contains error parameters from Auth0
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      toast({
        title: "Authentication Error",
        description: errorDescription || "Failed to authenticate",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <Auth0Context.Provider
      value={{
        user: user || null,
        isLoading,
        error: error || null,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth0() {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error("useAuth0 must be used within an Auth0Provider");
  }
  return context;
}