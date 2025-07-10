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
  favorites,
  sharedVideos,
  adRevenue,
  proCreatorCodes,
  videoReports,
  rateLimits,
  securityLogs,
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
  type Favorite,
  type InsertFavorite,
  type SharedVideo,
  type InsertSharedVideo,
  type AdRevenue,
  type InsertAdRevenue,
  type ProCreatorCode,
  type InsertProCreatorCode,
  type VideoReport,
  type InsertVideoReport,
  type RateLimit,
  type InsertRateLimit,
  type SecurityLog,
  type InsertSecurityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User>;
  updateUserChannel(userId: string, channelData: { channelName?: string; channelDescription?: string }): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Creator application operations
  createCreatorApplication(application: InsertCreatorApplication): Promise<CreatorApplication>;
  getCreatorApplicationByUserId(userId: string): Promise<CreatorApplication | undefined>;
  getCreatorApplications(status?: string): Promise<CreatorApplication[]>;
  updateCreatorApplicationStatus(id: number, status: string, adminNotes?: string): Promise<CreatorApplication>;
  
  // Course purchase operations
  createCoursePurchase(purchase: InsertCoursePurchase): Promise<CoursePurchase>;
  getUserPurchases(userId: string): Promise<CoursePurchase[]>;
  hasUserPurchasedCourse(userId: string, videoId: number): Promise<boolean>;
  getCreatorEarnings(creatorId: string): Promise<number>;
  
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
  getViralFeed(): Promise<Video[]>;
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
  
  // YouTube-style functionality
  incrementVideoShares(videoId: number): Promise<void>;
  trackAdImpression(creatorId: string, videoId: number, cpmRate: number): Promise<void>;
  createCourseCheckout(userId: string, videoId: number, price: number): Promise<{ url: string }>;
  
  // 3-Tier specific operations
  getCreatorStats(creatorId: string): Promise<{
    totalVideos: number;
    totalViews: number;
    totalEarnings: number;
    uploadHoursUsed: number;
    uploadHoursLimit: number;
    accountType: string;
    streamingVideos: number;
    basicVideos: number;
    premiumVideos: number;
    streamingEarnings: number;
    basicEarnings: number;
  }>;
  upgradeCreatorAccount(userId: string, accountType: string): Promise<User>;
  updateCreatorPaymentUrls(userId: string, paypalUrl?: string, stripeUrl?: string): Promise<User>;
  
  // Pro Creator code operations
  generateProCreatorCode(expiresAt?: Date): Promise<ProCreatorCode>;
  useProCreatorCode(code: string, userId: string): Promise<boolean>;
  getProCreatorCode(code: string): Promise<ProCreatorCode | undefined>;
  getAllProCreatorCodes(): Promise<ProCreatorCode[]>;
  upgradeToProCreator(userId: string, plan: string, endsAt: Date): Promise<User>;
  
  // Favorites operations
  addToFavorites(userId: string, videoId: number): Promise<Favorite>;
  removeFromFavorites(userId: string, videoId: number): Promise<void>;
  getFavorites(userId: string): Promise<Video[]>;
  isFavorited(userId: string, videoId: number): Promise<boolean>;
  
  // Shared videos operations
  shareVideo(userId: string, videoId: number, recipientEmail?: string, message?: string): Promise<SharedVideo>;
  getSharedVideos(userId: string): Promise<SharedVideo[]>;
  getSharedVideoByToken(shareToken: string): Promise<SharedVideo | undefined>;
  
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
  
  // Security and reporting operations
  createVideoReport(reportData: InsertVideoReport): Promise<VideoReport>;
  getAllVideoReports(): Promise<VideoReport[]>;
  updateVideoReportStatus(reportId: string, status: string, reviewedBy: string): Promise<void>;
  logSecurityEvent(eventData: InsertSecurityLog): Promise<void>;
  checkRateLimit(identifier: string, action: string, maxAttempts: number, windowMinutes: number): Promise<boolean>;
  
  // Creator verification operations
  submitCreatorVerification(userId: string, data: any): Promise<User>;
  getPendingVerifications(): Promise<User[]>;
  updateIdVerificationStatus(userId: string, status: string): Promise<User>;
  
  // ProFlix Academy operations
  createProFlixAcademy(): Promise<User>;
  getAcademyVideos(): Promise<Video[]>;
  getAcademyStats(): Promise<any>;
  createAcademyVideo(data: any): Promise<Video>;
  deleteAcademyVideo(videoId: number): Promise<void>;
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

  async updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
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

  async getViralFeed(): Promise<Video[]> {
    // Viral feed algorithm: Push new creators to the top, mix with legendary creators
    // Strategy: 60% new creators (last 30 days), 40% established creators
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get new creators (uploaded in last 30 days)
    const newCreatorVideos = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.isPublished, true),
          sql`${videos.createdAt} >= ${thirtyDaysAgo}`
        )
      )
      .orderBy(
        // Prioritize by engagement rate (likes + views), then by recency
        sql`(${videos.likes} + ${videos.views}) DESC, ${videos.createdAt} DESC`
      )
      .limit(60);
    
    // Get established creators (older than 30 days, high performers)
    const establishedVideos = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.isPublished, true),
          sql`${videos.createdAt} < ${thirtyDaysAgo}`
        )
      )
      .orderBy(
        // Sort by performance metrics for established creators
        sql`(${videos.likes} + ${videos.views} + ${videos.shares}) DESC`
      )
      .limit(40);
    
    // Combine and shuffle for viral effect
    const allVideos = [...newCreatorVideos, ...establishedVideos];
    
    // Shuffle algorithm to mix new and established creators
    for (let i = allVideos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allVideos[i], allVideos[j]] = [allVideos[j], allVideos[i]];
    }
    
    return allVideos;
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

  // YouTube-style video functionality
  async incrementVideoShares(videoId: number): Promise<void> {
    await db.update(videos)
      .set({ shareCount: sql`${videos.shareCount} + 1` })
      .where(eq(videos.id, videoId));
  }

  async trackAdImpression(creatorId: string, videoId: number, cpmRate: number): Promise<void> {
    await db.insert(adRevenue).values({
      creatorId,
      videoId,
      impressions: 1,
      earnings: Math.round(cpmRate / 1000), // CPM to earnings per impression
      cpm: cpmRate
    });
  }

  async createCourseCheckout(userId: string, videoId: number, price: number): Promise<{ url: string }> {
    // This would integrate with Stripe to create a checkout session
    // For now, return a mock URL
    return { url: `/checkout/${videoId}?price=${price}` };
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

  // Course purchase operations
  async createCoursePurchase(purchase: InsertCoursePurchase): Promise<CoursePurchase> {
    const [coursePurchase] = await db
      .insert(coursePurchases)
      .values(purchase)
      .returning();
    return coursePurchase;
  }

  async getUserPurchases(userId: string): Promise<CoursePurchase[]> {
    return await db
      .select()
      .from(coursePurchases)
      .where(eq(coursePurchases.userId, userId))
      .orderBy(desc(coursePurchases.createdAt));
  }

  async hasUserPurchasedCourse(userId: string, videoId: number): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(coursePurchases)
      .where(and(
        eq(coursePurchases.userId, userId),
        eq(coursePurchases.videoId, videoId)
      ));
    return !!purchase;
  }

  async getCreatorEarnings(creatorId: string): Promise<number> {
    const result = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${coursePurchases.creatorEarnings}), 0)`,
      })
      .from(coursePurchases)
      .innerJoin(videos, eq(coursePurchases.videoId, videos.id))
      .where(eq(videos.creatorId, creatorId));
    
    return result[0]?.totalEarnings || 0;
  }

  // Favorites operations
  async addToFavorites(userId: string, videoId: number): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, videoId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: string, videoId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.videoId, videoId)));
  }

  async getFavorites(userId: string): Promise<Video[]> {
    const result = await db
      .select({ video: videos })
      .from(favorites)
      .innerJoin(videos, eq(videos.id, favorites.videoId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    
    return result.map(r => r.video);
  }

  async isFavorited(userId: string, videoId: number): Promise<boolean> {
    const [favorite] = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.videoId, videoId)));
    return !!favorite;
  }

  // Shared videos operations
  async shareVideo(userId: string, videoId: number, recipientEmail?: string, message?: string): Promise<SharedVideo> {
    const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const [sharedVideo] = await db
      .insert(sharedVideos)
      .values({
        userId,
        videoId,
        shareToken,
        recipientEmail,
        message,
      })
      .returning();
    
    return sharedVideo;
  }

  async getSharedVideos(userId: string): Promise<SharedVideo[]> {
    return await db
      .select()
      .from(sharedVideos)
      .where(eq(sharedVideos.userId, userId))
      .orderBy(desc(sharedVideos.createdAt));
  }

  async getSharedVideoByToken(shareToken: string): Promise<SharedVideo | undefined> {
    const [sharedVideo] = await db
      .select()
      .from(sharedVideos)
      .where(eq(sharedVideos.shareToken, shareToken));
    return sharedVideo;
  }

  // 3-Tier system methods
  async getCreatorStats(creatorId: string): Promise<{
    totalVideos: number;
    totalViews: number;
    totalEarnings: number;
    uploadHoursUsed: number;
    uploadHoursLimit: number;
    accountType: string;
    streamingVideos: number;
    basicVideos: number;
    premiumVideos: number;
    streamingEarnings: number;
    basicEarnings: number;
  }> {
    const user = await this.getUser(creatorId);
    if (!user) throw new Error('User not found');

    // Get video counts by type
    const videoStats = await db
      .select({
        videoType: videos.videoType,
        count: count(),
        totalViews: sql<number>`SUM(${videos.views})`,
      })
      .from(videos)
      .where(eq(videos.creatorId, creatorId))
      .groupBy(videos.videoType);

    const streamingVideos = videoStats.find(s => s.videoType === 'streaming')?.count || 0;
    const basicVideos = videoStats.find(s => s.videoType === 'basic')?.count || 0;
    const premiumVideos = videoStats.find(s => s.videoType === 'premium')?.count || 0;
    const totalViews = videoStats.reduce((sum, stat) => sum + (stat.totalViews || 0), 0);

    // Get earnings from purchases
    const purchaseStats = await db
      .select({
        creatorEarnings: sql<number>`SUM(${coursePurchases.creatorEarnings})`,
        purchaseType: coursePurchases.purchaseType,
      })
      .from(coursePurchases)
      .innerJoin(videos, eq(coursePurchases.videoId, videos.id))
      .where(eq(videos.creatorId, creatorId))
      .groupBy(coursePurchases.purchaseType);

    const streamingEarnings = purchaseStats.find(s => s.purchaseType === 'streaming_subscription')?.creatorEarnings || 0;
    const basicEarnings = purchaseStats.find(s => s.purchaseType === 'basic')?.creatorEarnings || 0;

    return {
      totalVideos: streamingVideos + basicVideos + premiumVideos,
      totalViews,
      totalEarnings: streamingEarnings + basicEarnings,
      uploadHoursUsed: user.uploadHoursUsed || 0,
      uploadHoursLimit: user.uploadHoursLimit || 5,
      accountType: user.accountType || 'free',
      streamingVideos,
      basicVideos,
      premiumVideos,
      streamingEarnings,
      basicEarnings,
    };
  }

  async upgradeCreatorAccount(userId: string, accountType: string): Promise<User> {
    const uploadLimit = accountType === 'pro' ? 500 : 5;
    
    const [user] = await db
      .update(users)
      .set({
        accountType,
        uploadHoursLimit: uploadLimit,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updateCreatorPaymentUrls(userId: string, paypalUrl?: string, stripeUrl?: string): Promise<User> {
    const updateData: any = { updatedAt: new Date() };
    
    if (paypalUrl !== undefined) updateData.paypalPaymentUrl = paypalUrl;
    if (stripeUrl !== undefined) updateData.stripePaymentUrl = stripeUrl;

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  // Pro Creator code operations
  async generateProCreatorCode(expiresAt?: Date): Promise<ProCreatorCode> {
    // Generate a unique 12-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                 Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const [newCode] = await db
      .insert(proCreatorCodes)
      .values({
        code,
        expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
      })
      .returning();
    
    return newCode;
  }

  async useProCreatorCode(code: string, userId: string): Promise<boolean> {
    // Check if code exists and is valid
    const [existingCode] = await db
      .select()
      .from(proCreatorCodes)
      .where(eq(proCreatorCodes.code, code));
    
    if (!existingCode || existingCode.isUsed) {
      return false;
    }
    
    if (existingCode.expiresAt && new Date() > existingCode.expiresAt) {
      return false;
    }
    
    // Mark code as used
    await db
      .update(proCreatorCodes)
      .set({ 
        isUsed: true, 
        usedByUserId: userId, 
        usedAt: new Date() 
      })
      .where(eq(proCreatorCodes.code, code));
    
    // Upgrade user to Pro Creator for 12 months
    const endsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 12 months
    await this.upgradeToProCreator(userId, 'free_code', endsAt);
    
    return true;
  }

  async getProCreatorCode(code: string): Promise<ProCreatorCode | undefined> {
    const [existingCode] = await db
      .select()
      .from(proCreatorCodes)
      .where(eq(proCreatorCodes.code, code));
    
    return existingCode;
  }

  async getAllProCreatorCodes(): Promise<ProCreatorCode[]> {
    return await db
      .select()
      .from(proCreatorCodes)
      .orderBy(desc(proCreatorCodes.createdAt));
  }

  async upgradeToProCreator(userId: string, plan: string, endsAt: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isProCreator: true,
        proCreatorEndsAt: endsAt,
        proCreatorPlan: plan,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  // Admin analytics and management functions
  async getAdminAnalytics(): Promise<any> {
    try {
      // Get basic counts
      const [userCount] = await db.select({ count: count() }).from(users);
      const [videoCount] = await db.select({ count: count() }).from(videos);
      
      // Get creator stats
      const creatorStats = await db
        .select({
          totalCreators: count(),
          proCreators: sql<number>`SUM(CASE WHEN ${users.isProCreator} = true THEN 1 ELSE 0 END)`,
        })
        .from(users)
        .where(sql`${users.role} = 'creator' OR ${users.isProCreator} = true`);

      // Get total views and revenue
      const videoStats = await db
        .select({
          totalViews: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
          totalRevenue: sql<number>`COALESCE(SUM(${videos.price}), 0)`,
        })
        .from(videos);

      // Simulate hourly activity (in production, track real data)
      const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activity: Math.floor(Math.random() * 100) + 10
      })).sort((a, b) => b.activity - a.activity);

      // Get top creators by earnings
      const topCreators = await db
        .select({
          id: users.id,
          name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
          earnings: sql<number>`COALESCE(SUM(${videos.price} * ${videos.views}), 0)`,
          videos: count(videos.id),
        })
        .from(users)
        .leftJoin(videos, eq(users.id, videos.creatorId))
        .groupBy(users.id, users.firstName, users.lastName, users.email)
        .orderBy(sql`COALESCE(SUM(${videos.price} * ${videos.views}), 0) DESC`)
        .limit(10);

      return {
        totalUsers: userCount.count || 0,
        totalCreators: creatorStats[0]?.totalCreators || 0,
        totalProCreators: creatorStats[0]?.proCreators || 0,
        totalVideos: videoCount.count || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalRevenue: videoStats[0]?.totalRevenue || 0,
        hourlyActivity,
        topCreators,
        proCreatorRevenue: 0, // Calculate from subscriptions
        courseSalesRevenue: 0, // Calculate from course purchases
        premiumRevenue: 0, // Calculate from premium subscriptions
      };
    } catch (error) {
      console.error('Error getting admin analytics:', error);
      return {
        totalUsers: 0,
        totalCreators: 0,
        totalProCreators: 0,
        totalVideos: 0,
        totalViews: 0,
        totalRevenue: 0,
        hourlyActivity: [],
        topCreators: [],
        proCreatorRevenue: 0,
        courseSalesRevenue: 0,
        premiumRevenue: 0,
      };
    }
  }

  async getAllCreatorsWithStats(): Promise<any[]> {
    try {
      const creators = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          isProCreator: users.isProCreator,
          proCreatorEndsAt: users.proCreatorEndsAt,
          channelName: users.channelName,
          createdAt: users.createdAt,
          totalVideos: count(videos.id),
          totalViews: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
          totalEarnings: sql<number>`COALESCE(SUM(${videos.price} * ${videos.views}), 0)`,
        })
        .from(users)
        .leftJoin(videos, eq(users.id, videos.creatorId))
        .where(sql`${users.role} = 'creator' OR ${users.isProCreator} = true OR EXISTS(SELECT 1 FROM videos WHERE videos.creator_id = ${users.id})`)
        .groupBy(
          users.id,
          users.email,
          users.firstName,
          users.lastName,
          users.isProCreator,
          users.proCreatorEndsAt,
          users.channelName,
          users.createdAt
        )
        .orderBy(sql`COALESCE(SUM(${videos.price} * ${videos.views}), 0) DESC`);

      return creators;
    } catch (error) {
      console.error('Error getting creators with stats:', error);
      return [];
    }
  }

  async removeCreator(creatorId: string): Promise<void> {
    try {
      // Delete creator's videos first (due to foreign key constraints)
      await db.delete(videos).where(eq(videos.creatorId, creatorId));
      
      // Delete creator's other data
      await db.delete(comments).where(eq(comments.userId, creatorId));
      await db.delete(videoLikes).where(eq(videoLikes.userId, creatorId));
      await db.delete(favorites).where(eq(favorites.userId, creatorId));
      await db.delete(watchHistory).where(eq(watchHistory.userId, creatorId));
      
      // Finally delete the user
      await db.delete(users).where(eq(users.id, creatorId));
    } catch (error) {
      console.error('Error removing creator:', error);
      throw error;
    }
  }

  async suspendCreator(creatorId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          role: 'suspended',
          updatedAt: new Date(),
        })
        .where(eq(users.id, creatorId));
    } catch (error) {
      console.error('Error suspending creator:', error);
      throw error;
    }
  }

  // Creator verification operations
  async submitCreatorVerification(
    userId: string,
    data: {
      legalName: string;
      email: string;
      residentialAddress: string;
      dateOfBirth: string;
      signatureName: string;
      socialMediaLinks: string;
      publishedArticles?: string;
      teachingQualifications: string;
      professionalExperience: string;
      idDocumentUrl: string;
      idSelfieUrl: string;
      ipAddress: string;
    }
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        legalName: data.legalName,
        email: data.email,
        residentialAddress: data.residentialAddress,
        dateOfBirth: data.dateOfBirth,
        socialMediaLinks: data.socialMediaLinks,
        publishedArticles: data.publishedArticles,
        teachingQualifications: data.teachingQualifications,
        professionalExperience: data.professionalExperience,
        idDocumentUrl: data.idDocumentUrl,
        idSelfieUrl: data.idSelfieUrl,
        hasSignedCreatorAgreement: true,
        creatorAgreementSignedAt: new Date(),
        creatorAgreementIpAddress: data.ipAddress,
        idVerificationStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updateIdVerificationStatus(
    userId: string,
    status: "pending" | "approved" | "rejected"
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        idVerificationStatus: status,
        isIdVerified: status === "approved",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async getPendingVerifications(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.idVerificationStatus, "pending"));
  }

  // Security and reporting operations
  async createVideoReport(reportData: InsertVideoReport): Promise<VideoReport> {
    const [report] = await db
      .insert(videoReports)
      .values(reportData)
      .returning();
    return report;
  }

  async getAllVideoReports(): Promise<VideoReport[]> {
    return await db
      .select()
      .from(videoReports)
      .orderBy(desc(videoReports.createdAt));
  }

  async updateVideoReportStatus(
    reportId: string,
    status: string,
    reviewedBy: string
  ): Promise<void> {
    await db
      .update(videoReports)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(videoReports.id, parseInt(reportId)));
  }

  async logSecurityEvent(eventData: InsertSecurityLog): Promise<void> {
    await db.insert(securityLogs).values(eventData);
  }

  async checkRateLimit(
    identifier: string,
    action: string,
    maxAttempts: number,
    windowMinutes: number
  ): Promise<boolean> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    const [existingLimit] = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, identifier),
          eq(rateLimits.action, action),
          sql`${rateLimits.windowStart} > ${windowStart}`
        )
      );

    if (existingLimit) {
      if (existingLimit.attempts >= maxAttempts) {
        return false; // Rate limit exceeded
      }
      
      // Update attempt count
      await db
        .update(rateLimits)
        .set({ attempts: existingLimit.attempts + 1 })
        .where(eq(rateLimits.id, existingLimit.id));
    } else {
      // Create new rate limit record
      await db.insert(rateLimits).values({
        identifier,
        action,
        attempts: 1,
        windowStart: new Date(),
      });
    }

    return true; // Within rate limit
  }

  // ProFlix Academy operations
  async createProFlixAcademy(): Promise<User> {
    const academyUser = {
      id: 'proflix-academy',
      email: 'academy@proflix.com',
      firstName: 'ProFlix',
      lastName: 'Academy',
      profileImageUrl: '/uploads/academy-avatar.png',
      isSystemAccount: true,
      role: 'creator',
      channelName: 'ProFlix Academy',
      channelDescription: 'Official ProFlix Academy - Learn with our expert instructors',
    };
    
    return await this.upsertUser(academyUser);
  }

  async getAcademyVideos(): Promise<Video[]> {
    const academyVideos = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
        categoryId: videos.categoryId,
        subcategoryId: videos.subcategoryId,
        creatorId: videos.creatorId,
        isCourse: videos.isCourse,
        coursePrice: videos.coursePrice,
        courseDescription: videos.courseDescription,
        isFreeContent: videos.isFreeContent,
        offersPremiumDiscount: videos.offersPremiumDiscount,
        views: videos.views,
        likes: videos.likes,
        isPublished: videos.isPublished,
        createdAt: videos.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        subcategory: {
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
        },
      })
      .from(videos)
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .leftJoin(subcategories, eq(videos.subcategoryId, subcategories.id))
      .where(eq(videos.creatorId, 'proflix-academy'))
      .orderBy(desc(videos.createdAt));
    
    return academyVideos;
  }

  async getAcademyStats(): Promise<any> {
    const totalVideos = await db
      .select({ count: count() })
      .from(videos)
      .where(eq(videos.creatorId, 'proflix-academy'));
    
    const totalCourses = await db
      .select({ count: count() })
      .from(videos)
      .where(and(eq(videos.creatorId, 'proflix-academy'), eq(videos.isCourse, true)));
    
    const freeContent = await db
      .select({ count: count() })
      .from(videos)
      .where(and(eq(videos.creatorId, 'proflix-academy'), eq(videos.isFreeContent, true)));
    
    const totalViews = await db
      .select({ total: sql<number>`COALESCE(SUM(${videos.views}), 0)` })
      .from(videos)
      .where(eq(videos.creatorId, 'proflix-academy'));
    
    return {
      totalVideos: totalVideos[0]?.count || 0,
      totalCourses: totalCourses[0]?.count || 0,
      freeContent: freeContent[0]?.count || 0,
      totalViews: totalViews[0]?.total || 0,
    };
  }

  async createAcademyVideo(data: any): Promise<Video> {
    const { videoFile, thumbnailFile, tags, ...videoData } = data;
    
    // Handle file uploads
    let videoUrl = '';
    let thumbnailUrl = '';
    
    if (videoFile) {
      const videoPath = `/uploads/academy-videos/${Date.now()}-${videoFile.originalname}`;
      const fs = require('fs');
      const path = require('path');
      
      // Ensure directory exists
      const uploadsDir = path.dirname(`./server/public${videoPath}`);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save video file
      fs.writeFileSync(`./server/public${videoPath}`, videoFile.buffer);
      videoUrl = videoPath;
    }
    
    if (thumbnailFile) {
      const thumbnailPath = `/uploads/academy-thumbnails/${Date.now()}-${thumbnailFile.originalname}`;
      const fs = require('fs');
      const path = require('path');
      
      // Ensure directory exists
      const uploadsDir = path.dirname(`./server/public${thumbnailPath}`);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save thumbnail file
      fs.writeFileSync(`./server/public${thumbnailPath}`, thumbnailFile.buffer);
      thumbnailUrl = thumbnailPath;
    }
    
    const insertData = {
      ...videoData,
      creatorId: 'proflix-academy',
      videoUrl,
      thumbnailUrl,
      tags: tags || [],
      isPublished: true,
      videoType: 'free',
    };
    
    const [video] = await db
      .insert(videos)
      .values(insertData)
      .returning();
    
    return video;
  }

  async deleteAcademyVideo(videoId: number): Promise<void> {
    // First get the video to check if it belongs to ProFlix Academy
    const video = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.creatorId, 'proflix-academy')))
      .limit(1);
    
    if (video.length === 0) {
      throw new Error('Academy video not found');
    }
    
    // Delete the video file and thumbnail if they exist
    if (video[0].videoUrl) {
      const fs = require('fs');
      const videoPath = `./server/public${video[0].videoUrl}`;
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    if (video[0].thumbnailUrl) {
      const fs = require('fs');
      const thumbnailPath = `./server/public${video[0].thumbnailUrl}`;
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    // Delete the video record
    await db.delete(videos).where(eq(videos.id, videoId));
  }

  async addMissingColumns(): Promise<void> {
    try {
      // Add missing columns to the database
      await db.execute(sql`
        ALTER TABLE videos 
        ADD COLUMN IF NOT EXISTS is_free_content BOOLEAN DEFAULT false;
      `);
      
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_system_account BOOLEAN DEFAULT false;
      `);
      
      console.log('✅ Database columns added successfully');
    } catch (error) {
      console.error('Database column addition error:', error);
      // Continue execution - columns might already exist
    }
  }
}

export const storage = new DatabaseStorage();
