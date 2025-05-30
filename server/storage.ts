import { users, type User, type InsertUser, campaigns, type Campaign, type InsertCampaign, assets, type Asset, type InsertAsset, comments, type Comment, type InsertComment, notifications, type Notification, type InsertNotification, aiDrafts, type AiDraft, type InsertAiDraft } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number | string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number | string, userData: Partial<User>): Promise<User>;
  upsertUser(user: Partial<User>): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  listCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Asset methods
  getAsset(id: number): Promise<Asset | undefined>;
  listAssets(): Promise<Asset[]>;
  listAssetsByCampaign(campaignId: number): Promise<Asset[]>;
  listAssetsByUser(userId: number): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<Asset>): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  
  // Comment methods
  getComment(id: number): Promise<Comment | undefined>;
  listCommentsByAsset(assetId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  listNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // AI Draft methods
  getAiDraft(id: number): Promise<AiDraft | undefined>;
  listAiDrafts(): Promise<AiDraft[]>;
  listAiDraftsByUser(userId: number): Promise<AiDraft[]>;
  createAiDraft(draft: InsertAiDraft): Promise<AiDraft>;
  updateAiDraft(id: number, draft: Partial<AiDraft>): Promise<AiDraft | undefined>;
  deleteAiDraft(id: number): Promise<boolean>;

  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private assets: Map<number, Asset>;
  private comments: Map<number, Comment>;
  private notifications: Map<number, Notification>;
  private aiDrafts: Map<number, AiDraft>;
  
  userCurrentId: number;
  campaignCurrentId: number;
  assetCurrentId: number;
  commentCurrentId: number;
  notificationCurrentId: number;
  aiDraftCurrentId: number;
  
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.assets = new Map();
    this.comments = new Map();
    this.notifications = new Map();
    this.aiDrafts = new Map();
    
    this.userCurrentId = 1;
    this.campaignCurrentId = 1;
    this.assetCurrentId = 1;
    this.commentCurrentId = 1;
    this.notificationCurrentId = 1;
    this.aiDraftCurrentId = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24hrs
    });

    // Initialize with a demo admin user
    this.createUser({
      username: "admin",
      email: "admin@intellaone.com",
      password: "$2b$10$0JNxYeGSL9lY2jlMFVFusuRnHs7gn/AUNo6Ht4I8TbKPONtfA47cy", // "password123"
      fullName: "Admin User",
      role: "admin",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      jobTitle: "Administrator"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async listCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignCurrentId++;
    const campaign: Campaign = { 
      ...insertCampaign, 
      id, 
      createdAt: new Date() 
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updateData: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updateData };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async listAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  async listAssetsByCampaign(campaignId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.campaignId === campaignId,
    );
  }

  async listAssetsByUser(userId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.createdById === userId,
    );
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.assetCurrentId++;
    const now = new Date();
    const asset: Asset = { 
      ...insertAsset, 
      id, 
      createdAt: now,
      updatedAt: now,
      versionHistory: [{ version: 1, content: insertAsset.content, timestamp: now.toISOString() }]
    };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, updateData: Partial<Asset>): Promise<Asset | undefined> {
    const asset = this.assets.get(id);
    if (!asset) return undefined;
    
    const now = new Date();
    let versionHistory = [...(asset.versionHistory as any[] || [])];
    
    // If content is being updated, save the previous version
    if (updateData.content && updateData.content !== asset.content) {
      versionHistory.push({
        version: versionHistory.length + 1,
        content: updateData.content,
        timestamp: now.toISOString()
      });
    }
    
    const updatedAsset = { 
      ...asset, 
      ...updateData, 
      updatedAt: now,
      versionHistory
    };
    
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async listCommentsByAsset(assetId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.assetId === assetId,
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentCurrentId++;
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async listNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId,
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // AI Draft methods
  async getAiDraft(id: number): Promise<AiDraft | undefined> {
    return this.aiDrafts.get(id);
  }

  async listAiDrafts(): Promise<AiDraft[]> {
    return Array.from(this.aiDrafts.values());
  }

  async listAiDraftsByUser(userId: number): Promise<AiDraft[]> {
    return Array.from(this.aiDrafts.values()).filter(
      (draft) => draft.createdById === userId,
    );
  }

  async createAiDraft(insertDraft: InsertAiDraft): Promise<AiDraft> {
    const id = this.aiDraftCurrentId++;
    const draft: AiDraft = { 
      ...insertDraft, 
      id, 
      createdAt: new Date(),
      status: "processing",
      progress: 0,
      variations: []
    };
    this.aiDrafts.set(id, draft);
    return draft;
  }

  async updateAiDraft(id: number, updateData: Partial<AiDraft>): Promise<AiDraft | undefined> {
    const draft = this.aiDrafts.get(id);
    if (!draft) return undefined;
    
    const updatedDraft = { ...draft, ...updateData };
    this.aiDrafts.set(id, updatedDraft);
    return updatedDraft;
  }

  async deleteAiDraft(id: number): Promise<boolean> {
    return this.aiDrafts.delete(id);
  }
}

// Use DatabaseStorage for persistent database storage
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
