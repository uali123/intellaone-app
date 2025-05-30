// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useLocation } from "wouter";

// interface User {
//   id: string;
//   email: string;
//   fullName: string;
//   role: string;
//   avatarUrl?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   login: () => void;
//   logout: () => Promise<void>;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [, setLocation] = useLocation();

//   useEffect(() => {
//     // Check for token in URL (after OAuth redirect)
//     const params = new URLSearchParams(window.location.search);
//     const tokenFromUrl = params.get("token");

//     if (tokenFromUrl) {
//       setToken(tokenFromUrl);
//       localStorage.setItem("token", tokenFromUrl);
//       // Remove token from URL
//       window.history.replaceState({}, document.title, window.location.pathname);
//     } else {
//       // Check for token in localStorage
//       const storedToken = localStorage.getItem("token");
//       if (storedToken) {
//         setToken(storedToken);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!token && !localStorage.getItem("token")) {
//         console.log("No token found");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch("http://localhost:5050/api/auth/user", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//         });

//         if (response.ok) {
//           const userData = await response.json();
//           setUser(userData);
//         } else {
//           // Token is invalid or expired
//           setToken(null);
//           localStorage.removeItem("token");
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [token]);

//   const login = () => {
//     // Redirect to Google OAuth endpoint
//     window.location.href = "http://localhost:5050/api/auth/google";
//   };

//   const logout = async () => {
//     try {
//       await fetch("http://localhost:5050/api/auth/logout", {
//         credentials: "include",
//       });
//     } catch (error) {
//       console.error("Error during logout:", error);
//     } finally {
//       setUser(null);
//       setToken(null);
//       localStorage.removeItem("token");
//       setLocation("/agents");
//     }
//   };

//   const value = {
//     user,
//     token,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     loading,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const backendURL = import.meta.env.VITE_BACKEND_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check for token in URL (after OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      localStorage.setItem("token", tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check for token in localStorage
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token && !localStorage.getItem("token")) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendURL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token is invalid or expired
          setToken(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${backendURL}/api/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${backendURL}/api/auth/logout`, {
        credentials: "include",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      setLocation("/agents");
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
