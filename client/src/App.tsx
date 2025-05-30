import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import AssetLibraryPage from "@/pages/asset-library-page";
import AssetEditorPage from "@/pages/asset-editor-page";
import AiGeneratorPage from "@/pages/ai-generator-page";
import AgentPlaygroundPage from "@/pages/agent-playground-page";
import MatrixAgentPage from "@/pages/matrix-agent-page";
import MatrixPreview from "@/pages/matrix-preview";
import MatrixDemo from "@/pages/matrix-demo";
import CollaborationPage from "@/pages/collaboration-page";
import AnalyticsPage from "@/pages/analytics-page";
import SettingsPage from "@/pages/settings-page";
import AdminModelPage from "@/pages/admin-model-page";
import LandingPage from "@/pages/landing-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import TestEnvVars from "@/pages/TestEnvVars";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ModelCustomizationPage from "@/pages/model-customization";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/test-env" component={TestEnvVars} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/assets" component={AssetLibraryPage} />
      <ProtectedRoute path="/assets/:id" component={AssetEditorPage} />
      <Route path="/ai-generator" component={AiGeneratorPage} />
      <Route path="/agents" component={AgentPlaygroundPage} />
      <Route path="/matrix-agent" component={MatrixAgentPage} />
      <Route path="/matrix-preview" component={MatrixPreview} />
      <Route path="/matrix-demo" component={MatrixDemo} />
      <ProtectedRoute path="/collaboration" component={CollaborationPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/admin/model" component={AdminModelPage} />
      <Route path="/model-customization" component={ModelCustomizationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
