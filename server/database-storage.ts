import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";
import {
  users, User, InsertUser,
  campaigns, Campaign, InsertCampaign,
  assets, Asset, InsertAsset,
  comments, Comment, InsertComment,
  notifications, Notification, InsertNotification,
  aiDrafts, AiDraft, InsertAiDraft
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any type for the session store

  constructor() {
    // Initialize PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number | string): Promise<User | undefined> {
    try {
      // Convert string ID to number if it's a string
      const userId = typeof id === 'string' ? parseInt(id, 10) : id;
      const result = await db.select().from(users).where(eq(users.id, userId));
      return result[0];
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    // Since we don't have a username field in the users table,
    // we'll use email as the username for compatibility with the authentication forms
    const result = await db.select().from(users).where(eq(users.email, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // For new users, we don't provide the ID as it's auto-generated
      const userData = {
        email: insertUser.email,
        username: insertUser.username,
        password: insertUser.password,
        fullName: insertUser.fullName,
        firstName: insertUser.firstName,
        lastName: insertUser.lastName,
        profileImageUrl: insertUser.profileImageUrl,
        avatarUrl: insertUser.avatarUrl,
        role: insertUser.role || "marketer",
        jobTitle: insertUser.jobTitle,
        googleId: insertUser.googleId,
        authMethod: insertUser.authMethod,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db
        .insert(users)
        .values(userData)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  async updateUser(id: number | string, userData: Partial<User>): Promise<User> {
    try {
      // Convert string ID to number if it's a string
      const userId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const result = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }
  
  async upsertUser(userData: Partial<User>): Promise<User> {
    try {
      // For insert operations, we don't need to provide ID as it's auto-generated
      // Extract only the fields that match our schema
      const userDataToUpsert = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl, 
        avatarUrl: userData.avatarUrl,
        role: userData.role || "marketer",
        jobTitle: userData.jobTitle,
        googleId: userData.googleId,
        authMethod: userData.authMethod
      };
      
      // If we have an ID, try to update first
      if (userData.id) {
        try {
          const userId = typeof userData.id === 'string' ? parseInt(userData.id, 10) : userData.id;
          const existingUser = await this.getUser(userId);
          
          if (existingUser) {
            // Update existing user
            return this.updateUser(userId, userDataToUpsert);
          }
        } catch (error) {
          console.error("Error checking for existing user:", error);
          // Continue to insert if there was an error finding the user
        }
      }
      
      // Create new user
      const result = await db
        .insert(users)
        .values({
          ...userDataToUpsert,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
        
      return result[0];
    } catch (error) {
      console.error("Error in upsertUser:", error);
      throw error;
    }
  }
  
  async listUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result[0];
  }
  
  async listCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns);
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const now = new Date();
    const result = await db.insert(campaigns).values({
      ...insertCampaign,
      createdAt: now
    }).returning();
    return result[0];
  }
  
  async updateCampaign(id: number, updateData: Partial<Campaign>): Promise<Campaign | undefined> {
    const result = await db.update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    return result.length > 0;
  }
  
  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    const result = await db.select().from(assets).where(eq(assets.id, id));
    return result[0];
  }
  
  async listAssets(): Promise<Asset[]> {
    return db.select().from(assets);
  }
  
  async listAssetsByCampaign(campaignId: number): Promise<Asset[]> {
    return db.select().from(assets).where(eq(assets.campaignId, campaignId));
  }
  
  async listAssetsByUser(userId: number): Promise<Asset[]> {
    return db.select().from(assets).where(eq(assets.createdById, userId));
  }
  
  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const now = new Date();
    const versionHistory = [{ 
      version: 1, 
      content: insertAsset.content, 
      timestamp: now.toISOString() 
    }];
    
    const result = await db.insert(assets).values({
      ...insertAsset,
      createdAt: now,
      updatedAt: now,
      versionHistory
    }).returning();
    
    return result[0];
  }
  
  async updateAsset(id: number, updateData: Partial<Asset>): Promise<Asset | undefined> {
    // First get the current asset
    const currentAssetResult = await db.select().from(assets).where(eq(assets.id, id));
    const currentAsset = currentAssetResult[0];
    
    if (!currentAsset) return undefined;
    
    const now = new Date();
    let versionHistory = Array.isArray(currentAsset.versionHistory) 
      ? [...currentAsset.versionHistory] 
      : [];
    
    // If content is being updated, save the previous version
    if (updateData.content && updateData.content !== currentAsset.content) {
      versionHistory.push({
        version: versionHistory.length + 1,
        content: updateData.content,
        timestamp: now.toISOString()
      });
    }
    
    const result = await db.update(assets)
      .set({
        ...updateData,
        updatedAt: now,
        versionHistory
      })
      .where(eq(assets.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteAsset(id: number): Promise<boolean> {
    const result = await db.delete(assets).where(eq(assets.id, id)).returning();
    return result.length > 0;
  }
  
  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    const result = await db.select().from(comments).where(eq(comments.id, id));
    return result[0];
  }
  
  async listCommentsByAsset(assetId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.assetId, assetId));
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values({
      ...insertComment,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }
  
  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }
  
  async listNotificationsByUser(userId: number): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      ...insertNotification,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }
  
  // AI Draft methods
  async getAiDraft(id: number): Promise<AiDraft | undefined> {
    const result = await db.select().from(aiDrafts).where(eq(aiDrafts.id, id));
    return result[0];
  }
  
  async listAiDrafts(): Promise<AiDraft[]> {
    return db.select().from(aiDrafts);
  }
  
  async listAiDraftsByUser(userId: number): Promise<AiDraft[]> {
    return db.select().from(aiDrafts).where(eq(aiDrafts.createdById, userId));
  }
  
  async createAiDraft(insertDraft: InsertAiDraft): Promise<AiDraft> {
    const result = await db.insert(aiDrafts).values({
      ...insertDraft,
      createdAt: new Date(),
      status: "processing",
      progress: 0,
      variations: []
    }).returning();
    
    return result[0];
  }
  
  async updateAiDraft(id: number, updateData: Partial<AiDraft>): Promise<AiDraft | undefined> {
    const result = await db.update(aiDrafts)
      .set(updateData)
      .where(eq(aiDrafts.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteAiDraft(id: number): Promise<boolean> {
    const result = await db.delete(aiDrafts).where(eq(aiDrafts.id, id)).returning();
    return result.length > 0;
  }
}