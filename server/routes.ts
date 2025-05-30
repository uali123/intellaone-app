import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAiRoutes } from "./ai";
import { setupModelCustomizationRoutes } from "./fine-tuning";
import { setupSupabaseAuth, requireAuth, verifyToken } from "./supabaseAuth";
import { insertCampaignSchema, insertAssetSchema, insertCommentSchema, insertNotificationSchema, insertAiDraftSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize AI routes
  setupAiRoutes(app);
  
  // Initialize Model Customization routes
  setupModelCustomizationRoutes(app);
  
  // Initialize Supabase Authentication
  try {
    // Set up Supabase authentication routes
    setupSupabaseAuth(app);
    console.log("Supabase authentication initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Supabase authentication:", error);
    console.warn("Authentication will be in development mode");
    
    // Set up a simple user endpoint for development
    app.get('/api/user', (req, res) => {
      res.json({
        id: "1",
        email: "admin@intellaone.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        jobTitle: "Administrator",
        profileImageUrl: null
      });
    });
  }

  // Use the requireAuth middleware from supabaseAuth.ts
  const isAuthenticated = requireAuth;

  // Middleware to check if user has admin role
  const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // First verify the token
    await verifyToken(req, res, async () => {
      try {
        // @ts-ignore - we know user exists after verifyToken
        const user = await storage.getUser(req.user?.id);
        
        if (user && user.role === "admin") {
          return next();
        } else {
          return res.status(403).json({ message: "Forbidden: Admin access required" });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        return res.status(500).json({ message: "Error checking admin status" });
      }
    });
  };

  // ------ Campaign Routes ------
  
  // Get all campaigns
  app.get("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Get campaign by ID
  app.get("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Create new campaign
  app.post("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      // Get user from database using Auth0 email
      const userEmail = req.oidc.user?.email;
      const user = await storage.getUserByEmail(userEmail || '');
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const validatedData = insertCampaignSchema.parse({
        ...req.body,
        createdById: user.id
      });
      
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.patch("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Only creator or admin can update
      if (campaign.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this campaign" });
      }
      
      const updatedCampaign = await storage.updateCampaign(id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Only creator or admin can delete
      if (campaign.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this campaign" });
      }
      
      await storage.deleteCampaign(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // ------ Asset Routes ------
  
  // Get all assets
  app.get("/api/assets", isAuthenticated, async (req, res) => {
    try {
      const assets = await storage.listAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  // Get assets by campaign ID
  app.get("/api/campaigns/:id/assets", isAuthenticated, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const assets = await storage.listAssetsByCampaign(campaignId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign assets" });
    }
  });

  // Get asset by ID
  app.get("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  // Create new asset
  app.post("/api/assets", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse({
        ...req.body,
        createdById: req.user.id
      });
      
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  // Update asset
  app.patch("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Only creator or admin can update
      if (asset.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this asset" });
      }
      
      const updatedAsset = await storage.updateAsset(id, req.body);
      res.json(updatedAsset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  // Delete asset
  app.delete("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Only creator or admin can delete
      if (asset.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this asset" });
      }
      
      await storage.deleteAsset(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // ------ Comment Routes ------
  
  // Get comments for an asset
  app.get("/api/assets/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const comments = await storage.listCommentsByAsset(assetId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Add comment to asset
  app.post("/api/assets/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const asset = await storage.getAsset(assetId);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        assetId,
        createdById: req.user.id
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Create notification for asset creator if different from comment creator
      if (asset.createdById !== req.user.id) {
        await storage.createNotification({
          userId: asset.createdById,
          type: "comment",
          message: `${req.user.fullName} commented on your asset: ${asset.name}`,
          read: false,
          relatedAssetId: assetId,
          relatedCommentId: comment.id
        });
      }
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Only creator or admin can delete
      if (comment.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      await storage.deleteComment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ------ Notification Routes ------
  
  // Get user notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.listNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.getNotification(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only the recipient can mark as read
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this notification" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // ------ AI Draft Routes ------
  
  // Get all AI drafts
  app.get("/api/ai-drafts", isAuthenticated, async (req, res) => {
    try {
      const drafts = await storage.listAiDraftsByUser(req.user.id);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI drafts" });
    }
  });

  // Get AI draft by ID
  app.get("/api/ai-drafts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const draft = await storage.getAiDraft(id);
      
      if (!draft) {
        return res.status(404).json({ message: "AI draft not found" });
      }
      
      // Only creator or admin can view
      if (draft.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this AI draft" });
      }
      
      res.json(draft);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI draft" });
    }
  });

  // Create new AI draft
  app.post("/api/ai-drafts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAiDraftSchema.parse({
        ...req.body,
        createdById: req.user.id
      });
      
      const draft = await storage.createAiDraft(validatedData);
      
      // Simulate AI generation process asynchronously
      setTimeout(async () => {
        try {
          // Update to 50% progress
          await storage.updateAiDraft(draft.id, { 
            progress: 50,
            status: "processing"
          });
          
          // Complete after another delay
          setTimeout(async () => {
            try {
              // Generate variations based on the type
              const variations = [];
              const types = {
                "email": ["Subject", "Body", "Call-to-action"],
                "landing-page": ["Headline", "Description", "Features", "Testimonials"],
                "ad-copy": ["Headline", "Primary text", "Description", "CTA"],
                "product-brochure": ["Cover", "Product description", "Benefits", "Specifications"]
              };
              
              const elements = types[draft.type] || ["Content"];
              
              // Generate 3-5 variations
              const variationCount = Math.floor(Math.random() * 3) + 3;
              
              for (let i = 1; i <= variationCount; i++) {
                const variation = {
                  id: i,
                  name: `Variation ${i}`,
                  elements: {}
                };
                
                elements.forEach(element => {
                  variation.elements[element] = `AI-generated ${draft.type} content for ${element} (Variation ${i}). Targeting ${draft.targetAudience} with a ${draft.tone} tone that matches the ${draft.brandStyle} brand style.`;
                });
                
                variations.push(variation);
              }
              
              // Update with completed status and variations
              await storage.updateAiDraft(draft.id, { 
                progress: 100,
                status: "complete",
                variations
              });
            } catch (err) {
              console.error("Error completing AI draft:", err);
            }
          }, 10000); // 10 seconds to complete
          
        } catch (err) {
          console.error("Error updating AI draft progress:", err);
        }
      }, 5000); // 5 seconds to reach 50%
      
      res.status(201).json(draft);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid AI draft data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create AI draft" });
    }
  });

  // ------ User Routes ------
  
  // Get all users (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Regular users can only view their own profile
      if (id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this user" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
