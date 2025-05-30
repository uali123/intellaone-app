import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { MoonIcon, SunIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PublicAppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function PublicAppShell({ children }: PublicAppShellProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isFreeTrial, setIsFreeTrial] = useState(false);

  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  // Check if user is in free trial mode
  useEffect(() => {
    const freeTrialMode = localStorage.getItem("free-trial-mode") === "true";
    setIsFreeTrial(freeTrialMode);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header for public pages */}
      <header className="border-b bg-background z-10">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="font-bold text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  IntellaOne
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                      <AvatarFallback>
                        {user?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isFreeTrial ? (
              // In free trial mode, just show a simple sign in link
              <Link href="/auth">
                <Button variant="outline" size="sm" className="border-gray-200">
                  <User className="h-4 w-4 mr-2 opacity-70" />
                  Sign In
                </Button>
              </Link>
            ) : (
              // Normal mode - show both sign in and sign up
              <>
                <Link href="/auth">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>

                <Link href="/auth">
                  <Button variant="default" size="sm">
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">{children}</div>
      </main>

      {/* Simple footer */}
      <footer className="border-t bg-background py-4">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 IntellaOne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
