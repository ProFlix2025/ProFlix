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
  role: varchar("role").notNull().default("creator"), // Anyone can upload videos and sell courses
  isSystemAccount: boolean("is_system_account").default(false), // For ProFlix Academy
  
  // Viewer Premium subscription ($29/month) - ad-free + 10% course discount
  isPremiumViewer: boolean("is_premium_viewer").default(false),
  premiumViewerEndsAt: timestamp("premium_viewer_ends_at"),
  
  // Pro Creator subscription - enhanced features with tiers
  isProCreator: boolean("is_pro_creator").default(false),
  proCreatorTier: varchar("pro_creator_tier").default("free"), // 'free', 'standard', 'plus', 'enterprise'
  proCreatorEndsAt: timestamp("pro_creator_ends_at"),
  proCreatorPlan: varchar("pro_creator_plan"), // 'monthly', 'yearly', 'free_code'
  courseLimit: integer("course_limit").default(1), // free=1, standard=20, plus=100, enterprise=unlimited
  currentCourseCount: integer("current_course_count").default(0),
  videoHourLimit: integer("video_hour_limit").default(5), // free=5 hours course content, pro=50, enterprise=500
  currentVideoHours: integer("current_video_hours").default(0),
  
  // Customer retention tracking
  previousProCreatorTier: varchar("previous_pro_creator_tier"), // Track what tier they downgraded from
  downgradedAt: timestamp("downgraded_at"), // When they were downgraded
  downgradedReason: varchar("downgraded_reason"), // 'payment_failed', 'cancelled', 'expired'
  reactivationAttempts: integer("reactivation_attempts").default(0),
  lastReactivationEmail: timestamp("last_reactivation_email"),
  
  // Creator earnings from ads
  totalAdRevenue: integer("total_ad_revenue").default(0), // in cents
  
  // Course selling (Pro Creators only)
  totalCourseRevenue: integer("total_course_revenue").default(0), // in cents
  
  // Creator payment URLs for course sales
  paypalPaymentUrl: varchar("paypal_payment_url"),
  stripePaymentUrl: varchar("stripe_payment_url"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  channelName: varchar("channel_name"),
  channelDescription: text("channel_description"),
  subscriberCount: integer("subscriber_count").default(0),
  totalViews: integer("total_views").default(0),
  totalEarnings: integer("total_earnings").default(0), // In cents
  purchasePin: varchar("purchase_pin", { length: 6 }), // 6-digit PIN for quick purchases
  stripeCustomerId: varchar("stripe_customer_id"), // Stripe customer ID for saved cards
  defaultPaymentMethod: varchar("default_payment_method"), // Default saved card ID
  
  // ID Verification fields (18+ compliance)
  isIdVerified: boolean("is_id_verified").default(false),
  idVerificationStatus: varchar("id_verification_status").default("pending"), // pending, approved, rejected
  idDocumentUrl: varchar("id_document_url"),
  idSelfieUrl: varchar("id_selfie_url"),
  legalName: varchar("legal_name"),
  residentialAddress: text("residential_address"),
  dateOfBirth: varchar("date_of_birth"), // Store as string for privacy
  
  // Teaching Qualifications (Required for course sales)
  socialMediaLinks: text("social_media_links"),
  publishedArticles: text("published_articles"),
  teachingQualifications: text("teaching_qualifications"),
  professionalExperience: text("professional_experience"),
  
  // Legal Agreement (Creator Terms)
  hasSignedCreatorAgreement: boolean("has_signed_creator_agreement").default(false),
  creatorAgreementSignedAt: timestamp("creator_agreement_signed_at"),
  creatorAgreementIpAddress: varchar("creator_agreement_ip_address"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pro Creator invitation codes table
export const proCreatorCodes = pgTable("pro_creator_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  isUsed: boolean("is_used").default(false),
  usedByUserId: varchar("used_by_user_id"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  emoji: varchar("emoji", { length: 2 }), // Store emoji character
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



// Videos table - 3-Tier Model (Streaming, Basic, Premium)
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
  
  // YouTube-style free videos + course upsells (removed videoType column)
  
  // Content source system - for proper ad revenue management
  source: varchar("source").notNull().default("proflix"), // 'proflix', 'protube', or 'learntube'
  youtubeId: varchar("youtube_id"), // YouTube video ID for LearnTube content
  isLearnTube: boolean("is_learn_tube").default(false), // Easy identification for bulk deletion
  isProTube: boolean("is_pro_tube").default(false), // ProFlix original content (can run ads)
  canRunAds: boolean("can_run_ads").default(true), // false for LearnTube, true for ProTube/ProFlix
  
  // Course sales (anyone can sell courses)
  isCourse: boolean("is_course").default(false),
  coursePrice: integer("course_price").default(0), // in cents
  courseDescription: text("course_description"),
  isFreeContent: boolean("is_free_content").default(false), // ProFlix Academy can offer free courses
  
  // Creator-controlled premium discount
  offersPremiumDiscount: boolean("offers_premium_discount").default(false),
  
  // YouTube-style metrics
  shareCount: integer("share_count").default(0),
  
  // Ad revenue tracking
  adRevenue: integer("ad_revenue").default(0), // in cents
  adImpressions: integer("ad_impressions").default(0),
  
  // Streaming requirements
  isDonatedToStreaming: boolean("is_donated_to_streaming").default(false), // Required donation
  streamingWatchTime: integer("streaming_watch_time").default(0), // Hours watched for royalties
  
  views: integer("views").default(0),
  purchases: integer("purchases").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  offerFreePreview: boolean("offer_free_preview").default(false),
  tags: text("tags").array(), // Array of tags
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course Purchases table - YouTube-style with course upsells
export const coursePurchases = pgTable("course_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  priceAtPurchase: integer("price_at_purchase").notNull(), // Price in cents when purchased
  
  // Pro Creators keep 100% of course sales
  creatorEarnings: integer("creator_earnings").notNull(), // 100% of course sales
  
  // Creator-controlled premium discount
  discountApplied: integer("discount_applied").default(0), // Applied discount amount in cents
  
  stripePaymentId: varchar("stripe_payment_id"),
  paypalPaymentId: varchar("paypal_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ad revenue tracking for creators
export const adRevenue = pgTable("ad_revenue", {
  id: serial("id").primaryKey(),
  creatorId: varchar("creator_id").notNull(),
  videoId: integer("video_id").notNull(),
  date: timestamp("date").defaultNow(),
  impressions: integer("impressions").default(0),
  earnings: integer("earnings").default(0), // in cents
  cpm: integer("cpm").default(0), // cost per mille in cents
  createdAt: timestamp("created_at").defaultNow(),
});

// Ads inventory table
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  targetUrl: varchar("target_url").notNull(),
  isActive: boolean("is_active").default(true),
  cpmRate: integer("cpm_rate").default(500), // $5 CPM in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Premium viewer subscriptions table - $29/month for ad-free + discounts
export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: varchar("status").default("active"), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pro Creator subscriptions table - $99/month for course selling
export const proCreatorSubscriptions = pgTable("pro_creator_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: varchar("status").default("active"), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
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

// Favorites table (for free videos)
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_favorites_user_id").on(table.userId),
  index("idx_favorites_video_id").on(table.videoId),
]);

// Wishlist table (for courses to buy)
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_wishlist_user_id").on(table.userId),
  index("idx_wishlist_video_id").on(table.videoId),
]);

// Shared videos table
export const sharedVideos = pgTable("shared_videos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  shareToken: varchar("share_token").notNull().unique(),
  recipientEmail: varchar("recipient_email"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_shared_videos_user_id").on(table.userId),
  index("idx_shared_videos_share_token").on(table.shareToken),
]);

// Video reports table for content moderation
export const videoReports = pgTable("video_reports", {
  id: serial("id").primaryKey(),
  videoId: varchar("video_id").notNull(),
  videoTitle: varchar("video_title"),
  videoUrl: varchar("video_url"),
  reportType: varchar("report_type").notNull(), // copyright, hate-speech, inappropriate, spam, fraud, other
  description: text("description").notNull(),
  reporterName: varchar("reporter_name"),
  reporterEmail: varchar("reporter_email"),
  reporterIp: varchar("reporter_ip").notNull(),
  reporterUserAgent: varchar("reporter_user_agent"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rate limiting table for security
export const rateLimits = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  identifier: varchar("identifier").notNull(), // IP address or user ID
  action: varchar("action").notNull(), // login, signup, video_upload, etc.
  attempts: integer("attempts").default(1),
  windowStart: timestamp("window_start").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security logs table for tracking actions
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  action: varchar("action").notNull(), // login, logout, purchase, video_upload, etc.
  ipAddress: varchar("ip_address").notNull(),
  userAgent: varchar("user_agent"),
  details: text("details"), // JSON string with additional details
  success: boolean("success").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin security logs table for admin authentication tracking
export const adminSecurityLogs = pgTable("admin_security_logs", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
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
  favorites: many(favorites),
  wishlist: many(wishlist),
}));

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  subscriptions: many(subscriptions, { relationName: "UserSubscriptions" }),
  subscribers: many(subscriptions, { relationName: "ChannelSubscribers" }),
  videoLikes: many(videoLikes),
  comments: many(comments),
  playlists: many(playlists),
  watchHistory: many(watchHistory),

  coursePurchases: many(coursePurchases),
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

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [favorites.videoId],
    references: [videos.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [wishlist.videoId],
    references: [videos.id],
  }),
}));

