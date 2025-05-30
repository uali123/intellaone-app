import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "@/components/layout/app-shell";
import { Asset, User, Comment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { mockAssets } from "@/components/dashboard/recent-assets";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MessageSquare,
  Users,
  CheckCircle,
  Clock,
  BellRing,
  MoreVertical,
  ThumbsUp,
  Edit,
  Trash,
  Filter,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Mock comments for demonstration
const mockComments: Comment[] = [
  {
    id: 1,
    content: "The headline feels a bit too generic. Can we make it more specific to our target audience?",
    assetId: 1,
    createdById: 2,
    createdAt: new Date("2023-06-15T14:30:00"),
    parentId: null,
  },
  {
    id: 2,
    content: "I agree. Let's try to incorporate more of our brand voice into the headline.",
    assetId: 1,
    createdById: 3,
    createdAt: new Date("2023-06-15T15:45:00"),
    parentId: 1,
  },
  {
    id: 3,
    content: "Updated the headline to be more specific. Let me know what you think!",
    assetId: 1,
    createdById: 1,
    createdAt: new Date("2023-06-15T16:20:00"),
    parentId: 1,
  },
  {
    id: 4,
    content: "The call-to-action button color doesn't match our brand guidelines. Can we update it?",
    assetId: 2,
    createdById: 4,
    createdAt: new Date("2023-06-14T10:15:00"),
    parentId: null,
  },
  {
    id: 5,
    content: "Good catch. I'll update the button color to match our primary brand color.",
    assetId: 2,
    createdById: 1,
    createdAt: new Date("2023-06-14T11:30:00"),
    parentId: 4,
  },
];

// Mock users for demonstration
const mockUsers: Partial<User>[] = [
  {
    id: 1,
    username: "sarah.johnson",
    fullName: "Sarah Johnson",
    email: "sarah@example.com",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    jobTitle: "Marketing Director",
  },
  {
    id: 2,
    username: "tom.cook",
    fullName: "Tom Cook",
    email: "tom@example.com",
    role: "marketer",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    jobTitle: "Content Strategist",
  },
  {
    id: 3,
    username: "jessica.lee",
    fullName: "Jessica Lee",
    email: "jessica@example.com",
    role: "collaborator",
    avatarUrl: "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    jobTitle: "Graphic Designer",
  },
  {
    id: 4,
    username: "michael.roberts",
    fullName: "Michael Roberts",
    email: "michael@example.com",
    role: "marketer",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    jobTitle: "Content Writer",
  },
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    title: "New Comment",
    description: "Tom Cook commented on Summer Sale Email",
    timestamp: "2 hours ago",
    isRead: false,
    userId: 1,
  },
  {
    id: 2,
    title: "Asset Approved",
    description: "Product Launch Blog Post was approved by Michael Roberts",
    timestamp: "4 hours ago",
    isRead: true,
    userId: 1,
  },
  {
    id: 3,
    title: "Mention",
    description: "Jessica Lee mentioned you in a comment on Holiday Campaign",
    timestamp: "Yesterday",
    isRead: false,
    userId: 1,
  },
  {
    id: 4,
    title: "Asset Ready for Review",
    description: "Summer Collection Ad needs your review",
    timestamp: "2 days ago",
    isRead: true,
    userId: 1,
  },
];

