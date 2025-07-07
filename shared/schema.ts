import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("viewer"), // 'creator', 'viewer', 'admin'
  creatorStatus: varchar("creator_status").default("none"), // 'none', 'pending', 'approved', 'rejected'
  subscriptionTier: varchar("subscription_tier").default("free"), // 'free', 'basic', 'premium'
  monthlyHoursUsed: integer("monthly_hours_used").default(0),
  monthlyHoursLimit: integer("monthly_hours_limit").default(8), // 8 for free, 20 for basic, 100 for premium
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  channelName: varchar("channel_name"),
  channelDescription: text("channel_description"),
  subscriberCount: integer("subscriber_count").default(0),
  totalViews: integer("total_views").default(0),
  totalEarnings: integer("total_earnings").default(0), // In cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subcategories table
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creator Applications table
export const creatorApplications = pgTable("creator_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  fullName: varchar("full_name").notNull(),
  stageName: varchar("stage_name"),
  email: varchar("email").notNull(),
  phoneNumber: varchar("phone_number"),
  city: varchar("city"),
  country: varchar("country"),
  socialLinks: text("social_links"), // JSON string of social media links
  courseTitle: varchar("course_title").notNull(),
  professionalBackground: text("professional_background").notNull(),
  hasSoldCourses: boolean("has_sold_courses").default(false),
  previousSales: varchar("previous_sales"),
  priceRange: varchar("price_range").notNull(), // 'under_100', '100_250', '250_500', '500_1000'
  contentReadiness: varchar("content_readiness").notNull(), // 'ready', 'partial', 'not_ready'
  whyTopCreator: text("why_top_creator").notNull(),
  hasAudience: boolean("has_audience").default(false),
  audienceDetails: text("audience_details"),
  freePreview: varchar("free_preview").notNull(), // 'yes', 'maybe', 'no'
  supportNeeds: text("support_needs"),
  agreedToTerms: boolean("agreed_to_terms").default(false),
  agreedToRevenue: boolean("agreed_to_revenue").default(false),
  agreedToContent: boolean("agreed_to_content").default(false),
  signatureName: varchar("signature_name").notNull(),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected'
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Videos table (now for courses)
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: varchar("duration"), // stored as string like "15:30"
  durationMinutes: integer("duration_minutes").default(0), // Duration in minutes for hour tracking
  categoryId: integer("category_id").notNull(),
  subcategoryId: integer("subcategory_id").notNull(),
  creatorId: varchar("creator_id").notNull(),
  price: integer("price").notNull(), // Price in cents, max $1000 = 100000 cents
  views: integer("views").default(0),
  purchases: integer("purchases").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  tags: text("tags").array(), // Array of tags
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Purchases table
export const coursePurchases = pgTable("course_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  priceAtPurchase: integer("price_at_purchase").notNull(), // Price in cents when purchased
  creatorEarnings: integer("creator_earnings").notNull(), // 80% of price in cents
  platformEarnings: integer("platform_earnings").notNull(), // 20% of price in cents
  stripePaymentId: varchar("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscriptions table (for creator follows)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriberId: varchar("subscriber_id").notNull(),
  channelId: varchar("channel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video likes/dislikes table
export const videoLikes = pgTable("video_likes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(),
  userId: varchar("user_id").notNull(),
  isLike: boolean("is_like").notNull(), // true for like, false for dislike
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For replies
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Playlists table
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Playlist videos table
export const playlistVideos = pgTable("playlist_videos", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  videoId: integer("video_id").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Watch history table
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  watchedAt: timestamp("watched_at").defaultNow(),
  watchTime: integer("watch_time").default(0), // seconds watched
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  videos: many(videos),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [videos.subcategoryId],
    references: [subcategories.id],
  }),
  creator: one(users, {
    fields: [videos.creatorId],
    references: [users.id],
  }),
  likes: many(videoLikes),
  comments: many(comments),
}));

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  subscriptions: many(subscriptions, { relationName: "UserSubscriptions" }),
  subscribers: many(subscriptions, { relationName: "ChannelSubscribers" }),
  videoLikes: many(videoLikes),
  comments: many(comments),
  playlists: many(playlists),
  watchHistory: many(watchHistory),
  creatorApplications: many(creatorApplications),
  coursePurchases: many(coursePurchases),
}));

export const creatorApplicationsRelations = relations(creatorApplications, ({ one }) => ({
  user: one(users, {
    fields: [creatorApplications.userId],
    references: [users.id],
  }),
}));

export const coursePurchasesRelations = relations(coursePurchases, ({ one }) => ({
  user: one(users, {
    fields: [coursePurchases.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [coursePurchases.videoId],
    references: [videos.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [subscriptions.subscriberId],
    references: [users.id],
    relationName: "UserSubscriptions",
  }),
  channel: one(users, {
    fields: [subscriptions.channelId],
    references: [users.id],
    relationName: "ChannelSubscribers",
  }),
}));

export const videoLikesRelations = relations(videoLikes, ({ one }) => ({
  video: one(videos, {
    fields: [videoLikes.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoLikes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "CommentReplies",
  }),
  replies: many(comments, { relationName: "CommentReplies" }),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  videos: many(playlistVideos),
}));

export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [watchHistory.videoId],
    references: [videos.id],
  }),
}));

// Zod schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  views: true,
  likes: true,
  dislikes: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.array(z.string()).optional(),
  price: z.number().min(1000, "Course price must be at least $10").max(100000, "Course price cannot exceed $1,000"), // Price in cents
});

export const updateVideoSchema = insertVideoSchema.partial().extend({
  id: z.number(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertVideoLikeSchema = createInsertSchema(videoLikes).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorApplicationSchema = createInsertSchema(creatorApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
}).extend({
  priceRange: z.enum(["under_100", "100_250", "250_500", "500_1000"]),
  contentReadiness: z.enum(["ready", "partial", "not_ready"]),
  freePreview: z.enum(["yes", "maybe", "no"]),
  socialLinks: z.string().optional(),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  stageName: z.string().optional(),
  previousSales: z.string().optional(),
  audienceDetails: z.string().optional(),
  supportNeeds: z.string().optional(),
});

export const insertCoursePurchaseSchema = createInsertSchema(coursePurchases).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type UpdateVideo = z.infer<typeof updateVideoSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type VideoLike = typeof videoLikes.$inferSelect;
export type InsertVideoLike = z.infer<typeof insertVideoLikeSchema>;
export type PlaylistVideo = typeof playlistVideos.$inferSelect;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type CreatorApplication = typeof creatorApplications.$inferSelect;
export type InsertCreatorApplication = z.infer<typeof insertCreatorApplicationSchema>;
export type CoursePurchase = typeof coursePurchases.$inferSelect;
export type InsertCoursePurchase = z.infer<typeof insertCoursePurchaseSchema>;
