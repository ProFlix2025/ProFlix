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
  role: varchar("role").notNull().default("viewer"), // 'creator' or 'viewer'
  channelName: varchar("channel_name"),
  channelDescription: text("channel_description"),
  subscriberCount: integer("subscriber_count").default(0),
  totalViews: integer("total_views").default(0),
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

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: varchar("duration"), // stored as string like "15:30"
  categoryId: integer("category_id").notNull(),
  subcategoryId: integer("subcategory_id").notNull(),
  creatorId: varchar("creator_id").notNull(),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isPublished: boolean("is_published").default(false),
  privacy: varchar("privacy").notNull().default("public"), // 'public', 'unlisted', 'private'
  tags: text("tags").array(), // Array of tags
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table
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