export default function CollaborationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("discussions");
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  // Fetch assets
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin", // Only fetch if user is admin
  });

  // For this page we'll use the mock data since we're demonstrating the UI
  const displayAssets = assets.length > 0 ? assets : mockAssets;
  const displayUsers = users.length > 0 ? users : mockUsers;
  
  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedAsset) return;
    
    try {
      await apiRequest("POST", `/api/assets/${selectedAsset}/comments`, {
        content: commentText,
        assetId: selectedAsset,
        createdById: user?.id,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/assets/${selectedAsset}/comments`] });
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Filter assets by search text
  const filteredAssets = displayAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (asset.description && asset.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Get comments for selected asset
  const getCommentsForAsset = (assetId: number) => {
    return mockComments.filter(comment => comment.assetId === assetId && !comment.parentId);
  };

  // Get replies for a comment
  const getRepliesForComment = (commentId: number) => {
    return mockComments.filter(comment => comment.parentId === commentId);
  };

  // Find user by ID
  const findUser = (userId: number) => {
    return displayUsers.find(u => u.id === userId);
  };

  // Mark notification as read
  const markAsRead = (notificationId: number) => {
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read",
    });
  };

  // Render the discussion panel
  const renderDiscussionPanel = () => {
    if (!selectedAsset) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No asset selected</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
            Select an asset from the list to view and participate in discussions
          </p>
        </div>
      );
    }

    const asset = displayAssets.find(a => a.id === selectedAsset);
    const comments = getCommentsForAsset(selectedAsset);

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{asset?.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {asset?.type.charAt(0).toUpperCase() + asset?.type.slice(1).replace('-', ' ')}
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Be the first to start the discussion</p>
            </div>
          ) : (
            comments.map(comment => {
              const commentUser = findUser(comment.createdById);
              const replies = getRepliesForComment(comment.id);
              
              return (
                <div key={comment.id} className="space-y-4">
                  <div className="flex space-x-3">
                    <Avatar>
                      <AvatarImage src={commentUser?.avatarUrl} />
                      <AvatarFallback>{commentUser?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{commentUser?.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                <span>Like</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="mt-2 text-sm">{comment.content}</p>
                      </div>
                      
                      <div className="flex space-x-2 mt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" /> 0
                        </Button>
                      </div>
                      
                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                          {replies.map(reply => {
                            const replyUser = findUser(reply.createdById);
                            return (
                              <div key={reply.id} className="flex space-x-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={replyUser?.avatarUrl} />
                                  <AvatarFallback>{replyUser?.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                                    <p className="font-medium text-xs">{replyUser?.fullName}</p>
                                    <p className="text-sm">{reply.content}</p>
                                  </div>
                                  <div className="flex space-x-2 mt-1">
                                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                                      <ThumbsUp className="h-3 w-3 mr-1" /> 0
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage 
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}`} 
                alt={user?.fullName} 
              />
              <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea 
                placeholder="Add a comment..." 
                className="w-full min-h-[80px]"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handleSubmitComment} disabled={!commentText.trim()}>
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Collaboration</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Work with your team on marketing assets and campaigns
        </p>
      </div>

      {/* Main Content */}
      <Tabs 
        defaultValue="discussions" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <div className="flex h-[600px] overflow-hidden bg-white dark:bg-gray-950 rounded-lg border">
            {/* Assets List Sidebar */}
            <div className="w-80 border-r overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search assets..." 
                    className="pl-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-auto flex-1">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No assets found</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredAssets.map(asset => (
                      <div 
                        key={asset.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          selectedAsset === asset.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        onClick={() => setSelectedAsset(asset.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{asset.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {asset.type.charAt(0).toUpperCase() + asset.type.slice(1).replace('-', ' ')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getCommentsForAsset(asset.id).length} comments
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Discussion Panel */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {renderDiscussionPanel()}
            </div>
          </div>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Team Members</CardTitle>
              {user?.role === "admin" && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search members..." className="pl-9" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
              
              <div className="space-y-4">
                {displayUsers.map((teamMember) => (
                  <div key={teamMember.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={teamMember.avatarUrl} />
                        <AvatarFallback>{teamMember.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teamMember.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{teamMember.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={teamMember.role === 'admin' ? 'default' : 'outline'} className="capitalize">
                        {teamMember.role}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                          {user?.role === "admin" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">
                                Remove from Team
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Notifications</CardTitle>
                <CardDescription>Stay updated on collaboration activities</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Mark All as Read
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BellRing className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  mockNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border flex items-start ${
                        notification.isRead ? 'bg-white dark:bg-gray-950' : 'bg-blue-50 dark:bg-blue-950/20'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                        notification.isRead ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm">{notification.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{notification.timestamp}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.description}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => markAsRead(notification.id)}
                      >
                        {notification.isRead ? 'Mark Unread' : 'Mark Read'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline">Load More</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
