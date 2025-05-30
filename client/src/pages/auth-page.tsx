import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import {
  Brain,
  Sparkles,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if already in free trial mode
    const freeTrialMode = localStorage.getItem("free-trial-mode") === "true";
    setIsFreeTrial(freeTrialMode);
  }, []);

  // Login (placeholder for future implementation)
  const handleLogin = () => {
    // For now, we'll use the free trial mode as a placeholder
    // localStorage.setItem("free-trial-mode", "true");
    toast({
      title: "Login Successful",
      description: "Welcome to IntellaOne platform",
    });
    setLocation("/dashboard");
  };

  // Try free version without login
  const handleTryFree = () => {
    // localStorage.setItem("free-trial-mode", "true");
    toast({
      title: "Free Trial Mode Enabled",
      description: "You now have access to the platform's basic features",
    });
    setLocation("/agents");
  };

  // If already authenticated or in free trial mode, redirect to appropriate page
  if (isAuthenticated || isFreeTrial) {
    return <Redirect to="/agents" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Login Options */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Welcome to IntellaOne
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Sign in to access your marketing dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Login button */}
              <Button className="w-full h-12 text-base" onClick={handleLogin}>
                Sign in
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Google Login Button */}
              <GoogleLoginButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 text-base"
                onClick={handleTryFree}
              >
                Try it now - No sign up required
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="flex-1 bg-primary-50 dark:bg-gray-800 p-6 md:p-10 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center text-white mb-6">
              <Brain className="h-6 w-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              IntellaOne
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6">
              Supercharge your marketing with AI-powered content creation
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create, manage, and collaborate on marketing assets with the power
              of artificial intelligence. Streamline your workflow and boost
              your team's productivity.
            </p>
          </div>

          <div className="space-y-4">
            <FeatureItem
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              title="AI-Powered Content Generation"
              description="Create personalized marketing content in seconds with advanced AI"
            />
            <FeatureItem
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              title="Streamlined Workflows"
              description="Organize assets by campaigns, track versions, and manage approvals"
            />
            <FeatureItem
              icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
              title="Team Collaboration"
              description="Work together with real-time comments and notifications"
            />
            <FeatureItem
              icon={<Clock className="h-5 w-5 text-purple-500" />}
              title="Save Time & Resources"
              description="Reduce content creation time by up to 70% with smart templates"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex">
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-white dark:bg-gray-700 shadow-sm">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
