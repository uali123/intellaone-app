import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/hooks/use-auth";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Use localStorage for testing purposes
  const [userFromStorage, setUserFromStorage] = useState<any>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserFromStorage(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
  }, []);
  
  // Try to use auth, but fall back to localStorage
  let user;
  try {
    const authResult = useAuth();
    user = authResult.user || userFromStorage;
  } catch (e) {
    user = userFromStorage;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header
          user={user}
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
