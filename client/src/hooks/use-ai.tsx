import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AiDraft, InsertAiDraft } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AiContextType = {
  drafts: AiDraft[];
  isLoading: boolean;
  error: Error | null;
  createDraftMutation: ReturnType<typeof useCreateDraftMutation>;
  pollingEnabled: boolean;
  setPollingEnabled: (enabled: boolean) => void;
};

const AiContext = createContext<AiContextType | null>(null);

function useCreateDraftMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (draftData: InsertAiDraft) => {
      const res = await apiRequest("POST", "/api/ai-drafts", draftData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-drafts"] });
      toast({
        title: "AI Draft Created",
        description:
          "Your content is being generated. We'll notify you when it's ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create AI draft",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function AiProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [pollingEnabled, setPollingEnabled] = useState(true);

  const {
    data: drafts = [],
    error,
    isLoading,
  } = useQuery<AiDraft[], Error>({
    queryKey: ["/api/ai-drafts"],
    refetchInterval: pollingEnabled ? 5050 : false, // Poll every 5 seconds if enabled
  });

  const createDraftMutation = useCreateDraftMutation();

  // Monitor drafts for completion
  useEffect(() => {
    const processingDrafts = drafts.filter(
      (draft) => draft.status === "processing"
    );

    const completedDrafts = drafts.filter(
      (draft) => draft.status === "complete" && draft.progress === 100
    );

    // Check if any drafts were just completed (compare with previous state)
    if (completedDrafts.length > 0) {
      completedDrafts.forEach((draft) => {
        toast({
          title: "AI Content Ready",
          description: `"${draft.name}" has been generated successfully.`,
        });
      });
    }

    // Disable polling if no drafts are processing
    if (processingDrafts.length === 0 && pollingEnabled) {
      setPollingEnabled(false);
    } else if (processingDrafts.length > 0 && !pollingEnabled) {
      setPollingEnabled(true);
    }
  }, [drafts, pollingEnabled, toast]);

  return (
    <AiContext.Provider
      value={{
        drafts,
        isLoading,
        error,
        createDraftMutation,
        pollingEnabled,
        setPollingEnabled,
      }}
    >
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error("useAi must be used within an AiProvider");
  }
  return context;
}
