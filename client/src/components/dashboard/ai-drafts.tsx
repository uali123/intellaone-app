import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { AiDraft } from "@shared/schema";

interface AiDraftsProps {
  drafts: AiDraft[];
}

export default function AiDrafts({ drafts }: AiDraftsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>AI Drafts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {drafts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No AI drafts yet. Create your first one!</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{draft.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {draft.status === "complete" 
                      ? `${draft.variations?.length || 0} variations generated` 
                      : "In progress..."}
                  </p>
                </div>
                <StatusBadge status={draft.status} />
              </div>
              
              {draft.status === "processing" && (
                <div className="mt-3 flex space-x-3">
                  <Progress value={draft.progress} className="w-full" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{draft.progress}%</span>
                </div>
              )}
              
              {draft.status === "complete" && (
                <div className="mt-3 flex">
                  <Link href={`/ai-generator?draft=${draft.id}`}>
                    <a className="text-xs text-primary font-medium">View drafts</a>
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800">
        <Link href="/ai-generator">
          <a className="text-sm font-medium text-primary hover:text-primary/80">
            Create new draft
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
        Complete
      </Badge>
    );
  } else if (status === "in-review") {
    return (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
        In Review
      </Badge>
    );
  } else {
    return (
      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
        Processing
      </Badge>
    );
  }
}

export const mockAiDrafts: AiDraft[] = [
  {
    id: 1,
    name: "Summer Sale Email",
    brief: "Promote our summer collection with a focus on beachwear",
    type: "email",
    status: "complete",
    progress: 100,
    variations: [
      { id: 1, name: "Version 1", content: "Summer sale content..." },
      { id: 2, name: "Version 2", content: "More summer content..." },
      { id: 3, name: "Version 3", content: "Another variation..." },
      { id: 4, name: "Version 4", content: "Final variation..." },
      { id: 5, name: "Version 5", content: "Best variation..." }
    ],
    createdById: 1,
    createdAt: new Date("2023-06-15T10:30:00"),
    targetAudience: "Young adults",
    tone: "Playful",
    brandStyle: "Modern"
  },
  {
    id: 2,
    name: "Product Launch Posts",
    brief: "Announce our new tech gadget line focusing on innovation",
    type: "ad-copy",
    status: "in-review",
    progress: 100,
    variations: [
      { id: 1, name: "Version 1", content: "Product launch content..." },
      { id: 2, name: "Version 2", content: "More product content..." },
      { id: 3, name: "Version 3", content: "Another product variation..." }
    ],
    createdById: 1,
    createdAt: new Date("2023-06-14T15:45:00"),
    targetAudience: "Tech enthusiasts",
    tone: "Professional",
    brandStyle: "Minimalist"
  },
  {
    id: 3,
    name: "Holiday Campaign",
    brief: "Create a festive campaign for the winter holidays",
    type: "landing-page",
    status: "processing",
    progress: 65,
    variations: [],
    createdById: 1,
    createdAt: new Date("2023-06-14T09:15:00"),
    targetAudience: "Families",
    tone: "Warm",
    brandStyle: "Traditional"
  }
];
