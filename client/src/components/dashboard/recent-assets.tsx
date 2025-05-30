import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Mail, 
  FileText, 
  SquareAsterisk, 
  Presentation, 
  MoreVertical, 
  PenLine,
  Grid2X2, 
  List 
} from "lucide-react";
import { Asset } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

interface RecentAssetsProps {
  assets: Asset[];
}

export default function RecentAssets({ assets }: RecentAssetsProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Assets</h2>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8"
          >
            <List className="h-4 w-4 mr-1" /> List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8"
          >
            <Grid2X2 className="h-4 w-4 mr-1" /> Grid
          </Button>
        </div>
      </div>

      <Card>
        {viewMode === "list" ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{asset.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{getAssetTypeLabel(asset.type)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{getAssetTypeLabel(asset.type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {asset.campaignId ? `Campaign #${asset.campaignId}` : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(asset.createdAt), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AssetStatusBadge status={asset.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/assets/${asset.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                            <PenLine className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        ) : (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="border overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{asset.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getAssetTypeLabel(asset.type)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <AssetStatusBadge status={asset.status} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(asset.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-900 flex justify-end">
                  <Link href={`/assets/${asset.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function getAssetIcon(type: string) {
  switch (type) {
    case "email":
      return <Mail className="h-5 w-5" />;
    case "landing-page":
      return <FileText className="h-5 w-5" />;
    case "ad-copy":
      return <SquareAsterisk className="h-5 w-5" />;
    case "product-brochure":
      return <Presentation className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

function getAssetTypeLabel(type: string) {
  switch (type) {
    case "email":
      return "Email";
    case "landing-page":
      return "Landing Page";
    case "ad-copy":
      return "Ad Copy";
    case "product-brochure":
      return "Product Brochure";
    default:
      return type;
  }
}

function AssetStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "published":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          Published
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
          Draft
        </Badge>
      );
    case "in-review":
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400">
          In Review
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          {status}
        </Badge>
      );
  }
}

export const mockAssets: Asset[] = [
  {
    id: 1,
    name: "Summer Sale Announcement",
    description: "Email for the upcoming summer sale",
    type: "email",
    content: "Hello {customer},\n\nWe're excited to announce our summer sale...",
    status: "published",
    campaignId: 1,
    createdById: 1,
    createdAt: new Date("2023-06-15T10:30:00"),
    updatedAt: new Date("2023-06-15T15:45:00"),
    targetAudience: "Existing customers",
    tone: "Enthusiastic",
    brandStyle: "Casual",
    versionHistory: [
      { version: 1, content: "Initial draft", timestamp: "2023-06-15T10:30:00Z" },
      { version: 2, content: "Final version", timestamp: "2023-06-15T15:45:00Z" }
    ]
  },
  {
    id: 2,
    name: "Product Launch Blog Post",
    description: "Blog article announcing new product line",
    type: "landing-page",
    content: "# Introducing Our New Product Line\n\nWe're thrilled to...",
    status: "draft",
    campaignId: 2,
    createdById: 1,
    createdAt: new Date("2023-06-14T15:45:00"),
    updatedAt: new Date("2023-06-14T15:45:00"),
    targetAudience: "Tech enthusiasts",
    tone: "Professional",
    brandStyle: "Corporate",
    versionHistory: [
      { version: 1, content: "Initial draft", timestamp: "2023-06-14T15:45:00Z" }
    ]
  },
  {
    id: 3,
    name: "Holiday Banner Set",
    description: "Banner ads for holiday campaign",
    type: "ad-copy",
    content: "Celebrate the Season with 30% Off!\nLimited Time Offer.",
    status: "in-review",
    campaignId: 3,
    createdById: 1,
    createdAt: new Date("2023-06-13T12:30:00"),
    updatedAt: new Date("2023-06-14T09:15:00"),
    targetAudience: "Holiday shoppers",
    tone: "Festive",
    brandStyle: "Seasonal",
    versionHistory: [
      { version: 1, content: "Initial concept", timestamp: "2023-06-13T12:30:00Z" },
      { version: 2, content: "Revised copy", timestamp: "2023-06-14T09:15:00Z" }
    ]
  },
  {
    id: 4,
    name: "Customer Success Story",
    description: "Case study of a successful customer implementation",
    type: "product-brochure",
    content: "# Customer Success: Global Enterprises\n\nHow Global Enterprises increased efficiency by 40%...",
    status: "published",
    campaignId: 4,
    createdById: 1,
    createdAt: new Date("2023-06-12T14:00:00"),
    updatedAt: new Date("2023-06-14T11:30:00"),
    targetAudience: "Potential enterprise customers",
    tone: "Professional",
    brandStyle: "Corporate",
    versionHistory: [
      { version: 1, content: "Draft content", timestamp: "2023-06-12T14:00:00Z" },
      { version: 2, content: "Added customer quotes", timestamp: "2023-06-13T10:30:00Z" },
      { version: 3, content: "Final version", timestamp: "2023-06-14T11:30:00Z" }
    ]
  },
  {
    id: 5,
    name: "Q4 Marketing Strategy",
    description: "Presentation outlining Q4 marketing plans",
    type: "product-brochure",
    content: "# Q4 Marketing Strategy\n\n## Objectives\n1. Increase customer engagement\n2. Launch winter campaign\n3. Expand social media presence",
    status: "published",
    campaignId: null,
    createdById: 1,
    createdAt: new Date("2023-06-10T09:00:00"),
    updatedAt: new Date("2023-06-15T13:45:00"),
    targetAudience: "Internal team",
    tone: "Strategic",
    brandStyle: "Corporate",
    versionHistory: [
      { version: 1, content: "Initial outline", timestamp: "2023-06-10T09:00:00Z" },
      { version: 2, content: "Added details and metrics", timestamp: "2023-06-12T11:30:00Z" },
      { version: 3, content: "Updated with feedback", timestamp: "2023-06-15T13:45:00Z" }
    ]
  }
];
