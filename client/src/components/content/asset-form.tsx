import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAssetSchema, InsertAsset } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Extend the insert schema with additional validation
const assetFormSchema = insertAssetSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters" }).optional(),
  type: z.enum(["email", "landing-page", "ad-copy", "product-brochure"], {
    required_error: "Please select a content type",
  }),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  brandStyle: z.string().optional(),
  campaignId: z.number().optional().nullable(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  defaultValues?: Partial<AssetFormValues>;
  editMode?: boolean;
  assetId?: number;
}

export default function AssetForm({ defaultValues, editMode = false, assetId }: AssetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fetch campaigns to populate dropdown
  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "email",
      content: "",
      status: "draft",
      targetAudience: "",
      tone: "",
      brandStyle: "",
      campaignId: null,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: AssetFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const finalData: InsertAsset = {
        ...data,
        createdById: user.id,
      };
      
      let response;
      if (editMode && assetId) {
        response = await apiRequest("PATCH", `/api/assets/${assetId}`, finalData);
        queryClient.invalidateQueries({ queryKey: [`/api/assets/${assetId}`] });
        toast({
          title: "Asset updated",
          description: "Your asset has been updated successfully.",
        });
      } else {
        response = await apiRequest("POST", "/api/assets", finalData);
        queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
        toast({
          title: "Asset created",
          description: "Your new asset has been created successfully.",
        });
        
        // Redirect to the asset editor page
        const asset = await response.json();
        setLocation(`/assets/${asset.id}`);
      }
    } catch (error) {
      toast({
        title: "Failed to save asset",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? "Edit Asset" : "Create New Asset"}</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe the purpose of this asset" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="landing-page">Landing Page</SelectItem>
                          <SelectItem value="ad-copy">Ad Copy</SelectItem>
                          <SelectItem value="product-brochure">Product Brochure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-review">In Review</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {campaigns.map((campaign: any) => (
                          <SelectItem key={campaign.id} value={campaign.id.toString()}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Associate this asset with a campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Content Attributes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Content Attributes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Young professionals" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Professional, Casual" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brandStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Style</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Modern, Minimalist" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Content</h3>
                <Button type="button" variant="outline" size="sm">
                  Generate with AI
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your content here or use AI to generate it" 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Write or paste your content here. Format using Markdown if needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={() => setLocation('/assets')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editMode ? 'Update Asset' : 'Create Asset'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
