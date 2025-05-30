import { useState } from "react";
import { User } from "@shared/schema";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  user: User;
  title?: string;
  onMenuClick: () => void;
}

export default function Header({ user, title, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-3 flex items-center">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
              <i className="ri-brain-line text-lg"></i>
            </div>
            <h1 className="text-lg font-semibold ml-2">IntellaOne</h1>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-2 lg:px-0 ml-8 md:ml-0">
          <form onSubmit={handleSearch} className="w-full max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                className="block w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 text-sm placeholder-gray-500"
                placeholder="Search assets, campaigns, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-600 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-950"></span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-600"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <img
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.fullName
                      )}&background=random`
                    }
                    alt="Profile"
                    referrerPolicy="no-refferer"
                    className="h-8 w-8 rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-gray-500 font-normal -mt-2">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
