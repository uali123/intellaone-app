import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Asset } from "@shared/schema";

import AppShell from "@/components/layout/app-shell";
import AssetEditor from "@/components/content/asset-editor";
import AssetForm from "@/components/content/asset-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Share2, Trash2, MoreHorizontal } from "lucide-react";
import { mockAssets } from "@/components/dashboard/recent-assets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AssetEditorPage() {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const isNew = params.id === "new";

  // Fetch asset data
  const { data: asset, isLoading, error } = useQuery<Asset>({
    queryKey: [`/api/assets/${params.id}`],
    enabled: !isNew && !!params.id,
  });

  const handleDelete = async () => {
    if (isNew || !params.id) return;
    
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/assets/${params.id}`);
      
      // Invalidate queries and navigate back
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Asset deleted",
        description: "The asset has been permanently deleted."
      });
      setLocation("/assets");
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/assets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">
            {isNew ? "Create New Asset" : isLoading ? "Loading..." : asset?.name || "Asset Editor"}
          </h1>
        </div>
        
        {!isNew && asset && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this asset and remove it from any associated campaigns.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? "Deleting..." : "Delete Asset"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Download</DropdownMenuItem>
                <DropdownMenuItem>Add to Campaign</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Change Owner</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      {isNew ? (
        <AssetForm />
      ) : isLoading ? (
        <div className="text-center py-12">Loading asset data...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Error loading asset: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : asset ? (
        <AssetEditor asset={asset} />
      ) : (
        <div className="text-center py-12">Asset not found. It may have been deleted.</div>
      )}
    </AppShell>
  );
}
