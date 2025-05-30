import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  BarChart,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Filter,
  Share2,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sample data for charts
const campaignPerformanceData = [
  { name: "Jan", impressions: 4000, clicks: 2400, conversions: 800 },
  { name: "Feb", impressions: 3000, clicks: 1398, conversions: 500 },
  { name: "Mar", impressions: 2000, clicks: 1800, conversions: 600 },
  { name: "Apr", impressions: 2780, clicks: 908, conversions: 320 },
  { name: "May", impressions: 1890, clicks: 1800, conversions: 790 },
  { name: "Jun", impressions: 2390, clicks: 2800, conversions: 1200 },
  { name: "Jul", impressions: 3490, clicks: 3300, conversions: 1500 },
];

const contentTypeData = [
  { name: "Email", value: 40 },
  { name: "Landing Page", value: 25 },
  { name: "Ad Copy", value: 20 },
  { name: "Product Brochure", value: 15 },
];

const COLORS = ["#6366F1", "#8B5CF6", "#F59E0B", "#10B981"];

const userEngagementData = [
  { name: "Week 1", activeUsers: 40, contentCreated: 15 },
  { name: "Week 2", activeUsers: 30, contentCreated: 12 },
  { name: "Week 3", activeUsers: 45, contentCreated: 18 },
  { name: "Week 4", activeUsers: 50, contentCreated: 22 },
];

const aiUsageData = [
  { name: "Mon", usage: 40 },
  { name: "Tue", usage: 30 },
  { name: "Wed", usage: 45 },
  { name: "Thu", usage: 50 },
  { name: "Fri", usage: 65 },
  { name: "Sat", usage: 25 },
  { name: "Sun", usage: 15 },
];

const campaignProgressData = [
  { name: "Summer Collection", progress: 75, status: "active" },
  { name: "Product Launch", progress: 45, status: "active" },
  { name: "Holiday Season", progress: 20, status: "active" },
  { name: "Customer Testimonials", progress: 90, status: "active" },
];

const topPerformingAssetsData = [
  { name: "Summer Sale Email", type: "email", views: 2450, clicks: 820, ctr: 33.5 },
  { name: "Product Launch Post", type: "landing-page", views: 3200, clicks: 960, ctr: 30.0 },
  { name: "Holiday Banner Set", type: "ad-copy", views: 1800, clicks: 540, ctr: 30.0 },
  { name: "Customer Success Story", type: "product-brochure", views: 1200, clicks: 420, ctr: 35.0 },
  { name: "Q4 Marketing Strategy", type: "product-brochure", views: 980, clicks: 290, ctr: 29.6 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>("30d");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <BarChart className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track performance and engagement of your marketing assets
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 items-center">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="summer">Summer Collection</SelectItem>
              <SelectItem value="product">Product Launch</SelectItem>
              <SelectItem value="holiday">Holiday Season</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Assets"
              value="128"
              change="+12%"
              trend="up"
              description="vs. previous period"
              icon={<FileText className="h-5 w-5" />}
              iconBgColor="bg-primary-50 dark:bg-primary-900/30"
              iconColor="text-primary"
            />
            <KpiCard 
              title="Active Campaigns"
              value="4"
              change="+1"
              trend="up"
              description="vs. previous period"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBgColor="bg-green-50 dark:bg-green-900/30"
              iconColor="text-green-500"
            />
            <KpiCard 
              title="Active Users"
              value="16"
              change="+2"
              trend="up"
              description="vs. previous period"
              icon={<Users className="h-5 w-5" />}
              iconBgColor="bg-blue-50 dark:bg-blue-900/30"
              iconColor="text-blue-500"
            />
            <KpiCard 
              title="Avg. Engagement"
              value="32%"
              change="-3%"
              trend="down"
              description="vs. previous period"
              icon={<Eye className="h-5 w-5" />}
              iconBgColor="bg-purple-50 dark:bg-purple-900/30"
              iconColor="text-purple-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Campaign Performance</CardTitle>
                <CardDescription>Impressions, clicks and conversions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={campaignPerformanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs text-gray-500 dark:text-gray-400" />
                      <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderColor: '#E5E7EB',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="#6366F1"
                        fillOpacity={1}
                        fill="url(#colorImpressions)"
                        name="Impressions"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        name="Clicks"
                      />
                      <Area
                        type="monotone"
                        dataKey="conversions"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#colorConversions)"
                        name="Conversions"
                      />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content Type Distribution</CardTitle>
                <CardDescription>Breakdown of content by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-72">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={contentTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {contentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#E5E7EB',
                            borderRadius: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Engagement</CardTitle>
                <CardDescription>Active users and content creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userEngagementData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs text-gray-500 dark:text-gray-400" />
                      <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderColor: '#E5E7EB',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        name="Active Users"
                        stroke="#6366F1" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="contentCreated" 
                        name="Content Created"
                        stroke="#F59E0B" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">AI Generation Usage</CardTitle>
                <CardDescription>Daily AI token consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={aiUsageData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="name" className="text-xs text-gray-500 dark:text-gray-400" />
                      <YAxis className="text-xs text-gray-500 dark:text-gray-400" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderColor: '#E5E7EB',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }} 
                        formatter={(value) => [`${value} tokens`, 'Usage']}
                      />
                      <Bar dataKey="usage" name="AI Tokens Used" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Campaign Progress</CardTitle>
              <CardDescription>Status of your ongoing marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {campaignProgressData.map((campaign) => (
                  <div key={campaign.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                            {campaign.status}
                          </Badge>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            25 assets • 5 team members
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{campaign.progress}%</div>
                    </div>
                    <Progress 
                      value={campaign.progress} 
                      className={
                        campaign.progress > 75 ? "bg-green-100 dark:bg-green-900/30" :
                        campaign.progress > 50 ? "bg-primary-100 dark:bg-primary-900/30" :
                        campaign.progress > 25 ? "bg-amber-100 dark:bg-amber-900/30" :
                        "bg-red-100 dark:bg-red-900/30"
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Start: May 10, 2023
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        End: Jul 15, 2023
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Assets</CardTitle>
              <CardDescription>Assets with highest engagement rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Asset Name</th>
                      <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Views</th>
                      <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Clicks</th>
                      <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">CTR</th>
                      <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformingAssetsData.map((asset, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 font-medium">{asset.name}</td>
                        <td className="py-3 capitalize">{asset.type.replace('-', ' ')}</td>
                        <td className="py-3 text-right">{asset.views.toLocaleString()}</td>
                        <td className="py-3 text-right">{asset.clicks.toLocaleString()}</td>
                        <td className="py-3 text-right font-medium text-green-600 dark:text-green-400">{asset.ctr.toFixed(1)}%</td>
                        <td className="py-3 text-right">
                          <Badge variant="outline" className="ml-auto">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Published
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics for your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                Campaigns analytics content will go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Analyze engagement metrics across different content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                Content analytics details will go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>
                Track user activity and engagement with the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                User engagement analytics will go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

function KpiCard({ title, value, change, trend, description, icon, iconBgColor, iconColor }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <div className="flex items-center mt-1">
              {trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <span 
                className={
                  trend === "up" 
                    ? "text-sm text-green-500" 
                    : trend === "down" 
                    ? "text-sm text-red-500" 
                    : "text-sm text-gray-500"
                }
              >
                {change}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{description}</span>
            </div>
          </div>
          <div className={`p-2 rounded-md ${iconBgColor}`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
