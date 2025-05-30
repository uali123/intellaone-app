import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User model - updated to match actual database schema
export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  email: text("email").unique(),
  username: text("username"),
  password: text("password"),
  fullName: text("full_name"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("marketer"), // Admin, Marketer, Collaborator
  jobTitle: text("job_title"),
  googleId: text("google_id"),
  authMethod: text("auth_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Campaign model
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft, active, completed
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

// Asset model
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // email, landing-page, ad-copy, product-brochure
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"), // draft, in-review, published
  campaignId: integer("campaign_id"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  targetAudience: text("target_audience"),
  tone: text("tone"),
  brandStyle: text("brand_style"),
  versionHistory: jsonb("version_history").default([]),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  versionHistory: true,
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  assetId: integer("asset_id").notNull(),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  parentId: integer("parent_id"),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Notification model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // comment, mention, approval
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  relatedAssetId: integer("related_asset_id"),
  relatedCommentId: integer("related_comment_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// AI Draft model
export const aiDrafts = pgTable("ai_drafts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brief: text("brief").notNull(),
  type: text("type").notNull(), // email, landing-page, ad-copy, product-brochure
  status: text("status").notNull().default("processing"), // processing, complete, in-review
  progress: integer("progress").default(0),
  variations: jsonb("variations").default([]),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  targetAudience: text("target_audience"),
  tone: text("tone"),
  brandStyle: text("brand_style"),
});

export const insertAiDraftSchema = createInsertSchema(aiDrafts).omit({
  id: true,
  createdAt: true,
  variations: true,
  progress: true,
  status: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertAiDraft = z.infer<typeof insertAiDraftSchema>;
export type AiDraft = typeof aiDrafts.$inferSelect;

// Extended schemas for forms
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
