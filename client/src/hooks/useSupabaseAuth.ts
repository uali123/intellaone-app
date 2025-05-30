import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Authentication context type
interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  isFreeTrial: boolean;
  startFreeTrial: () => void;
  authMode: 'supabase' | 'development' | 'free-trial' | null;
  error: Error | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isFreeTrial: false,
  startFreeTrial: () => {},
  authMode: null,
  error: null,
});

// Auth provider component
export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'supabase' | 'development' | 'free-trial' | null>(null);
  const [isFreeTrial, setIsFreeTrial] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check for token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedMode = localStorage.getItem('authMode') as 'supabase' | 'development' | 'free-trial' | null;
    if (storedToken) {
      setToken(storedToken);
      setAuthMode(storedMode);
    }

    const freeTrialActive = localStorage.getItem('freeTrialActive') === 'true';
    if (freeTrialActive) {
      setIsFreeTrial(true);
    }
  }, []);

  // User data query
  const { isLoading, error: fetchError } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    enabled: !!token && !isFreeTrial,
    onSuccess: (data: any) => {
      setUser(data);
    },
    onError: () => {
      // If token is invalid, clear it
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authMode');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; username: string; fullName: string; role: string }) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      setAuthMode(data.mode || 'supabase');
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authMode', data.mode || 'supabase');
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created.',
      });
      
      // Clear free trial status if it was active
      if (isFreeTrial) {
        setIsFreeTrial(false);
        localStorage.removeItem('freeTrialActive');
      }

      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      setAuthMode(data.mode || 'supabase');
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authMode', data.mode || 'supabase');
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      // Clear free trial status if it was active
      if (isFreeTrial) {
        setIsFreeTrial(false);
        localStorage.removeItem('freeTrialActive');
      }

      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Only call the API if we have a token and are not in free trial mode
      if (token && !isFreeTrial) {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Logout failed');
        }

        return response.json();
      }
      
      // For free trial, just return success
      return { message: 'Logged out successfully' };
    },
    onSuccess: () => {
      setUser(null);
      setToken(null);
      setAuthMode(null);
      setIsFreeTrial(false);
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('authMode');
      localStorage.removeItem('freeTrialActive');
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });

      // Clear the query cache
      queryClient.clear();
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to start a free trial
  const startFreeTrial = () => {
    setUser(null);
    setToken(null);
    setAuthMode('free-trial');
    setIsFreeTrial(true);
    localStorage.setItem('freeTrialActive', 'true');
    
    toast({
      title: 'Free trial started',
      description: 'You can now access IntellaOne without logging in.',
    });
  };

  // Set error from fetch error
  useEffect(() => {
    if (fetchError) {
      setError(fetchError as Error);
    }
  }, [fetchError]);

  const isAuthenticated = !!user || isFreeTrial;

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login: (email: string, password: string) => loginMutation.mutateAsync({ username: email, password }),
    register: (email: string, password: string, fullName: string, role = 'marketer') => 
      registerMutation.mutateAsync({ email, password, username: email, fullName, role }),
    logout: () => logoutMutation.mutateAsync(),
    isFreeTrial,
    startFreeTrial,
    authMode,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};