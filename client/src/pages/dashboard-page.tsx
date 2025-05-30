import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Search, 
  BarChart3, 
  FileText, 
  Users, 
  Filter, 
  Copy, 
  Download, 
  Folder, 
  Clock, 
  Edit, 
  Calendar,
  Share2,
  Star,
  StarOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import AppShell from "@/components/layout/app-shell";

type ContentItem = {
  id: number;
  title: string;
  type: 'matrix' | 'maven' | 'max';
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'archived';
  favorited: boolean;
  shared: boolean;
  summary?: string;
  content: any;
  collaborators?: Array<{
    id: number;
    name: string;
    avatar?: string;
  }>;
};

// Simulated data for demo
const MOCK_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 1,
    title: "Product Launch Messaging for IntellaOne",
    type: 'matrix',
    createdAt: "2025-05-18T14:22:10Z",
    updatedAt: "2025-05-18T16:45:33Z",
    creator: {
      id: 1,
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=John"
    },
    status: 'published',
    favorited: true,
    shared: true,
    summary: "Core messaging for the IntellaOne product launch targeting PMMs at enterprise companies",
    content: {
      headline: "IntellaOne: Transform Marketing Content Creation",
      tagline: "AI-Powered Collaboration for Marketing Teams",
      value_proposition: "IntellaOne empowers marketing teams to create better content in less time through AI-powered collaboration tools that optimize creative workflows and streamline project management.",
      key_messages: [
        "Reduce content creation time by 70% with AI-powered assistance",
        "Ensure brand consistency across all marketing materials with intelligent templates",
        "Simplify collaboration with integrated review and approval workflows",
        "Access a library of industry-specific insights and best practices"
      ],
      tone_notes: "Professional, forward-thinking, solution-oriented",
      call_to_action: "Start your 14-day free trial today and transform your marketing content creation process."
    },
    collaborators: [
      {
        id: 2,
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane"
      }
    ]
  },
  {
    id: 2,
    title: "Market Research: AI in Marketing Technology 2025",
    type: 'maven',
    createdAt: "2025-05-15T09:12:22Z",
    updatedAt: "2025-05-15T09:12:22Z",
    creator: {
      id: 1,
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=John"
    },
    status: 'published',
    favorited: false,
    shared: true,
    summary: "Comprehensive research on the state of AI in marketing technology for 2025",
    content: {
      title: "AI in Marketing Technology 2025",
      key_findings: [
        "AI adoption in marketing increased by 45% over the previous year",
        "78% of enterprise companies now use some form of AI in their marketing stack",
        "Content creation and personalization remain the top use cases for AI in marketing"
      ],
      trends: [
        "Increasing focus on ethical AI and transparent algorithms",
        "Integration of AI with existing martech stacks becoming seamless",
        "Rise of specialized AI tools for specific marketing functions"
      ],
      analysis: "The marketing technology landscape continues to be transformed by advances in artificial intelligence. The most significant shift in 2025 has been the democratization of AI tools, making them accessible to small and medium businesses rather than just enterprise organizations.",
      recommendations: [
        "Evaluate current marketing workflows for AI integration opportunities",
        "Invest in training marketing teams on AI capabilities and limitations",
        "Start with specific use cases rather than broad AI implementation"
      ]
    },
    collaborators: [
      {
        id: 2,
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane"
      },
      {
        id: 3,
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex"
      }
    ]
  },
  {
    id: 3,
    title: "Q3 Product Update Campaign Plan",
    type: 'max',
    createdAt: "2025-05-10T11:34:16Z",
    updatedAt: "2025-05-12T14:22:45Z",
    creator: {
      id: 2,
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane"
    },
    status: 'draft',
    favorited: true,
    shared: false,
    summary: "Comprehensive campaign plan for the Q3 product update announcement",
    content: {
      title: "Q3 Product Update Campaign",
      overview: "A multi-channel campaign to announce the Q3 product updates, focusing on the new AI-powered features and integration capabilities",
      target_audience: "Current customers, product marketing managers at enterprise SaaS companies",
      objectives: [
        "Generate excitement about new features among existing users",
        "Drive feature adoption by 40% within first month of release",
        "Position IntellaOne as innovation leader in the marketing technology space"
      ],
      tactics: [
        {
          channel: "Email",
          description: "Segmented email campaign to current users highlighting features relevant to their usage patterns"
        },
        {
          channel: "Webinar",
          description: "Live demonstration of new features with Q&A session"
        },
        {
          channel: "Social Media",
          description: "Teaser campaign with feature highlights and customer testimonials"
        },
        {
          channel: "Content",
          description: "Blog posts and case studies showcasing real-world applications"
        }
      ],
      timeline: [
        {
          phase: "Pre-launch (2 weeks before)",
          activities: "Teaser campaign, beta user testimonials, blog post about industry trends"
        },
        {
          phase: "Launch day",
          activities: "Email announcement, social media push, press release, feature video"
        },
        {
          phase: "Post-launch (Week 1)",
          activities: "Webinar, detailed feature guides, follow-up emails to non-activators"
        },
        {
          phase: "Post-launch (Weeks 2-4)",
          activities: "Case studies, office hours for questions, feedback collection"
        }
      ],
      metrics: [
        "Feature adoption rate (target: 40% in first month)",
        "Webinar registration and attendance (target: 300 registrations, 60% attendance)",
        "Email open and click-through rates (targets: 30% open rate, 5% CTR)",
        "Social media engagement (target: 20% increase in engagement)"
      ]
    }
  },
  {
    id: 4,
    title: "Competitor Analysis: MarketMaster Pro",
    type: 'maven',
    createdAt: "2025-05-05T15:47:33Z",
    updatedAt: "2025-05-05T16:12:08Z",
    creator: {
      id: 3,
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex"
    },
    status: 'published',
    favorited: false,
    shared: true,
    summary: "Detailed analysis of major competitor MarketMaster Pro's features, pricing, and positioning",
    content: {
      title: "Competitor Analysis: MarketMaster Pro",
      key_findings: [
        "MarketMaster Pro recently raised $25M Series B funding",
        "New AI features launched in April 2025 overlap with our roadmap",
        "Pricing increased by 15% for enterprise tier",
        "Customer reviews indicate frustration with complex user interface"
      ],
      analysis: "MarketMaster Pro continues to focus on enterprise customers with complex workflows. Their recent funding gives them runway to expand features, but customer feedback suggests they're struggling with usability. This creates an opportunity for us to position around simplicity and efficiency.",
      recommendations: [
        "Highlight our intuitive UI as a key differentiator in marketing materials",
        "Accelerate development of our collaborative approval workflows",
        "Consider creating migration guide for MarketMaster Pro customers",
        "Monitor their AI roadmap closely for further overlap"
      ]
    }
  },
  {
    id: 5,
    title: "Website Messaging Update",
    type: 'matrix',
    createdAt: "2025-04-30T10:25:18Z",
    updatedAt: "2025-05-01T11:36:42Z",
    creator: {
      id: 1,
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=John"
    },
    status: 'archived',
    favorited: false,
    shared: true,
    summary: "Refreshed messaging for website homepage, focusing on new collaborative features",
    content: {
      headline: "Create, Collaborate, Convert",
      tagline: "The All-in-One Marketing Platform for High-Performance Teams",
      value_proposition: "IntellaOne brings together AI-powered content creation, collaborative workflows, and performance analytics in one seamless platform that helps marketing teams produce better results with less effort.",
      key_messages: [
        "Eliminate content bottlenecks with AI-assisted creation tools",
        "Streamline approval processes with our collaborative workflow engine",
        "Get actionable insights from integrated performance analytics",
        "Ensure brand consistency across all marketing channels"
      ],
      tone_notes: "Confident, solution-oriented, emphasizing efficiency and quality",
      call_to_action: "See how IntellaOne transforms marketing workflows. Schedule a demo today."
    }
  }
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>(MOCK_CONTENT_ITEMS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'matrix' | 'maven' | 'max' | 'favorites' | 'shared'>('all');
  
  // Filter content based on search query and active filter
  useEffect(() => {
    let filtered = [...MOCK_CONTENT_ITEMS];
    
    // Apply text search if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.summary?.toLowerCase().includes(query)
      );
    }
    
    // Apply type/status filters
    if (activeFilter === 'matrix') {
      filtered = filtered.filter(item => item.type === 'matrix');
    } else if (activeFilter === 'maven') {
      filtered = filtered.filter(item => item.type === 'maven');
    } else if (activeFilter === 'max') {
      filtered = filtered.filter(item => item.type === 'max');
    } else if (activeFilter === 'favorites') {
      filtered = filtered.filter(item => item.favorited);
    } else if (activeFilter === 'shared') {
      filtered = filtered.filter(item => item.shared);
    }
    
    setFilteredItems(filtered);
  }, [searchQuery, activeFilter]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Get icon for content type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'matrix':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'maven':
        return <Search className="h-4 w-4 text-blue-500" />;
      case 'max':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get color scheme for content type
  const getTypeColors = (type: string) => {
    switch(type) {
      case 'matrix':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600 dark:text-purple-300',
          hover: 'hover:border-purple-300 dark:hover:border-purple-700'
        };
      case 'maven':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-600 dark:text-blue-300',
          hover: 'hover:border-blue-300 dark:hover:border-blue-700'
        };
      case 'max':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-600 dark:text-green-300',
          hover: 'hover:border-green-300 dark:hover:border-green-700'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          text: 'text-gray-600 dark:text-gray-300',
          hover: 'hover:border-gray-300 dark:hover:border-gray-700'
        };
    }
  };
  
  // Function to handle adding/removing from favorites
  const toggleFavorite = (itemId: number) => {
    const updatedItems = MOCK_CONTENT_ITEMS.map(item => {
      if (item.id === itemId) {
        return {...item, favorited: !item.favorited};
      }
      return item;
    });
    
    // Update the mock data (in a real app, this would be an API call)
    MOCK_CONTENT_ITEMS.splice(0, MOCK_CONTENT_ITEMS.length, ...updatedItems);
    
    // Apply filters again
    const filtered = [...updatedItems];
    setFilteredItems(filtered);
    
    toast({
      title: "Success",
      description: `Item ${updatedItems.find(i => i.id === itemId)?.favorited ? 'added to' : 'removed from'} favorites`,
    });
  };
  
  // Function to handle share action
  const handleShare = (itemId: number) => {
    toast({
      title: "Share dialog",
      description: "Share functionality would open a dialog to manage collaborators",
    });
  };
  
  // Helper to get type name
  const getTypeName = (type: string) => {
    switch(type) {
      case 'matrix':
        return 'Messaging';
      case 'maven':
        return 'Research';
      case 'max':
        return 'Campaign';
      default:
        return 'Content';
    }
  };
  
  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Content Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and collaborate on all your marketing content
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link href="/agent-playground">
              <Button className="bg-primary hover:bg-primary/90">
                Create New Content
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={activeFilter === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="whitespace-nowrap"
            >
              All Content
            </Button>
            <Button
              variant={activeFilter === 'matrix' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('matrix')}
              className="whitespace-nowrap text-purple-600 dark:text-purple-400"
            >
              <MessageSquare className="h-4 w-4 mr-1" /> Messaging
            </Button>
            <Button
              variant={activeFilter === 'maven' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('maven')}
              className="whitespace-nowrap text-blue-600 dark:text-blue-400"
            >
              <Search className="h-4 w-4 mr-1" /> Research
            </Button>
            <Button
              variant={activeFilter === 'max' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('max')}
              className="whitespace-nowrap text-green-600 dark:text-green-400"
            >
              <BarChart3 className="h-4 w-4 mr-1" /> Campaigns
            </Button>
            <Button
              variant={activeFilter === 'favorites' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('favorites')}
              className="whitespace-nowrap"
            >
              <Star className="h-4 w-4 mr-1" /> Favorites
            </Button>
            <Button
              variant={activeFilter === 'shared' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter('shared')}
              className="whitespace-nowrap"
            >
              <Users className="h-4 w-4 mr-1" /> Shared with me
            </Button>
          </div>
        </div>
        
        {/* Content grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const colors = getTypeColors(item.type);
              
              return (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden border ${colors.border} transition-all duration-200 ${colors.hover}`}
                >
                  <div className={`p-4 ${colors.bg} flex justify-between items-start`}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <span className={`text-xs font-medium ${colors.text}`}>
                          {getTypeName(item.type)}
                        </span>
                        
                        {item.status === 'draft' && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950/30">
                            Draft
                          </Badge>
                        )}
                        
                        {item.status === 'archived' && (
                          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-950/30">
                            Archived
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {item.title}
                      </h3>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 transition-colors"
                    >
                      {item.favorited ? (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
                      ) : (
                        <StarOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {item.summary}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Created {formatDate(item.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Updated {formatDate(item.updatedAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <div className="flex -space-x-2 mr-2">
                          <img 
                            src={item.creator.avatar} 
                            alt={item.creator.name}
                            className="w-5 h-5 rounded-full border border-white dark:border-gray-800"
                          />
                          {item.collaborators?.slice(0, 2).map((collaborator) => (
                            <img 
                              key={collaborator.id}
                              src={collaborator.avatar} 
                              alt={collaborator.name}
                              className="w-5 h-5 rounded-full border border-white dark:border-gray-800"
                            />
                          ))}
                          {item.collaborators && item.collaborators.length > 2 && (
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] border border-white dark:border-gray-800">
                              +{item.collaborators.length - 2}
                            </div>
                          )}
                        </div>
                        <span>
                          {item.creator.name}{item.collaborators && item.collaborators.length > 0 && ' + others'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Link href={`/content/${item.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(item.title);
                            toast({ 
                              title: "Copied",
                              description: "Title copied to clipboard"
                            });
                          }}>
                            <Copy className="h-4 w-4 mr-2" /> Copy Title
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(item.id)}>
                            <Share2 className="h-4 w-4 mr-2" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleFavorite(item.id)}
                            className={item.favorited ? "text-yellow-600" : ""}
                          >
                            {item.favorited ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" /> Remove from Favorites
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" /> Add to Favorites
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No content found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {searchQuery ? 'Try a different search term' : 'Create some content to get started'}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/agent-playground">Create New Content</Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}