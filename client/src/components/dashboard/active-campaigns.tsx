import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Campaign } from "@shared/schema";

interface ActiveCampaignsProps {
  campaigns: Campaign[];
}

export default function ActiveCampaigns({ campaigns }: ActiveCampaignsProps) {
  // Sort campaigns by progress descending
  const sortedCampaigns = [...campaigns].sort((a, b) => b.progress - a.progress);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Active Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No active campaigns. Start one today!</p>
          </div>
        ) : (
          sortedCampaigns.map((campaign) => (
            <div key={campaign.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{campaign.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{campaign.progress}%</span>
              </div>
              <Progress 
                value={campaign.progress} 
                className={`h-1.5 ${getProgressColorClass(campaign.progress)}`}
              />
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800">
        <Link href="/assets?filter=campaigns">
          <a className="text-sm font-medium text-primary hover:text-primary/80">
            View all campaigns
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

function getProgressColorClass(progress: number): string {
  if (progress >= 75) return "bg-green-500";
  if (progress >= 50) return "bg-primary";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-red-500";
}

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Collection",
    description: "Promote our new summer fashion line",
    progress: 75,
    status: "active",
    createdById: 1,
    createdAt: new Date("2023-05-10T09:00:00")
  },
  {
    id: 2,
    name: "Product Launch",
    description: "New tech gadget line release campaign",
    progress: 45,
    status: "active",
    createdById: 1,
    createdAt: new Date("2023-05-15T11:30:00")
  },
  {
    id: 3,
    name: "Holiday Season",
    description: "Winter holiday promotional campaign",
    progress: 20,
    status: "active",
    createdById: 1,
    createdAt: new Date("2023-05-20T14:15:00")
  },
  {
    id: 4,
    name: "Customer Testimonials",
    description: "Showcasing customer success stories",
    progress: 90,
    status: "active",
    createdById: 1,
    createdAt: new Date("2023-05-05T10:45:00")
  }
];