export const sharedVideosRelations = relations(sharedVideos, ({ one }) => ({
  user: one(users, {
    fields: [sharedVideos.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [sharedVideos.videoId],
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
  subcategoryId: z.number().min(1, "Subcategory is required"),
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



export const insertCoursePurchaseSchema = createInsertSchema(coursePurchases).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertSharedVideoSchema = createInsertSchema(sharedVideos).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Video report types
export type VideoReport = typeof videoReports.$inferSelect;
export type InsertVideoReport = typeof videoReports.$inferInsert;
export const insertVideoReportSchema = createInsertSchema(videoReports);

// Rate limiting types
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;

// Security log types
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof securityLogs.$inferInsert;
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

export type CoursePurchase = typeof coursePurchases.$inferSelect;
export type InsertCoursePurchase = z.infer<typeof insertCoursePurchaseSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type SharedVideo = typeof sharedVideos.$inferSelect;
export type InsertSharedVideo = z.infer<typeof insertSharedVideoSchema>;
export type AdRevenue = typeof adRevenue.$inferSelect;
export type InsertAdRevenue = typeof adRevenue.$inferInsert;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;
export type InsertPremiumSubscription = typeof premiumSubscriptions.$inferInsert;
export type ProCreatorSubscription = typeof proCreatorSubscriptions.$inferSelect;
export type InsertProCreatorSubscription = typeof proCreatorSubscriptions.$inferInsert;
export type ProCreatorCode = typeof proCreatorCodes.$inferSelect;
export type InsertProCreatorCode = typeof proCreatorCodes.$inferInsert;
