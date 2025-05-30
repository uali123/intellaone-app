import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import AppShell from "@/components/layout/app-shell";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Lock,
  Shield,
  PencilLine,
  Upload,
  Info,
  HelpCircle,
  BarChart3,
  Check,
  Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Form validation schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  jobTitle: z.string().optional(),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  avatarUrl: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  commentMentions: z.boolean(),
  assetApprovals: z.boolean(),
  newCollaborators: z.boolean(),
  marketingUpdates: z.boolean(),
});

const apiSettingsSchema = z.object({
  apiKey: z.string().optional(),
  aiModel: z.string().min(1, "Please select an AI model"),
  maxTokensPerRequest: z.string().transform(val => parseInt(val)),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      username: user?.username || "",
      jobTitle: user?.jobTitle || "",
      bio: "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      commentMentions: true,
      assetApprovals: true,
      newCollaborators: true,
      marketingUpdates: false,
    },
  });

  // API settings form
  const apiForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: "sk-•••••••••••••••••••••••••••••••",
      aiModel: "gpt-4o",
      maxTokensPerRequest: "2000",
    },
  });

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would update the user profile
      // await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      // queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password form submission
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would update the user's password
      // await apiRequest("POST", "/api/users/change-password", {
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword,
      // });
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Failed to update password",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle notification settings submission
  const onNotificationSubmit = async (data: NotificationSettingsValues) => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would update notification settings
      // await apiRequest("PATCH", `/api/users/${user?.id}/notifications`, data);
      
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle API settings submission
  const onApiSubmit = async (data: ApiSettingsValues) => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would update API settings
      // await apiRequest("PATCH", `/api/settings/api`, data);
      
      toast({
        title: "API settings updated",
        description: "Your API configuration has been saved",
      });
    } catch (error) {
      toast({
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Generate a new API key
  const generateNewApiKey = () => {
    const newKey = "sk-" + Array(40).fill(0).map(() => Math.random().toString(36).charAt(2)).join('');
    
    apiForm.setValue("apiKey", newKey);
    
    toast({
      title: "New API key generated",
      description: "Make sure to save your changes to apply the new key",
    });
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs 
        defaultValue="profile" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-3">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}`} 
                          alt={user?.fullName} 
                        />
                        <AvatarFallback className="text-2xl">{user?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" type="button">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                        <Button variant="outline" size="sm" type="button" className="text-red-500">
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Tell us a little about yourself" 
                                className="resize-none" 
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile. Max 200 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" onClick={profileForm.handleSubmit(onProfileSubmit)} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account and connected services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Role</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your access level in the system
                  </p>
                </div>
                <div>
                  <Badge>{user?.role || "User"}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Language Preference</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose your preferred language for the interface
                  </p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Connected Accounts</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage third-party services connected to your account
                  </p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Shield className="h-4 w-4 mr-1" />
                Last changed: 3 months ago
              </div>
              <Button 
                type="submit" 
                onClick={passwordForm.handleSubmit(onPasswordSubmit)}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Additional security settings for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium">Login History</h3>
                    <Badge variant="outline" className="ml-2">New</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your recent login activity
                  </p>
                </div>
                <Button variant="outline">View History</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Active Sessions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage devices where you're currently logged in
                  </p>
                </div>
                <Button variant="outline">Manage Sessions</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium text-red-500">Danger Zone</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Delivery Methods</h3>
                    
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications in the browser
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Types</h3>
                    
                    <FormField
                      control={notificationForm.control}
                      name="commentMentions"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Comment Mentions</FormLabel>
                            <FormDescription>
                              When someone mentions you in a comment
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="assetApprovals"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Asset Approvals</FormLabel>
                            <FormDescription>
                              When an asset needs your approval or is approved
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="newCollaborators"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">New Collaborators</FormLabel>
                            <FormDescription>
                              When someone is added to your project
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingUpdates"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Marketing Updates</FormLabel>
                            <FormDescription>
                              Receive news, product updates and promotions
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                onClick={notificationForm.handleSubmit(onNotificationSubmit)}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Manage your API keys and AI service settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">API Credentials</h3>
                    
                    <FormField
                      control={apiForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <Input {...field} className="font-mono" />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="ml-2"
                              onClick={generateNewApiKey}
                            >
                              Generate New
                            </Button>
                          </div>
                          <FormDescription>
                            Your API key for connecting to OpenAI services. Keep this secure.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">AI Configuration</h3>
                    
                    <FormField
                      control={apiForm.control}
                      name="aiModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Model</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The AI model used for content generation. More advanced models provide better results but use more tokens.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="maxTokensPerRequest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens Per Request</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select token limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1000">1,000 tokens</SelectItem>
                              <SelectItem value="2000">2,000 tokens</SelectItem>
                              <SelectItem value="4000">4,000 tokens</SelectItem>
                              <SelectItem value="8000">8,000 tokens</SelectItem>
                              <SelectItem value="16000">16,000 tokens</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Maximum number of tokens to use per API request. Higher limits allow for more detailed content but increase costs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
                    <div className="flex items-start">
                      <Info className="mt-0.5 h-4 w-4 text-yellow-800 dark:text-yellow-500 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-500">API Usage Notice</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          API calls to AI services incur costs. Your current plan includes 750 AI credits per month. Monitor your usage in the billing section.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                onClick={apiForm.handleSubmit(onApiSubmit)}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save API Settings"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Usage & Limits</CardTitle>
              <CardDescription>
                Monitor your API usage and manage quotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">AI Credits Used This Month</h3>
                  <span className="text-sm font-medium">650 / 750</span>
                </div>
                <Progress value={86.6} className="h-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Resets in 7 days
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Usage Breakdown</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Email Templates</h4>
                        <span className="text-sm">250 credits</span>
                      </div>
                      <Progress value={33.3} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Ad Copy</h4>
                        <span className="text-sm">175 credits</span>
                      </div>
                      <Progress value={23.3} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Landing Pages</h4>
                        <span className="text-sm">150 credits</span>
                      </div>
                      <Progress value={20} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Other</h4>
                        <span className="text-sm">75 credits</span>
                      </div>
                      <Progress value={10} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">Pro Plan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      $49/month • Renews on August 15, 2023
                    </p>
                    <ul className="mt-3 space-y-1">
                      <li className="text-sm flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Unlimited assets
                      </li>
                      <li className="text-sm flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        750 AI credits per month
                      </li>
                      <li className="text-sm flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Up to 20 team members
                      </li>
                      <li className="text-sm flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Advanced analytics
                      </li>
                    </ul>
                  </div>
                  
                  <Button>Upgrade Plan</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment Method</h3>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">Visa ending in 4242</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expires 05/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Billing History</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                        <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                        <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3">Jul 15, 2023</td>
                        <td className="py-3">Pro Plan - Monthly</td>
                        <td className="py-3 text-right">$49.00</td>
                        <td className="py-3 text-right">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Paid
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3">Jun 15, 2023</td>
                        <td className="py-3">Pro Plan - Monthly</td>
                        <td className="py-3 text-right">$49.00</td>
                        <td className="py-3 text-right">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Paid
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3">May 15, 2023</td>
                        <td className="py-3">Pro Plan - Monthly</td>
                        <td className="py-3 text-right">$49.00</td>
                        <td className="py-3 text-right">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Paid
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="flex space-x-2">
                <Button variant="outline">Cancel Subscription</Button>
                <Button>Buy More Credits</Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Update your billing and tax information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">Billing Address</h3>
                  <p className="text-sm">Company Name Inc.</p>
                  <p className="text-sm">123 Business Street</p>
                  <p className="text-sm">Suite 100</p>
                  <p className="text-sm">San Francisco, CA 94103</p>
                  <p className="text-sm">United States</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <PencilLine className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium mb-2">Tax Information</h3>
                  <p className="text-sm">Tax ID: US123456789</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <PencilLine className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-start">
        <HelpCircle className="h-5 w-5 text-primary mt-0.5 mr-3" />
        <div>
          <h3 className="font-medium">Need help with your settings?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Our support team is available to assist you with any questions or concerns.
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm">Contact Support</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
