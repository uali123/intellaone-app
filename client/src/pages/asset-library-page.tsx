import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Asset, Campaign } from "@shared/schema";

import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  Grid2X2, 
  List, 
  FileText, 
  Mail,
  SquareAsterisk,
  Presentation,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import { mockAssets } from "@/components/dashboard/recent-assets";

// Type for filter options
interface Filters {
  type: string[];
  status: string[];
  campaign: number | null;
  search: string;
}

export default function AssetLibraryPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "shared">("all");
  const [filters, setFilters] = useState<Filters>({
    type: [],
    status: [],
    campaign: null,
    search: ""
  });

  // Get query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const filterParam = searchParams.get('filter');
    const campaignParam = searchParams.get('campaign');
    
    if (filterParam === 'campaigns') {
      setActiveTab('all');
    }
    
    if (campaignParam) {
      setFilters(prev => ({
        ...prev,
        campaign: parseInt(campaignParam)
      }));
    }
  }, [location]);

  // Fetch assets
  const { data: assets = [], isLoading: isLoadingAssets } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Fetch campaigns for filters
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Filter assets based on active tab and filters
  const filteredAssets = assets.length > 0 ? 
    assets.filter(asset => {
      // Filter by tab
      if (activeTab === "mine" && asset.createdById !== user?.id) return false;
      if (activeTab === "shared" && asset.createdById === user?.id) return false;
      
      // Filter by type
      if (filters.type.length > 0 && !filters.type.includes(asset.type)) return false;
      
      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(asset.status)) return false;
      
      // Filter by campaign
      if (filters.campaign !== null && asset.campaignId !== filters.campaign) return false;
      
      // Filter by search
      if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    }) : 
    mockAssets;

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  // Toggle filter
  const toggleFilter = (filterType: 'type' | 'status', value: string) => {
    setFilters(prev => {
      const currentFilters = prev[filterType];
      if (Array.isArray(currentFilters)) {
        if (currentFilters.includes(value)) {
          return {
            ...prev,
            [filterType]: currentFilters.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [filterType]: [...currentFilters, value]
          };
        }
      }
      return prev;
    });
  };

  // Set campaign filter
  const setCampaignFilter = (campaignId: number | null) => {
    setFilters(prev => ({ ...prev, campaign: campaignId }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: [],
      status: [],
      campaign: null,
      search: ""
    });
  };

  // Get asset icon
  const getAssetIcon = (type: string) => {
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
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
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
  };

  return (
    <AppShell title="Asset Library">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Asset Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and organize your marketing content
          </p>
        </div>
        <Link href="/assets/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Asset
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search assets by name..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filters {(filters.type.length > 0 || filters.status.length > 0 || filters.campaign !== null) && 
                    <Badge variant="secondary" className="ml-2">
                      {filters.type.length + filters.status.length + (filters.campaign !== null ? 1 : 0)}
                    </Badge>
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter Assets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 pt-2">
                  Type
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('type', 'email')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.type.includes('email') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <Mail className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('type', 'landing-page')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.type.includes('landing-page') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <FileText className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  Landing Page
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('type', 'ad-copy')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.type.includes('ad-copy') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <SquareAsterisk className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  Ad Copy
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('type', 'product-brochure')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.type.includes('product-brochure') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <Presentation className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  Product Brochure
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 pt-2">
                  Status
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('status', 'draft')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.status.includes('draft') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('status', 'in-review')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.status.includes('in-review') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  In Review
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleFilter('status', 'published')}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.status.includes('published') ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  Published
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 pt-2">
                  Campaign
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setCampaignFilter(null)}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {filters.campaign === null ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </div>
                  <span>All Campaigns</span>
                </DropdownMenuItem>
                
                {campaigns.map(campaign => (
                  <DropdownMenuItem 
                    key={campaign.id}
                    onClick={() => setCampaignFilter(campaign.id)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {filters.campaign === campaign.id ? <CheckCircle2 className="h-3 w-3" /> : null}
                    </div>
                    <Tag className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    {campaign.name}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={clearFilters} className="text-primary focus:text-primary">
                  Clear all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                className={`rounded-none ${viewMode === 'grid' ? '' : 'border-0'}`}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" />
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={`rounded-none ${viewMode === 'list' ? '' : 'border-0'}`}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(filters.type.length > 0 || filters.status.length > 0 || filters.campaign !== null) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.type.map(type => (
              <Badge key={type} variant="outline" className="flex gap-1 items-center">
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                <button 
                  className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 h-4 w-4 inline-flex items-center justify-center"
                  onClick={() => toggleFilter('type', type)}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1L5 5M5 1L1 5" />
                  </svg>
                </button>
              </Badge>
            ))}
            
            {filters.status.map(status => (
              <Badge key={status} variant="outline" className="flex gap-1 items-center">
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                <button 
                  className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 h-4 w-4 inline-flex items-center justify-center"
                  onClick={() => toggleFilter('status', status)}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1L5 5M5 1L1 5" />
                  </svg>
                </button>
              </Badge>
            ))}
            
            {filters.campaign !== null && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Campaign: {campaigns.find(c => c.id === filters.campaign)?.name || `#${filters.campaign}`}
                <button 
                  className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 h-4 w-4 inline-flex items-center justify-center"
                  onClick={() => setCampaignFilter(null)}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1L5 5M5 1L1 5" />
                  </svg>
                </button>
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "all" | "mine" | "shared")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="mine">My Assets</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoadingAssets ? (
            <div className="text-center py-12">
              Loading assets...
            </div>
          ) : filteredAssets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No assets found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                  {filters.type.length > 0 || filters.status.length > 0 || filters.campaign !== null || filters.search 
                    ? "Try adjusting your filters or search query."
                    : "Get started by creating your first marketing asset."}
                </p>
                {filters.type.length > 0 || filters.status.length > 0 || filters.campaign !== null || filters.search ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/assets/new">
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Create Asset
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-shrink-0 h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                        {getAssetIcon(asset.type)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-base mt-3 truncate">{asset.name}</CardTitle>
                    <CardDescription className="truncate">
                      {asset.description || `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1).replace('-', ' ')}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-0">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(new Date(asset.createdAt), "MMM d, yyyy")}
                        </div>
                        {getStatusBadge(asset.status)}
                      </div>
                      {asset.campaignId && (
                        <div className="flex items-center">
                          <Tag className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {campaigns.find(c => c.id === asset.campaignId)?.name || `Campaign #${asset.campaignId}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-end">
                    <Link href={`/assets/${asset.id}`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                              {getAssetIcon(asset.type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{asset.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {asset.description?.substring(0, 40) || (asset.description && asset.description.length > 40 ? '...' : '')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1).replace('-', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {asset.campaignId ? (
                              campaigns.find(c => c.id === asset.campaignId)?.name || `#${asset.campaignId}`
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(asset.createdAt), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(asset.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/assets/${asset.id}`}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {/* Same structure as "all" tab but filtered for user's assets */}
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          {/* Same structure as "all" tab but filtered for shared assets */}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
