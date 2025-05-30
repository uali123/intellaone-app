import { useState, useEffect } from "react";
import { 
  runMavenResearch, 
  createMatrixMessaging,
  createMatrixDocument,
  planMaxCampaign,
  AgentName,
  AgentParams
} from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import { useFreeTrial } from "@/components/free-trial/free-trial-banner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MagicWandButton } from "@/components/ui/magic-wand-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import FancyMatrixOutput from "@/components/ai/fancy-matrix-output";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrainCircuit,
  FileText,
  Globe,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Save,
  Copy,
  Share2,
  Lightbulb,
  MousePointerClick,
  ChevronRight,
  Loader2,
  Search,
  SearchX,
  HelpCircle,
  Download,
  Brain,
  Share,
  BookOpen,
  FileQuestion,
  Zap,
  Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductTour from "@/components/onboarding/product-tour";