import {
  users,
  categories,
  subcategories,
  videos,
  subscriptions,
  videoLikes,
  comments,
  playlists,
  playlistVideos,
  watchHistory,
  creatorApplications,
  coursePurchases,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Subcategory,
  type InsertSubcategory,
  type Video,
  type InsertVideo,
  type UpdateVideo,
  type Comment,
  type InsertComment,
  type Playlist,
  type InsertPlaylist,
  type Subscription,
  type InsertSubscription,
  type VideoLike,
  type InsertVideoLike,
  type PlaylistVideo,
  type WatchHistory,
  type CreatorApplication,
  type InsertCreatorApplication,
  type CoursePurchase,
  type InsertCoursePurchase,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserChannel(userId: string, channelData: { channelName?: string; channelDescription?: string }): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Creator application operations
  createCreatorApplication(application: InsertCreatorApplication): Promise<CreatorApplication>;
  getCreatorApplicationByUserId(userId: string): Promise<CreatorApplication | undefined>;
  getCreatorApplications(status?: string): Promise<CreatorApplication[]>;
  updateCreatorApplicationStatus(id: number, status: string, adminNotes?: string): Promise<CreatorApplication>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Subcategory operations
  getSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]>;
  getSubcategoryBySlug(slug: string): Promise<Subcategory | undefined>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  
  // Video operations
  getVideos(): Promise<Video[]>;
  getVideosByCategory(categoryId: number): Promise<Video[]>;
  getVideosBySubcategory(subcategoryId: number): Promise<Video[]>;
  getVideosByCreator(creatorId: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideoWithDetails(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(video: UpdateVideo): Promise<Video>;
  deleteVideo(id: number): Promise<void>;
  incrementVideoViews(id: number): Promise<void>;
  searchVideos(query: string): Promise<Video[]>;
  getTrendingVideos(limit?: number): Promise<Video[]>;
  getRecommendedVideos(userId: string, limit?: number): Promise<Video[]>;
  
  // Subscription operations
  subscribe(subscriberId: string, channelId: string): Promise<Subscription>;
  unsubscribe(subscriberId: string, channelId: string): Promise<void>;
  getSubscriptions(userId: string): Promise<User[]>;
  getSubscribers(channelId: string): Promise<User[]>;
  isSubscribed(subscriberId: string, channelId: string): Promise<boolean>;
  getSubscriptionCount(channelId: string): Promise<number>;
  
  // Video like operations
  likeVideo(userId: string, videoId: number): Promise<VideoLike>;
  unlikeVideo(userId: string, videoId: number): Promise<void>;
  dislikeVideo(userId: string, videoId: number): Promise<VideoLike>;
  undislikeVideo(userId: string, videoId: number): Promise<void>;
  getVideoLikeStatus(userId: string, videoId: number): Promise<VideoLike | undefined>;
  getVideoLikeCounts(videoId: number): Promise<{ likes: number; dislikes: number }>;
  
  // Comment operations
  getComments(videoId: number): Promise<Comment[]>;
  getCommentReplies(parentId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  
  // Playlist operations
  getPlaylists(userId: string): Promise<Playlist[]>;
  getPublicPlaylists(userId: string): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, updates: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;
  addVideoToPlaylist(playlistId: number, videoId: number): Promise<PlaylistVideo>;
  removeVideoFromPlaylist(playlistId: number, videoId: number): Promise<void>;
  getPlaylistVideos(playlistId: number): Promise<Video[]>;
  
  // Watch history operations
  addToWatchHistory(userId: string, videoId: number, watchTime?: number): Promise<WatchHistory>;
  getWatchHistory(userId: string, limit?: number): Promise<Video[]>;
  clearWatchHistory(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Subcategory operations
  async getSubcategories(): Promise<Subcategory[]> {
    return await db.select().from(subcategories);
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    return await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));
  }

  async getSubcategoryBySlug(slug: string): Promise<Subcategory | undefined> {
    const [subcategory] = await db.select().from(subcategories).where(eq(subcategories.slug, slug));
    return subcategory;
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const [newSubcategory] = await db.insert(subcategories).values(subcategory).returning();
    return newSubcategory;
  }

  // Video operations
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.isPublished, true)).orderBy(desc(videos.createdAt));
  }

  async getVideosByCategory(categoryId: number): Promise<Video[]> {
    return await db.select().from(videos).where(
      and(eq(videos.categoryId, categoryId), eq(videos.isPublished, true))
    ).orderBy(desc(videos.createdAt));
  }

  async getVideosBySubcategory(subcategoryId: number): Promise<Video[]> {
    return await db.select().from(videos).where(
      and(eq(videos.subcategoryId, subcategoryId), eq(videos.isPublished, true))
    ).orderBy(desc(videos.createdAt));
  }

  async getVideosByCreator(creatorId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.creatorId, creatorId)).orderBy(desc(videos.createdAt));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(video: UpdateVideo): Promise<Video> {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, video.id))
      .returning();
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async incrementVideoViews(id: number): Promise<void> {
    await db.update(videos).set({ views: sql`views + 1` }).where(eq(videos.id, id));
  }

  async searchVideos(query: string): Promise<Video[]> {
    return await db.select().from(videos).where(
      and(
        eq(videos.isPublished, true),
        like(videos.title, `%${query}%`)
      )
    ).orderBy(desc(videos.createdAt));
  }

  // Additional user operations
  async updateUserChannel(userId: string, channelData: { channelName?: string; channelDescription?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...channelData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Enhanced video operations
  async getVideoWithDetails(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getTrendingVideos(limit: number = 20): Promise<Video[]> {
    return await db.select().from(videos)
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.views), desc(videos.createdAt))
      .limit(limit);
  }

  async getRecommendedVideos(userId: string, limit: number = 20): Promise<Video[]> {
    // Simple recommendation: get videos from subscribed channels
    const userSubscriptions = await db.select({ channelId: subscriptions.channelId })
      .from(subscriptions)
      .where(eq(subscriptions.subscriberId, userId));
    
    if (userSubscriptions.length === 0) {
      return this.getTrendingVideos(limit);
    }

    const channelIds = userSubscriptions.map(sub => sub.channelId);
    return await db.select().from(videos)
      .where(and(
        eq(videos.isPublished, true),
        sql`${videos.creatorId} = ANY(${channelIds})`
      ))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  }

  // Subscription operations
  async subscribe(subscriberId: string, channelId: string): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({ subscriberId, channelId })
      .onConflictDoNothing()
      .returning();
    
    // Update subscriber count
    await db.update(users)
      .set({ subscriberCount: sql`subscriber_count + 1` })
      .where(eq(users.id, channelId));
    
    return subscription;
  }

  async unsubscribe(subscriberId: string, channelId: string): Promise<void> {
    await db.delete(subscriptions)
      .where(and(
        eq(subscriptions.subscriberId, subscriberId),
        eq(subscriptions.channelId, channelId)
      ));
    
    // Update subscriber count
    await db.update(users)
      .set({ subscriberCount: sql`subscriber_count - 1` })
      .where(eq(users.id, channelId));
  }

  async getSubscriptions(userId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.channelId, users.id))
      .where(eq(subscriptions.subscriberId, userId));
    
    return result.map(r => r.user);
  }

  async getSubscribers(channelId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(eq(subscriptions.channelId, channelId));
    
    return result.map(r => r.user);
  }

  async isSubscribed(subscriberId: string, channelId: string): Promise<boolean> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.subscriberId, subscriberId),
        eq(subscriptions.channelId, channelId)
      ));
    
    return !!subscription;
  }

  async getSubscriptionCount(channelId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.channelId, channelId));
    
    return result.count;
  }

  // Video like operations
  async likeVideo(userId: string, videoId: number): Promise<VideoLike> {
    const [like] = await db
      .insert(videoLikes)
      .values({ userId, videoId, isLike: true })
      .onConflictDoUpdate({
        target: [videoLikes.userId, videoLikes.videoId],
        set: { isLike: true }
      })
      .returning();
    
    // Update like counts
    await this.updateVideoLikeCounts(videoId);
    return like;
  }

  async unlikeVideo(userId: string, videoId: number): Promise<void> {
    await db.delete(videoLikes)
      .where(and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, videoId),
        eq(videoLikes.isLike, true)
      ));
    
    await this.updateVideoLikeCounts(videoId);
  }

  async dislikeVideo(userId: string, videoId: number): Promise<VideoLike> {
    const [dislike] = await db
      .insert(videoLikes)
      .values({ userId, videoId, isLike: false })
      .onConflictDoUpdate({
        target: [videoLikes.userId, videoLikes.videoId],
        set: { isLike: false }
      })
      .returning();
    
    await this.updateVideoLikeCounts(videoId);
    return dislike;
  }

  async undislikeVideo(userId: string, videoId: number): Promise<void> {
    await db.delete(videoLikes)
      .where(and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, videoId),
        eq(videoLikes.isLike, false)
      ));
    
    await this.updateVideoLikeCounts(videoId);
  }

  async getVideoLikeStatus(userId: string, videoId: number): Promise<VideoLike | undefined> {
    const [like] = await db
      .select()
      .from(videoLikes)
      .where(and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, videoId)
      ));
    
    return like;
  }

  async getVideoLikeCounts(videoId: number): Promise<{ likes: number; dislikes: number }> {
    const [likesCount] = await db
      .select({ count: count() })
      .from(videoLikes)
      .where(and(eq(videoLikes.videoId, videoId), eq(videoLikes.isLike, true)));
    
    const [dislikesCount] = await db
      .select({ count: count() })
      .from(videoLikes)
      .where(and(eq(videoLikes.videoId, videoId), eq(videoLikes.isLike, false)));
    
    return { likes: likesCount.count, dislikes: dislikesCount.count };
  }

  private async updateVideoLikeCounts(videoId: number): Promise<void> {
    const counts = await this.getVideoLikeCounts(videoId);
    await db.update(videos)
      .set({ likes: counts.likes, dislikes: counts.dislikes })
      .where(eq(videos.id, videoId));
  }

  // Comment operations
  async getComments(videoId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(and(eq(comments.videoId, videoId), sql`${comments.parentId} IS NULL`))
      .orderBy(desc(comments.createdAt));
  }

  async getCommentReplies(parentId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.parentId, parentId))
      .orderBy(comments.createdAt);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async updateComment(id: number, content: string): Promise<Comment> {
    const [updatedComment] = await db
      .update(comments)
      .set({ content, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Playlist operations
  async getPlaylists(userId: string): Promise<Playlist[]> {
    return await db.select().from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.createdAt));
  }

  async getPublicPlaylists(userId: string): Promise<Playlist[]> {
    return await db.select().from(playlists)
      .where(and(eq(playlists.userId, userId), eq(playlists.isPublic, true)))
      .orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async updatePlaylist(id: number, updates: Partial<InsertPlaylist>): Promise<Playlist> {
    const [updatedPlaylist] = await db
      .update(playlists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async addVideoToPlaylist(playlistId: number, videoId: number): Promise<PlaylistVideo> {
    // Get the next position
    const [positionResult] = await db
      .select({ maxPosition: sql<number>`COALESCE(MAX(position), 0)` })
      .from(playlistVideos)
      .where(eq(playlistVideos.playlistId, playlistId));
    
    const nextPosition = (positionResult.maxPosition || 0) + 1;
    
    const [playlistVideo] = await db
      .insert(playlistVideos)
      .values({ playlistId, videoId, position: nextPosition })
      .returning();
    
    return playlistVideo;
  }

  async removeVideoFromPlaylist(playlistId: number, videoId: number): Promise<void> {
    await db.delete(playlistVideos)
      .where(and(
        eq(playlistVideos.playlistId, playlistId),
        eq(playlistVideos.videoId, videoId)
      ));
  }

  async getPlaylistVideos(playlistId: number): Promise<Video[]> {
    const result = await db
      .select({ video: videos })
      .from(playlistVideos)
      .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
      .where(eq(playlistVideos.playlistId, playlistId))
      .orderBy(playlistVideos.position);
    
    return result.map(r => r.video);
  }

  // Watch history operations
  async addToWatchHistory(userId: string, videoId: number, watchTime: number = 0): Promise<WatchHistory> {
    const [watchEntry] = await db
      .insert(watchHistory)
      .values({ userId, videoId, watchTime })
      .returning();
    
    return watchEntry;
  }

  async getWatchHistory(userId: string, limit: number = 50): Promise<Video[]> {
    const result = await db
      .select({ video: videos })
      .from(watchHistory)
      .innerJoin(videos, eq(watchHistory.videoId, videos.id))
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt))
      .limit(limit);
    
    return result.map(r => r.video);
  }

  async clearWatchHistory(userId: string): Promise<void> {
    await db.delete(watchHistory).where(eq(watchHistory.userId, userId));
  }

  // Creator application operations
  async createCreatorApplication(application: InsertCreatorApplication): Promise<CreatorApplication> {
    const [app] = await db
      .insert(creatorApplications)
      .values(application)
      .returning();
    return app;
  }

  async getCreatorApplicationByUserId(userId: string): Promise<CreatorApplication | undefined> {
    const [app] = await db
      .select()
      .from(creatorApplications)
      .where(eq(creatorApplications.userId, userId));
    return app;
  }

  async getCreatorApplications(status?: string): Promise<CreatorApplication[]> {
    if (status) {
      return await db
        .select()
        .from(creatorApplications)
        .where(eq(creatorApplications.status, status))
        .orderBy(desc(creatorApplications.createdAt));
    }
    return await db
      .select()
      .from(creatorApplications)
      .orderBy(desc(creatorApplications.createdAt));
  }

  async updateCreatorApplicationStatus(id: number, status: string, adminNotes?: string): Promise<CreatorApplication> {
    const [app] = await db
      .update(creatorApplications)
      .set({ 
        status, 
        adminNotes,
        updatedAt: new Date() 
      })
      .where(eq(creatorApplications.id, id))
      .returning();
    return app;
  }
}

export const storage = new DatabaseStorage();
