import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Brain,
  LayoutDashboard,
  SquareLibrary,
  Sparkles,
  Users,
  BarChart,
  Settings,
  LogOut,
  X,
  LightbulbIcon,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface SidebarProps {
  user: User;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ user, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const onLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Build navigation items based on user role
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location === "/",
    },
    {
      name: "Assets Library",
      href: "/assets",
      icon: SquareLibrary,
      current: location === "/assets",
    },
    {
      name: "AI Generator",
      href: "/ai-generator",
      icon: Sparkles,
      current: location === "/ai-generator",
    },
    {
      name: "Collaboration",
      href: "/collaboration",
      icon: Users,
      current: location === "/collaboration",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart,
      current: location === "/analytics",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
    },
  ];
  
  // Temporarily add Model Customization link for all users for testing
  navigation.push({
    name: "Model Customization",
    href: "/admin/model",
    icon: Brain,
    current: location === "/admin/model",
  });
  
  // Add Matrix Demo page
  navigation.push({
    name: "Matrix Messaging",
    href: "/matrix-demo",
    icon: MessageSquare,
    current: location === "/matrix-demo",
  });

  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white mr-2">
            <Brain className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">IntellaOne</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <a
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-lg group transition-colors",
                item.current
                  ? "bg-primary/10 text-primary border-l-3 border-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <LightbulbIcon className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-sm font-medium text-primary-700 dark:text-primary-400">Pro Tip</h3>
          </div>
          <p className="mt-2 text-xs text-primary-700 dark:text-primary-300">
            Try our new AI assistant to create campaign briefs in seconds.
          </p>
          <button className="mt-3 text-xs font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
            Learn more →
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
            alt="Profile" 
            className="h-8 w-8 rounded-full mr-2"
          />
          <div>
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.jobTitle || user.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="ml-auto text-gray-400 hover:text-gray-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );

  // Large screen sidebar
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="h-full flex flex-col">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
