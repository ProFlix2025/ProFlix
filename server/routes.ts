import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { requireAdminAuth, adminLogin, adminLogout, adminStatus } from "./adminAuth";
import { insertVideoSchema, updateVideoSchema, insertCreatorApplicationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else if (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB for videos
  }
});

// Initialize Stripe only if key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized');
} else {
  console.warn('⚠️  Stripe not initialized - STRIPE_SECRET_KEY not set');
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Public routes that don't require authentication
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Manual setup route to initialize database data
  app.get('/setup', async (req, res) => {
    try {
      console.log('🔄 Manual setup triggered...');
      
      // Initialize categories if empty
      const existingCategories = await storage.getCategories();
      if (existingCategories.length === 0) {
        console.log('📋 Setting up categories...');
        await storage.initializeCategories();
        console.log('✅ Categories initialized');
      } else {
        console.log('✅ Categories already exist:', existingCategories.length);
      }
      
      // Initialize ProFlix Academy if needed
      try {
        await storage.createProFlixAcademy();
        console.log('✅ ProFlix Academy initialized');
      } catch (error) {
        console.log('✅ ProFlix Academy already exists');
      }
      
      const categoryCount = await storage.getCategories();
      res.json({ 
        success: true, 
        message: 'Setup completed successfully',
        categoriesCount: categoryCount.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Setup failed: ' + error.message 
      });
    }
  });

  // Auth middleware - only sets up routes, doesn't force authentication
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.get('/api/auth/user', async (req, res) => {
    // For now, return null (no user) - can be updated later with proper auth
    res.json(null);
  });

  // Database migration endpoint - add missing columns
  app.post('/api/admin/migrate-database', async (req, res) => {
    try {
      await storage.addMissingColumns();
      res.json({ message: 'Database migration completed' });
    } catch (error) {
      console.error('Database migration error:', error);
      res.status(500).json({ message: 'Migration failed' });
    }
  });

  // Production database fix - comprehensive repair
  app.post('/api/admin/fix-production-db', async (req, res) => {
    try {
      const { fixProductionDatabase } = await import('./fixProductionDB');
      await fixProductionDatabase();
      res.json({ message: 'Production database fixed successfully' });
    } catch (error) {
      console.error('Production database fix error:', error);
      res.status(500).json({ message: 'Production database fix failed', error: error.message });
    }
  });

  // Simple test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
  });

  // Fix production database via GET request
  app.get('/api/admin/fix-production-db-get', async (req, res) => {
    try {
      const { fixProductionDatabase } = await import('./fixProductionDB');
      await fixProductionDatabase();
      res.json({ message: 'Production database fixed successfully via GET' });
    } catch (error) {
      console.error('Production database fix error:', error);
      res.status(500).json({ message: 'Production database fix failed', error: error.message });
    }
  });

  // Add emojis to categories via GET request
  app.get('/api/admin/add-emojis', async (req, res) => {
    try {
      const { sql } = await import('drizzle-orm');
      const { db } = await import('./db');
      
      // Map of category names to emojis
      const categoryEmojis = {
        'Art': '🎨',
        'Fitness': '💪',
        'Entrepreneurship': '💼',
        'Beauty': '💄',
        'Construction': '🏗️',
        'Music': '🎵',
        'Film & Media': '🎥',
        'Food': '🍳',
        'Sports': '⚽',
        'Dating & Lifestyle': '💕',
        'Tech & Programming': '💻',
        'Finance & Investing': '💰',
        'Marketing & Sales': '📈',
        'Health & Wellness': '🧘',
        'Photography & Content Creation': '📸',
        'Fashion & Style': '👗',
        'Parenting & Relationships': '👶',
        'Home & DIY': '🏠',
        'Gaming & Esports': '🎮',
        'Language & Culture': '🗣️',
        'Spirituality & Mindset': '🧠',
        'Automotive & Mechanics': '🚗',
        'Pets & Animal Care': '🐾',
        'Event Planning & Hospitality': '🎉',
        'Voice & Communication': '🎤',
        'Career & Job Skills': '💼',
        'Travel & Expat Life': '✈️',
        'Sales & Negotiation': '🤝',
        'AI & Automation': '🤖',
        'Education for Creators': '📚'
      };
      
      let updated = 0;
      for (const [name, emoji] of Object.entries(categoryEmojis)) {
        const result = await db.execute(sql`
          UPDATE categories 
          SET emoji = ${emoji} 
          WHERE name = ${name};
        `);
        if (result.rowCount > 0) updated++;
      }
      
      res.json({ message: `Updated ${updated} categories with emojis` });
    } catch (error) {
      console.error('Emoji update error:', error);
      res.status(500).json({ message: 'Failed to update emojis', error: error.message });
    }
  });

  // Check database schema for debugging
  app.get('/api/admin/check-schema', async (req, res) => {
    try {
      const result = await storage.checkDatabaseSchema();
      res.json(result);
    } catch (error) {
      console.error('Schema check error:', error);
      res.status(500).json({ message: 'Schema check failed', error: error.message });
    }
  });

  // Pro Creator Portal routes - Public access for application
  app.get('/api/pro-creator/status', async (req: any, res) => {
    try {
      // Allow public access - return basic info without requiring auth
      if (!req.user) {
        return res.json({
          isProCreator: false,
          canApply: true,
          requiresAuth: true,
          message: 'Sign in to apply for Pro Creator status'
        });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isProCreator = user.isProCreator && 
        (!user.proCreatorEndsAt || new Date() <= user.proCreatorEndsAt);
      
      res.json({
        isProCreator,
        proCreatorEndsAt: user.proCreatorEndsAt,
        hasApplication: !!user.role,
        canApply: true // Free-for-all platform
      });
    } catch (error) {
      console.error('Error checking Pro Creator status:', error);
      res.status(500).json({ message: 'Failed to check status' });
    }
  });

  // Everyone can create and upload - no application needed
  // Users automatically get free tier on first login

  app.post('/api/pro-creator/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planType } = req.body;
      
      // Set subscription end date based on plan
      const endsAt = new Date(Date.now() + (planType === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000));
      
      // Update user to Pro Creator status
      await storage.upgradeToProCreator(userId, planType, endsAt);
      
      res.json({ 
        message: 'Pro Creator subscription activated successfully',
        expiresAt: endsAt 
      });
    } catch (error) {
      console.error('Error subscribing to Pro Creator:', error);
      res.status(500).json({ message: 'Failed to subscribe' });
    }
  });

  // Pro Creator code routes
  app.post('/api/pro-creator/generate-code', requireAdminAuth, async (req: any, res) => {
    try {
      const { expiresAt } = req.body;
      
      console.log('🎫 Admin generating Pro Creator code...');
      
      const code = await storage.generateProCreatorCode(expiresAt ? new Date(expiresAt) : undefined);
      
      console.log(`✅ Generated Pro Creator code: ${code.code}`);
      
      res.json(code);
    } catch (error) {
      console.error('Error generating Pro Creator code:', error);
      res.status(500).json({ message: 'Failed to generate code' });
    }
  });

  app.post('/api/pro-creator/use-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      
      const success = await storage.useProCreatorCode(code, userId);
      
      if (success) {
        res.json({ 
          message: 'Pro Creator code redeemed successfully! You now have 12 months of Pro Creator access.' 
        });
      } else {
        res.status(400).json({ 
          message: 'Invalid or expired code' 
        });
      }
    } catch (error) {
      console.error('Error using Pro Creator code:', error);
      res.status(500).json({ message: 'Failed to use code' });
    }
  });

  app.get('/api/pro-creator/codes', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Add admin authorization check
      const codes = await storage.getAllProCreatorCodes();
      res.json(codes);
    } catch (error) {
      console.error('Error fetching Pro Creator codes:', error);
      res.status(500).json({ message: 'Failed to fetch codes' });
    }
  });

  app.get('/api/pro-creator/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        isProCreator: user.isProCreator,
        proCreatorEndsAt: user.proCreatorEndsAt,
        proCreatorPlan: user.proCreatorPlan,
        canSellCourses: true // Anyone can sell courses now
      });
    } catch (error) {
      console.error('Pro Creator status error:', error);
      res.status(500).json({ message: 'Failed to get Pro Creator status' });
    }
  });

  // Admin authentication routes - simple session-based
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'ProFlix2025!Admin') {
      req.session.isAdmin = true;
      console.log('✅ Admin login successful');
      res.json({ success: true, message: 'Admin logged in successfully' });
    } else {
      console.log('❌ Invalid admin credentials');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
  
  app.post('/api/admin/logout', (req, res) => {
    req.session.isAdmin = false;
    res.json({ success: true });
  });
  
  app.get('/api/admin/status', (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
  });

  // Simple admin auth middleware
  const requireSimpleAdminAuth = (req, res, next) => {
    if (req.session.isAdmin) {
      next();
    } else {
      res.status(401).json({ error: 'Admin authentication required' });
    }
  };

  // Admin endpoint to generate Pro Creator codes
  app.post('/api/admin/generate-codes', requireAdminAuth, async (req, res) => {
    try {
      const { count = 1, expiresInDays = 365 } = req.body;
      console.log(`🎫 Admin generating ${count} Pro Creator codes...`);
      
      const codes = [];
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      for (let i = 0; i < Math.min(count, 50); i++) {
        const code = await storage.generateProCreatorCode(expiresAt);
        codes.push(code);
      }
      
      console.log(`✅ Generated ${codes.length} Pro Creator codes`);
      
      res.json({ 
        codes,
        message: `Generated ${codes.length} Pro Creator codes`,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Error generating codes:', error);
      res.status(500).json({ message: 'Failed to generate codes' });
    }
  });

  // Admin endpoint to list all codes
  app.get('/api/admin/codes', requireAdminAuth, async (req, res) => {
    try {
      const codes = await storage.getAllProCreatorCodes();
      res.json(codes);
    } catch (error) {
      console.error('Error fetching codes:', error);
      res.status(500).json({ message: 'Failed to fetch codes' });
    }
  });

  // LearnTube Management API Routes
  // Get all LearnTube videos
  app.get('/api/admin/learntube/videos', requireAdminAuth, async (req, res) => {
    try {
      const videos = await storage.getLearnTubeVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching LearnTube videos:', error);
      res.status(500).json({ message: 'Failed to fetch LearnTube videos' });
    }
  });

  // Add YouTube video to LearnTube
  app.post('/api/admin/learntube/add-youtube', requireAdminAuth, async (req, res) => {
    try {
      console.log('📹 YouTube video add request:', req.body);
      const { url, title, description, categoryId } = req.body;
      
      // Extract YouTube video ID from URL
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        console.log('❌ Invalid YouTube URL:', url);
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }
      
      console.log('✅ Extracted video ID:', videoId);
      console.log('📝 Adding video with data:', { youtubeId: videoId, title, description, categoryId });
      
      const video = await storage.addYouTubeVideo({
        youtubeId: videoId,
        title,
        description,
        categoryId,
        source: 'learntube',
        canRunAds: false
      });
      
      console.log('✅ YouTube video added successfully:', video.id);
      res.json({ success: true, video });
    } catch (error) {
      console.error('❌ Error adding YouTube video:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Failed to add YouTube video', error: error.message });
    }
  });

  // Simplified YouTube video embedding (no auth required for testing)
  app.post('/api/admin/learntube/add-youtube-simple', async (req, res) => {
    try {
      console.log('🎬 Simple YouTube embed request:', req.body);
      const { url, categoryId } = req.body;
      
      // Extract YouTube video ID from URL
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        console.log('❌ Invalid YouTube URL:', url);
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }
      
      console.log('✅ Extracted video ID:', videoId);
      
      // Auto-generate title and description
      const title = `YouTube Video ${videoId}`;
      const description = `Educational content from YouTube (ID: ${videoId})`;
      
      // Create proper embed URL instead of direct YouTube URL
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      console.log('📝 Auto-generating video data:', { youtubeId: videoId, title, description, categoryId, embedUrl });
      
      // Insert directly into database with embed URL
      const video = await storage.addYouTubeVideoWithEmbed({
        youtubeId: videoId,
        title,
        description,
        categoryId,
        embedUrl,
        source: 'learntube',
        canRunAds: false
      });
      
      console.log('✅ YouTube video embedded successfully:', video.id);
      res.json({ success: true, video });
    } catch (error) {
      console.error('❌ Error embedding YouTube video:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Failed to embed YouTube video', error: error.message });
    }
  });

  // Bulk delete LearnTube videos
  app.post('/api/admin/learntube/bulk-delete', requireAdminAuth, async (req, res) => {
    try {
      const { videoIds } = req.body;
      const deletedCount = await storage.bulkDeleteLearnTubeVideos(videoIds);
      res.json({ success: true, deletedCount });
    } catch (error) {
      console.error('Error bulk deleting LearnTube videos:', error);
      res.status(500).json({ message: 'Failed to bulk delete videos' });
    }
  });

  // Delete all LearnTube videos
  app.post('/api/admin/learntube/delete-all', requireAdminAuth, async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllLearnTubeVideos();
      res.json({ success: true, deletedCount });
    } catch (error) {
      console.error('Error deleting all LearnTube videos:', error);
      res.status(500).json({ message: 'Failed to delete all LearnTube videos' });
    }
  });

  // Get LearnTube analytics
  app.get('/api/admin/learntube/analytics', requireAdminAuth, async (req, res) => {
    try {
      const analytics = await storage.getLearnTubeAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching LearnTube analytics:', error);
      res.status(500).json({ message: 'Failed to fetch LearnTube analytics' });
    }
  });

  // Initialize ProFlix Academy system account
  app.post('/api/admin/init-academy', requireAdminAuth, async (req, res) => {
    try {
      await storage.createProFlixAcademy();
      res.json({ message: 'ProFlix Academy initialized successfully' });
    } catch (error) {
      console.error('Error initializing ProFlix Academy:', error);
      res.status(500).json({ message: 'Failed to initialize ProFlix Academy' });
    }
  });

  // ProFlix Academy content management
  app.get('/api/admin/academy-videos', requireAdminAuth, async (req, res) => {
    try {
      const videos = await storage.getAcademyVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching academy videos:', error);
      res.status(500).json({ message: 'Failed to fetch academy videos' });
    }
  });

  app.get('/api/admin/academy-stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAcademyStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching academy stats:', error);
      res.status(500).json({ message: 'Failed to fetch academy stats' });
    }
  });

  app.post('/api/admin/academy-videos', requireAdminAuth, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const videoData = {
        ...req.body,
        videoFile: req.files?.video?.[0],
        thumbnailFile: req.files?.thumbnail?.[0],
        coursePrice: req.body.coursePrice ? Math.round(parseFloat(req.body.coursePrice) * 100) : 0,
        isCourse: req.body.isCourse === 'true',
        isFreeContent: req.body.isFreeContent === 'true',
        offersPremiumDiscount: req.body.offersPremiumDiscount === 'true',
        categoryId: parseInt(req.body.categoryId),
        subcategoryId: parseInt(req.body.subcategoryId),
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
      };
      
      const video = await storage.createAcademyVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error('Error creating academy video:', error);
      res.status(500).json({ message: 'Failed to create academy video' });
    }
  });

  app.delete('/api/admin/academy-videos/:id', requireAdminAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      await storage.deleteAcademyVideo(videoId);
      res.json({ message: 'Academy video deleted successfully' });
    } catch (error) {
      console.error('Error deleting academy video:', error);
      res.status(500).json({ message: 'Failed to delete academy video' });
    }
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', requireAdminAuth, async (req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Admin creators management
  app.get('/api/admin/creators', requireAdminAuth, async (req, res) => {
    try {
      const creators = await storage.getAllCreatorsWithStats();
      res.json(creators);
    } catch (error) {
      console.error('Error fetching creators:', error);
      res.status(500).json({ message: 'Failed to fetch creators' });
    }
  });

  // Remove creator
  app.delete('/api/admin/creators/:id', requireAdminAuth, async (req, res) => {
    try {
      const creatorId = req.params.id;
      await storage.removeCreator(creatorId);
      res.json({ message: 'Creator removed successfully' });
    } catch (error) {
      console.error('Error removing creator:', error);
      res.status(500).json({ message: 'Failed to remove creator' });
    }
  });

  // Suspend creator
  app.post('/api/admin/creators/:id/suspend', requireAdminAuth, async (req, res) => {
    try {
      const creatorId = req.params.id;
      await storage.suspendCreator(creatorId);
      res.json({ message: 'Creator suspended successfully' });
    } catch (error) {
      console.error('Error suspending creator:', error);
      res.status(500).json({ message: 'Failed to suspend creator' });
    }
  });



  // Creator verification routes
  app.post('/api/creator/verify', isAuthenticated, upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'idSelfie', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { 
        legalName, 
        email,
        residentialAddress,
        dateOfBirth, 
        signatureName,
        socialMediaLinks,
        publishedArticles,
        teachingQualifications,
        professionalExperience,
        ageConfirmation,
        contentOwnership,
        nondiscrimination,
        responsibilityWaiver,
        indemnificationClause,
        comprehensiveAgreement
      } = req.body;

      // Validate required fields
      if (!legalName || !email || !residentialAddress || !dateOfBirth || !signatureName ||
          !socialMediaLinks || !teachingQualifications || !professionalExperience) {
        return res.status(400).json({ error: 'All required fields must be completed including teaching qualifications' });
      }

      // Validate legal agreements
      if (!ageConfirmation || !contentOwnership || !nondiscrimination || 
          !responsibilityWaiver || !indemnificationClause || !comprehensiveAgreement) {
        return res.status(400).json({ error: 'All legal agreements must be accepted including comprehensive agreement' });
      }

      // Validate files
      if (!req.files?.idDocument?.[0]) {
        return res.status(400).json({ error: 'ID document is required' });
      }

      if (!req.files?.idSelfie?.[0]) {
        return res.status(400).json({ error: 'Selfie with ID is required' });
      }

      const idDocumentUrl = `/uploads/${req.files.idDocument[0].filename}`;
      const idSelfieUrl = `/uploads/${req.files.idSelfie[0].filename}`;

      // Calculate age
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({ error: 'You must be at least 18 years old to become a creator' });
      }

      const user = await storage.submitCreatorVerification(userId, {
        legalName,
        email,
        residentialAddress,
        dateOfBirth,
        signatureName,
        socialMediaLinks,
        publishedArticles,
        teachingQualifications,
        professionalExperience,
        idDocumentUrl,
        idSelfieUrl,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      });

      res.json({ 
        message: 'Verification submitted successfully',
        status: 'pending',
        user: {
          id: user.id,
          legalName: user.legalName,
          idVerificationStatus: user.idVerificationStatus,
          hasSignedCreatorAgreement: user.hasSignedCreatorAgreement,
        }
      });
    } catch (error) {
      console.error('Error submitting creator verification:', error);
      res.status(500).json({ error: 'Failed to submit verification' });
    }
  });

  // Admin verification management
  app.get('/api/admin/verifications', async (req, res) => {
    try {
      const pendingVerifications = await storage.getPendingVerifications();
      res.json(pendingVerifications);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      res.status(500).json({ message: 'Failed to fetch pending verifications' });
    }
  });

  app.post('/api/admin/verifications/:userId/approve', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.updateIdVerificationStatus(userId, 'approved');
      res.json({ message: 'Verification approved', user });
    } catch (error) {
      console.error('Error approving verification:', error);
      res.status(500).json({ message: 'Failed to approve verification' });
    }
  });

  app.post('/api/admin/verifications/:userId/reject', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.updateIdVerificationStatus(userId, 'rejected');
      res.json({ message: 'Verification rejected', user });
    } catch (error) {
      console.error('Error rejecting verification:', error);
      res.status(500).json({ message: 'Failed to reject verification' });
    }
  });

  // Course purchase routes
  app.post('/api/courses/:videoId/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.videoId);
      
      // Check if user already purchased this course
      const alreadyPurchased = await storage.hasUserPurchasedCourse(userId, videoId);
      if (alreadyPurchased) {
        return res.status(400).json({ message: "You have already purchased this course" });
      }

      // Get the video details
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (!video.isPublished) {
        return res.status(400).json({ message: "Course is not available for purchase" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: video.price, // Price is already in cents
        currency: "usd",
        metadata: {
          userId,
          videoId: videoId.toString(),
          creatorId: video.creatorId,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: video.price,
        courseName: video.title,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  // Creator upgrade endpoint
  app.post("/api/creator/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tier } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!['new', 'pro', 'enterprise'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier' });
      }

      // Update user's creator tier
      await storage.updateUserCreatorTier(userId, tier);

      // Set video hour limits based on tier
      let videoHourLimit = 10; // New Creator tier default
      if (tier === 'pro') {
        videoHourLimit = -1; // Pro tier - unlimited (represented as -1)
      } else if (tier === 'enterprise') {
        videoHourLimit = -1; // Enterprise tier - unlimited
      }

      // Update video hour limit
      await storage.updateVideoHourLimit(userId, videoHourLimit);

      res.json({ 
        success: true, 
        message: `Successfully upgraded to ${tier} creator tier`,
        tier,
        videoHourLimit
      });
    } catch (error) {
      console.error("Error upgrading creator tier:", error);
      res.status(500).json({ error: "Failed to upgrade creator tier" });
    }
  });

  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      // Note: In production, you'd verify the webhook signature
      const event = JSON.parse(req.body.toString());

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, videoId, creatorId } = paymentIntent.metadata;

        // Calculate revenue split (80% creator, 20% platform)
        const totalAmount = paymentIntent.amount;
        const creatorEarnings = Math.floor(totalAmount * 0.8);
        const platformEarnings = totalAmount - creatorEarnings;

        // Record the purchase
        await storage.createCoursePurchase({
          userId,
          videoId: parseInt(videoId),
          priceAtPurchase: totalAmount,
          creatorEarnings,
          platformEarnings,
          stripePaymentId: paymentIntent.id,
        });

        // Update video purchase count
        const video = await storage.getVideo(parseInt(videoId));
        if (video) {
          await storage.updateVideo({
            id: parseInt(videoId),
            purchases: (video.purchases || 0) + 1,
          });
        }

        console.log(`Course purchase completed: User ${userId} bought course ${videoId} for $${totalAmount/100}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(400).json({ error: "Webhook processing failed" });
    }
  });

  app.get('/api/my-purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.get('/api/creator/earnings', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const totalEarnings = await storage.getCreatorEarnings(creatorId);
      res.json({ totalEarnings });
    } catch (error) {
      console.error("Error fetching creator earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // Database schema initialization for production
  app.post('/api/db-push', async (req, res) => {
    try {
      const { initializeDatabase } = await import('./initDb');
      const success = await initializeDatabase();
      
      if (success) {
        res.json({ 
          message: 'Database schema initialized successfully',
          tablesCreated: true
        });
      } else {
        res.status(500).json({ 
          message: 'Database initialization failed',
          tablesCreated: false
        });
      }
    } catch (error) {
      console.error('DB initialization error:', error);
      res.status(500).json({ 
        message: 'Database schema initialization failed',
        error: error.message
      });
    }
  });

  // Video reporting routes
  app.post("/api/report-video", async (req, res) => {
    try {
      const reportData = {
        ...req.body,
        reporterIp: req.ip || req.connection.remoteAddress || 'unknown',
        reporterUserAgent: req.get('User-Agent') || 'unknown',
      };
      
      const report = await storage.createVideoReport(reportData);
      
      // Log security event
      await storage.logSecurityEvent({
        userId: req.user?.id || null,
        action: 'video_report',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: JSON.stringify({ videoId: reportData.videoId, reportType: reportData.reportType }),
        success: true,
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error creating video report:", error);
      res.status(500).json({ message: "Failed to create video report" });
    }
  });

  // Admin routes for video reports
  app.get("/api/admin/reports", async (req, res) => {
    try {
      const reports = await storage.getAllVideoReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/admin/reports/:reportId/approve", async (req, res) => {
    try {
      const { reportId } = req.params;
      await storage.updateVideoReportStatus(reportId, "approved", req.user?.id || 'admin');
      
      // Log admin action
      await storage.logSecurityEvent({
        userId: req.user?.id || 'admin',
        action: 'approve_report',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: JSON.stringify({ reportId }),
        success: true,
      });
      
      res.json({ message: "Report approved successfully" });
    } catch (error) {
      console.error("Error approving report:", error);
      res.status(500).json({ message: "Failed to approve report" });
    }
  });

  app.post("/api/admin/reports/:reportId/reject", async (req, res) => {
    try {
      const { reportId } = req.params;
      await storage.updateVideoReportStatus(reportId, "rejected", req.user?.id || 'admin');
      
      // Log admin action
      await storage.logSecurityEvent({
        userId: req.user?.id || 'admin',
        action: 'reject_report',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: JSON.stringify({ reportId }),
        success: true,
      });
      
      res.json({ message: "Report rejected successfully" });
    } catch (error) {
      console.error("Error rejecting report:", error);
      res.status(500).json({ message: "Failed to reject report" });
    }
  });

  // Customer retention admin routes
  app.get("/api/admin/downgraded-creators", requireSimpleAdminAuth, async (req, res) => {
    try {
      const downgradedCreators = await storage.getDowngradedProCreators();
      res.json(downgradedCreators);
    } catch (error) {
      console.error("Error fetching downgraded creators:", error);
      res.status(500).json({ message: "Failed to fetch downgraded creators" });
    }
  });

  app.post("/api/admin/reactivate-creator/:userId", requireSimpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const { tier } = req.body;
      
      const user = await storage.reactivateProCreator(userId, tier);
      
      // Log admin action
      await storage.logSecurityEvent({
        userId: 'admin',
        action: 'reactivate_pro_creator',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: JSON.stringify({ targetUserId: userId, tier }),
        success: true,
      });
      
      res.json({ message: "Creator reactivated successfully", user });
    } catch (error) {
      console.error("Error reactivating creator:", error);
      res.status(500).json({ message: "Failed to reactivate creator" });
    }
  });

  app.post("/api/admin/downgrade-creator/:userId", requireSimpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const user = await storage.downgradeProCreator(userId, reason || 'admin_downgrade');
      
      // Log admin action
      await storage.logSecurityEvent({
        userId: 'admin',
        action: 'downgrade_pro_creator',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: JSON.stringify({ targetUserId: userId, reason }),
        success: true,
      });
      
      res.json({ message: "Creator downgraded successfully", user });
    } catch (error) {
      console.error("Error downgrading creator:", error);
      res.status(500).json({ message: "Failed to downgrade creator" });
    }
  });

  // Customer retention webhook for subscription failures
  app.post("/api/webhook/subscription-failed", async (req, res) => {
    try {
      const { userId, reason } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      // Downgrade instead of canceling
      await storage.downgradeProCreator(userId, reason || 'payment_failed');
      
      // Track reactivation attempt
      await storage.updateReactivationAttempt(userId);
      
      console.log(`💡 Customer retention: Downgraded ${userId} to free tier instead of canceling`);
      res.json({ message: "User downgraded to free tier for retention" });
    } catch (error) {
      console.error("Error handling subscription failure:", error);
      res.status(500).json({ message: "Failed to handle subscription failure" });
    }
  });

  // Initialize categories and subcategories
  app.post('/api/setup', async (req, res) => {
    try {
      const categoriesData = [
        { name: 'Art', slug: 'art', description: 'Creative arts and visual content' },
        { name: 'Fitness', slug: 'fitness', description: 'Health and fitness content' },
        { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Business and startup content' },
        { name: 'Beauty', slug: 'beauty', description: 'Beauty and cosmetics content' },
        { name: 'Construction', slug: 'construction', description: 'Construction and building content' },
        { name: 'Music', slug: 'music', description: 'Music and audio content' },
        { name: 'Film & Media', slug: 'film-media', description: 'Film and media production content' },
        { name: 'Food', slug: 'food', description: 'Cooking and food content' },
        { name: 'Sports', slug: 'sports', description: 'Sports and athletics content' },
        { name: 'Dating & Lifestyle', slug: 'dating-lifestyle', description: 'Dating and lifestyle content' },
        { name: 'Tech & Programming', slug: 'tech-programming', description: 'Technology and programming content' },
        { name: 'Finance & Investing', slug: 'finance-investing', description: 'Finance and investment content' },
        { name: 'Marketing & Sales', slug: 'marketing-sales', description: 'Marketing and sales content' },
        { name: 'Health & Wellness', slug: 'health-wellness', description: 'Health and wellness content' },
        { name: 'Photography & Content Creation', slug: 'photography-content', description: 'Photography and content creation' },
        { name: 'Fashion & Style', slug: 'fashion-style', description: 'Fashion and style content' },
        { name: 'Parenting & Relationships', slug: 'parenting-relationships', description: 'Parenting and relationship content' },
        { name: 'Home & DIY', slug: 'home-diy', description: 'Home improvement and DIY content' },
        { name: 'Gaming & Esports', slug: 'gaming-esports', description: 'Gaming and esports content' },
        { name: 'Language & Culture', slug: 'language-culture', description: 'Language and cultural content' },
        { name: 'Spirituality & Mindset', slug: 'spirituality-mindset', description: 'Spirituality and mindset content' },
        { name: 'Automotive & Mechanics', slug: 'automotive-mechanics', description: 'Automotive and mechanics content' },
        { name: 'Pets & Animal Care', slug: 'pets-animal-care', description: 'Pet care and animal content' },
        { name: 'Event Planning & Hospitality', slug: 'event-planning-hospitality', description: 'Event planning and hospitality content' },
        { name: 'Voice & Communication', slug: 'voice-communication', description: 'Voice and communication skills' },
        { name: 'Career & Job Skills', slug: 'career-job-skills', description: 'Career development and job skills' },
        { name: 'Travel & Expat Life', slug: 'travel-expat-life', description: 'Travel and expat lifestyle content' },
        { name: 'Sales & Negotiation', slug: 'sales-negotiation', description: 'Sales and negotiation skills' },
        { name: 'AI & Automation', slug: 'ai-automation', description: 'AI and automation content' },
        { name: 'Education for Creators', slug: 'education-creators', description: 'Educational content for creators' },
      ];

      const subcategoriesData = [
        // Art
        { name: 'Tattooing', slug: 'tattooing', categorySlug: 'art' },
        { name: 'Digital Art', slug: 'digital-art', categorySlug: 'art' },
        { name: 'Painting', slug: 'painting', categorySlug: 'art' },
        // Fitness
        { name: 'Weightlifting', slug: 'weightlifting', categorySlug: 'fitness' },
        { name: 'Yoga', slug: 'yoga', categorySlug: 'fitness' },
        { name: 'Martial Arts', slug: 'martial-arts', categorySlug: 'fitness' },
        // Entrepreneurship
        { name: 'Real Estate', slug: 'real-estate', categorySlug: 'entrepreneurship' },
        { name: 'E-commerce', slug: 'ecommerce', categorySlug: 'entrepreneurship' },
        { name: 'Branding', slug: 'branding', categorySlug: 'entrepreneurship' },
        // Beauty
        { name: 'Skincare', slug: 'skincare', categorySlug: 'beauty' },
        { name: 'Makeup', slug: 'makeup', categorySlug: 'beauty' },
        { name: 'Hair Tutorials', slug: 'hair-tutorials', categorySlug: 'beauty' },
        // Construction
        { name: 'Plumbing', slug: 'plumbing', categorySlug: 'construction' },
        { name: 'Electrical', slug: 'electrical', categorySlug: 'construction' },
        { name: 'Carpentry', slug: 'carpentry', categorySlug: 'construction' },
        // Music
        { name: 'Singing', slug: 'singing', categorySlug: 'music' },
        { name: 'DJ Sets', slug: 'dj-sets', categorySlug: 'music' },
        { name: 'Instrument Lessons', slug: 'instrument-lessons', categorySlug: 'music' },
        // Film & Media
        { name: 'Acting', slug: 'acting', categorySlug: 'film-media' },
        { name: 'Directing', slug: 'directing', categorySlug: 'film-media' },
        { name: 'VFX Editing', slug: 'vfx-editing', categorySlug: 'film-media' },
        // Food
        { name: 'Cooking', slug: 'cooking', categorySlug: 'food' },
        { name: 'Baking', slug: 'baking', categorySlug: 'food' },
        { name: 'Food Reviews', slug: 'food-reviews', categorySlug: 'food' },
        // Sports
        { name: 'Basketball', slug: 'basketball', categorySlug: 'sports' },
        { name: 'Football', slug: 'football', categorySlug: 'sports' },
        { name: 'Skateboarding', slug: 'skateboarding', categorySlug: 'sports' },
        // Dating & Lifestyle
        { name: 'Dating Tips', slug: 'dating-tips', categorySlug: 'dating-lifestyle' },
        { name: 'Self-Improvement', slug: 'self-improvement', categorySlug: 'dating-lifestyle' },
        { name: 'Travel Vlogs', slug: 'travel-vlogs', categorySlug: 'dating-lifestyle' },
      ];

      // Create categories
      for (const categoryData of categoriesData) {
        try {
          await storage.createCategory(categoryData);
        } catch (error) {
          // Category might already exist
        }
      }

      // Create subcategories
      for (const subcategoryData of subcategoriesData) {
        try {
          const category = await storage.getCategoryBySlug(subcategoryData.categorySlug);
          if (category) {
            await storage.createSubcategory({
              name: subcategoryData.name,
              slug: subcategoryData.slug,
              categoryId: category.id,
            });
          }
        } catch (error) {
          // Subcategory might already exist
        }
      }

      res.json({ message: 'Setup complete' });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({ message: 'Setup failed' });
    }
  });

  // LearnTube Admin Routes - YouTube Content Management
  app.get('/api/admin/learntube/videos', requireAdminAuth, async (req, res) => {
    try {
      const videos = await storage.getVideosBySource('learntube');
      res.json(videos);
    } catch (error) {
      console.error('Error fetching LearnTube videos:', error);
      res.status(500).json({ message: 'Failed to fetch LearnTube videos' });
    }
  });

  app.post('/api/admin/learntube/add', requireAdminAuth, async (req, res) => {
    try {
      const { title, description, youtubeId, categoryId, durationMinutes, thumbnailUrl } = req.body;
      
      if (!title || !youtubeId || !categoryId) {
        return res.status(400).json({ message: 'Title, YouTube ID, and category are required' });
      }

      const video = await storage.createLearnTubeVideo({
        title,
        description: description || '',
        videoUrl: `https://www.youtube.com/embed/${youtubeId}`, // Clean embed URL for compatibility
        thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        youtubeId,
        categoryId: parseInt(categoryId),
        durationMinutes: durationMinutes || 0,
        videoPath: `https://youtube.com/watch?v=${youtubeId}`, // External link
        filePath: `https://youtube.com/watch?v=${youtubeId}`, // External link
      });

      res.json({ success: true, video });
    } catch (error) {
      console.error('Error adding LearnTube video:', error);
      res.status(500).json({ message: 'Failed to add LearnTube video' });
    }
  });

  app.delete('/api/admin/learntube/delete/:id', requireAdminAuth, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      await storage.deleteVideo(videoId);
      res.json({ success: true, message: 'LearnTube video deleted successfully' });
    } catch (error) {
      console.error('Error deleting LearnTube video:', error);
      res.status(500).json({ message: 'Failed to delete LearnTube video' });
    }
  });

  app.delete('/api/admin/learntube/bulk-delete', requireAdminAuth, async (req, res) => {
    try {
      const { confirmation } = req.body;
      
      if (confirmation !== 'DELETE') {
        return res.status(400).json({ 
          message: 'Invalid confirmation. You must type "DELETE" to confirm bulk deletion.' 
        });
      }
      
      console.log('🗑️ Admin initiating bulk deletion of all LearnTube videos...');
      
      // Get count before deletion for logging
      const beforeCount = await storage.getLearnTubeVideoCount();
      
      // Delete all LearnTube videos
      const deletedCount = await storage.deleteAllLearnTubeVideos();
      
      console.log(`✅ Bulk deleted ${deletedCount} LearnTube videos (was ${beforeCount} total)`);
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deletedCount} LearnTube videos`,
        deletedCount 
      });
    } catch (error) {
      console.error('❌ Error during bulk deletion:', error);
      res.status(500).json({ message: 'Failed to delete LearnTube videos' });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  });

  // Subcategory routes
  app.get('/api/subcategories', async (req, res) => {
    try {
      const subcategories = await storage.getSubcategories();
      res.json(subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ message: 'Failed to fetch subcategories' });
    }
  });

  app.get('/api/categories/:categoryId/subcategories', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const subcategories = await storage.getSubcategoriesByCategory(categoryId);
      res.json(subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ message: 'Failed to fetch subcategories' });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await storage.getViralFeed();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching viral feed:', error);
      res.status(500).json({ message: 'Failed to fetch viral feed' });
    }
  });

  app.get('/api/videos/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const videos = await storage.searchVideos(query);
      res.json(videos);
    } catch (error) {
      console.error('Error searching videos:', error);
      res.status(500).json({ message: 'Failed to search videos' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const videos = await storage.searchVideos(query);
      res.json(videos);
    } catch (error) {
      console.error('Error searching videos:', error);
      res.status(500).json({ message: 'Failed to search videos' });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ message: 'Failed to fetch video' });
    }
  });

  app.get('/api/videos/:id/purchased', async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      // If not authenticated, user hasn't purchased anything
      if (!req.isAuthenticated() || !req.user) {
        return res.json({ purchased: false });
      }
      
      const userId = req.user.claims.sub;
      const hasPurchased = await storage.hasUserPurchasedCourse(userId, videoId);
      res.json({ purchased: hasPurchased });
    } catch (error) {
      console.error('Error checking purchase status:', error);
      res.status(500).json({ message: 'Failed to check purchase status' });
    }
  });

  app.post('/api/videos/:id/view', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementVideoViews(id);
      
      // Track ad impressions for non-premium viewers
      if (req.isAuthenticated() && req.user) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user?.isPremiumViewer) {
          // Track ad impression and revenue for creators
          const video = await storage.getVideo(id);
          if (video) {
            await storage.trackAdImpression(video.creatorId, id, 500); // $5 CPM
          }
        }
      }
      
      res.json({ message: 'View counted' });
    } catch (error) {
      console.error('Error incrementing views:', error);
      res.status(500).json({ message: 'Failed to increment views' });
    }
  });

  app.get('/api/categories/:categoryId/videos', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const videos = await storage.getVideosByCategory(categoryId);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });

  app.get('/api/subcategories/:subcategoryId/videos', async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      const videos = await storage.getVideosBySubcategory(subcategoryId);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos by subcategory:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });

  // Creator routes
  app.get('/api/creator/videos', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const videos = await storage.getVideosByCreator(creatorId);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching creator videos:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });

  // Get creator video hours quota status
  app.get('/api/creator/video-hours', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const user = await storage.getUser(creatorId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const currentHours = user.currentVideoHours || 0;
      const hourLimit = user.videoHourLimit || 5;
      const remainingHours = Math.max(0, hourLimit - currentHours);
      const usagePercentage = (currentHours / hourLimit) * 100;
      
      res.json({
        currentHours: Math.round(currentHours * 100) / 100, // Round to 2 decimal places
        hourLimit,
        remainingHours: Math.round(remainingHours * 100) / 100,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        tierName: user.proCreatorTier || 'free',
        canUpgrade: hourLimit <= 5, // Free creators can upgrade
        nearLimit: usagePercentage > 80 // Warning when 80% full
      });
    } catch (error) {
      console.error('Error fetching video hours status:', error);
      res.status(500).json({ message: 'Failed to fetch video hours status' });
    }
  });

  app.post('/api/creator/videos', isAuthenticated, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.video || !files.video[0]) {
        return res.status(400).json({ message: 'Video file is required' });
      }

      // Check video content hour limits before processing
      const user = await storage.getUser(creatorId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const videoDurationMinutes = req.body.durationMinutes ? parseInt(req.body.durationMinutes) : 0;
      const videoDurationHours = videoDurationMinutes / 60;
      const currentHours = user.currentVideoHours || 0;
      const hourLimit = user.videoHourLimit || 5; // Default to 5 hours for free creators
      
      // Check if this upload would exceed the hour limit
      if (currentHours + videoDurationHours > hourLimit) {
        const remainingHours = Math.max(0, hourLimit - currentHours);
        const remainingMinutes = Math.floor(remainingHours * 60);
        
        return res.status(403).json({ 
          message: `Upload blocked: This video would exceed your ${hourLimit}-hour content limit. You have ${remainingMinutes} minutes remaining.`,
          error: 'CONTENT_LIMIT_EXCEEDED',
          currentHours: currentHours,
          hourLimit: hourLimit,
          remainingHours: remainingHours,
          videoHours: videoDurationHours,
          upgradeRequired: hourLimit <= 5 // Suggest upgrade for free creators
        });
      }

      let tags = [];
      try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      } catch (e) {
        // If parsing fails, treat as empty array
        tags = [];
      }

      // Anyone can sell courses now
      const isCourse = req.body.isCourse === 'true';
      const coursePrice = parseInt(req.body.coursePrice) || 0;

      const videoData = {
        title: req.body.title,
        description: req.body.description,
        videoUrl: `/uploads/${files.video[0].filename}`,
        thumbnailUrl: files.thumbnail ? `/uploads/${files.thumbnail[0].filename}` : null,
        duration: req.body.duration,
        durationMinutes: req.body.durationMinutes ? parseInt(req.body.durationMinutes) : 0,
        categoryId: parseInt(req.body.categoryId),
        subcategoryId: parseInt(req.body.subcategoryId),
        creatorId,
        // YouTube-style: All videos are free, but Pro Creators can add course upsells
        isCourse: isCourse,
        coursePrice: coursePrice,
        courseDescription: req.body.courseDescription || null,
        offersPremiumDiscount: req.body.offersPremiumDiscount === 'true',
        tags,
        language: req.body.language || 'en',
        isPublished: req.body.isPublished === 'true',
        offerFreePreview: req.body.offerFreePreview === 'true',
      };

      const validation = insertVideoSchema.safeParse(videoData);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid video data', errors: validation.error.errors });
      }

      const video = await storage.createVideo(validation.data);
      
      // Update user's current video hours after successful upload
      await storage.updateUserVideoHours(creatorId, videoDurationHours);
      
      res.status(201).json(video);
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ message: 'Failed to create video' });
    }
  });

  app.put('/api/creator/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      // Check if video belongs to creator
      const existingVideo = await storage.getVideo(videoId);
      if (!existingVideo || existingVideo.creatorId !== creatorId) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const updateData = {
        id: videoId,
        ...req.body,
      };

      const validation = updateVideoSchema.safeParse(updateData);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid video data', errors: validation.error.errors });
      }

      const video = await storage.updateVideo(validation.data);
      res.json(video);
    } catch (error) {
      console.error('Error updating video:', error);
      res.status(500).json({ message: 'Failed to update video' });
    }
  });

  // Add video to streaming endpoint - future Netflix-style section
  app.post('/api/videos/:id/add-to-streaming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      // Check if user owns this video
      const video = await storage.getVideo(videoId);
      if (!video || video.creatorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized - You can only add your own videos to streaming' });
      }
      
      if (video.isAddedToStreaming) {
        return res.status(400).json({ message: 'Video is already added to streaming' });
      }
      
      // Add to streaming
      const updatedVideo = await storage.addVideoToStreaming(videoId);
      
      res.json({ 
        message: 'Video successfully added to streaming! This will appear in our future Netflix-style section for additional revenue.',
        video: updatedVideo 
      });
    } catch (error) {
      console.error('Error adding video to streaming:', error);
      res.status(500).json({ message: 'Failed to add video to streaming' });
    }
  });

  app.delete('/api/creator/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      // Check if video belongs to creator
      const existingVideo = await storage.getVideo(videoId);
      if (!existingVideo || existingVideo.creatorId !== creatorId) {
        return res.status(404).json({ message: 'Video not found' });
      }

      // Calculate hours to subtract from user's quota
      const videoDurationHours = (existingVideo.durationMinutes || 0) / 60;
      
      await storage.deleteVideo(videoId);
      
      // Free up the video hours quota
      await storage.updateUserVideoHours(creatorId, -videoDurationHours);
      
      res.json({ message: 'Video deleted' });
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ message: 'Failed to delete video' });
    }
  });

  // Enhanced video routes
  app.get('/api/trending', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const videos = await storage.getTrendingVideos(limit);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      res.status(500).json({ message: 'Failed to fetch trending videos' });
    }
  });

  app.get('/api/recommended', async (req, res) => {
    try {
      // Return trending videos as recommendations (no authentication needed)
      const limit = parseInt(req.query.limit as string) || 20;
      const trendingVideos = await storage.getTrendingVideos(limit);
      res.json(trendingVideos);
    } catch (error) {
      console.error('Error fetching recommended videos:', error);
      res.status(500).json({ message: 'Failed to fetch recommended videos' });
    }
  });

  // Favorites routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.body;
      const userId = req.user.claims.sub;
      
      if (!videoId) {
        return res.status(400).json({ message: 'Video ID is required' });
      }
      
      const favorite = await storage.addToFavorites(userId, videoId);
      res.json(favorite);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({ message: 'Failed to add to favorites' });
    }
  });

  app.delete('/api/favorites/:videoId', isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.removeFromFavorites(userId, parseInt(videoId));
      res.json({ message: 'Removed from favorites successfully' });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({ message: 'Failed to remove from favorites' });
    }
  });

  app.get('/api/favorites', async (req, res) => {
    try {
      // Return empty array for now (no authentication)
      res.json([]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  app.get('/api/favorites/:videoId', isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user.claims.sub;
      const isFavorited = await storage.isFavorited(userId, parseInt(videoId));
      res.json({ isFavorited });
    } catch (error) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({ message: 'Failed to check favorite status' });
    }
  });

  // Share video routes
  app.post('/api/share', isAuthenticated, async (req: any, res) => {
    try {
      const { videoId, recipientEmail, message } = req.body;
      const userId = req.user.claims.sub;
      
      if (!videoId) {
        return res.status(400).json({ message: 'Video ID is required' });
      }
      
      const sharedVideo = await storage.shareVideo(userId, videoId, recipientEmail, message);
      res.json(sharedVideo);
    } catch (error) {
      console.error('Error sharing video:', error);
      res.status(500).json({ message: 'Failed to share video' });
    }
  });

  app.get('/api/shared', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sharedVideos = await storage.getSharedVideos(userId);
      res.json(sharedVideos);
    } catch (error) {
      console.error('Error fetching shared videos:', error);
      res.status(500).json({ message: 'Failed to fetch shared videos' });
    }
  });

  app.get('/api/shared/:shareToken', async (req, res) => {
    try {
      const { shareToken } = req.params;
      const sharedVideo = await storage.getSharedVideoByToken(shareToken);
      
      if (!sharedVideo) {
        return res.status(404).json({ message: 'Shared video not found' });
      }
      
      res.json(sharedVideo);
    } catch (error) {
      console.error('Error fetching shared video:', error);
      res.status(500).json({ message: 'Failed to fetch shared video' });
    }
  });

  // Video like routes
  app.post('/api/videos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      const like = await storage.likeVideo(userId, videoId);
      res.json(like);
    } catch (error) {
      console.error('Error liking video:', error);
      res.status(500).json({ message: 'Failed to like video' });
    }
  });

  // YouTube-style share tracking
  app.post('/api/videos/:id/share', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      await storage.incrementVideoShares(videoId);
      res.json({ message: 'Share recorded' });
    } catch (error) {
      console.error('Error recording share:', error);
      res.status(500).json({ message: 'Failed to record share' });
    }
  });

  // Course purchase with premium viewer discount
  app.post('/api/videos/:id/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      const user = await storage.getUser(userId);
      const video = await storage.getVideo(videoId);
      
      if (!video?.isCourse) {
        return res.status(400).json({ message: 'This video is not a course' });
      }
      
      // Apply creator-controlled discount for premium members
      let finalPrice = video.coursePrice;
      let discountApplied = 0;
      
      if (user?.isPremiumViewer && video.offersPremiumDiscount) {
        // 10% discount when creator chooses to offer it
        discountApplied = Math.round(finalPrice * 0.1);
        finalPrice = finalPrice - discountApplied;
      }
      
      // Create Stripe checkout session
      const checkoutSession = await storage.createCourseCheckout(userId, videoId, finalPrice);
      res.json({ checkoutUrl: checkoutSession.url });
    } catch (error) {
      console.error('Error creating course purchase:', error);
      res.status(500).json({ message: 'Failed to create purchase' });
    }
  });

  app.delete('/api/videos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      await storage.unlikeVideo(userId, videoId);
      res.json({ message: 'Like removed' });
    } catch (error) {
      console.error('Error unliking video:', error);
      res.status(500).json({ message: 'Failed to unlike video' });
    }
  });

  app.post('/api/videos/:id/dislike', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      const dislike = await storage.dislikeVideo(userId, videoId);
      res.json(dislike);
    } catch (error) {
      console.error('Error disliking video:', error);
      res.status(500).json({ message: 'Failed to dislike video' });
    }
  });

  app.delete('/api/videos/:id/dislike', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      await storage.undislikeVideo(userId, videoId);
      res.json({ message: 'Dislike removed' });
    } catch (error) {
      console.error('Error removing dislike:', error);
      res.status(500).json({ message: 'Failed to remove dislike' });
    }
  });

  app.get('/api/videos/:id/like-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      const likeStatus = await storage.getVideoLikeStatus(userId, videoId);
      const counts = await storage.getVideoLikeCounts(videoId);
      
      res.json({
        userLike: likeStatus?.isLike,
        userDislike: likeStatus && !likeStatus.isLike,
        ...counts
      });
    } catch (error) {
      console.error('Error getting like status:', error);
      res.status(500).json({ message: 'Failed to get like status' });
    }
  });

  // Comment routes
  app.get('/api/videos/:id/comments', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const comments = await storage.getComments(videoId);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  });

  app.post('/api/videos/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      const { content, parentId } = req.body;
      
      const comment = await storage.createComment({
        videoId,
        userId,
        content,
        parentId: parentId || null,
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  app.get('/api/comments/:id/replies', async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const replies = await storage.getCommentReplies(parentId);
      res.json(replies);
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(500).json({ message: 'Failed to fetch replies' });
    }
  });

  // Watch history routes
  app.post('/api/watch-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { videoId, watchTime } = req.body;
      
      const watchEntry = await storage.addToWatchHistory(userId, videoId, watchTime);
      res.json(watchEntry);
    } catch (error) {
      console.error('Error adding to watch history:', error);
      res.status(500).json({ message: 'Failed to add to watch history' });
    }
  });

  app.get('/api/watch-history', async (req, res) => {
    try {
      // Return empty array for now (no authentication)
      res.json([]);
    } catch (error) {
      console.error('Error fetching watch history:', error);
      res.status(500).json({ message: 'Failed to fetch watch history' });
    }
  });

  // Channel management routes
  app.put('/api/channel/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { channelName, channelDescription } = req.body;
      
      const updatedUser = await storage.updateUserChannel(userId, {
        channelName,
        channelDescription,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating channel:', error);
      res.status(500).json({ message: 'Failed to update channel' });
    }
  });

  // Creator-specific routes
  app.get('/api/creator/videos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getVideosByCreator(userId);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching creator videos:', error);
      res.status(500).json({ message: 'Failed to fetch creator videos' });
    }
  });

  app.post('/api/creator/videos', isAuthenticated, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.files?.video?.[0]) {
        return res.status(400).json({ message: 'Video file is required' });
      }

      const videoFile = req.files.video[0];
      const thumbnailFile = req.files?.thumbnail?.[0];
      
      const videoData = {
        ...req.body,
        creatorId: userId,
        videoUrl: `/uploads/${videoFile.filename}`,
        thumbnailUrl: thumbnailFile ? `/uploads/${thumbnailFile.filename}` : null,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        views: 0,
        likes: 0,
        dislikes: 0,
        uploadedAt: new Date(),
      };

      // Validate using schema
      const validatedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(validatedData);
      
      res.json(video);
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ message: 'Failed to upload video' });
    }
  });

  app.delete('/api/creator/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      // Verify the video belongs to this creator
      const video = await storage.getVideo(videoId);
      if (!video || video.creatorId !== userId) {
        return res.status(404).json({ message: 'Video not found or unauthorized' });
      }
      
      await storage.deleteVideo(videoId);
      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ message: 'Failed to delete video' });
    }
  });

  // Creator Analytics
  app.get('/api/creator/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getVideosByCreator(userId);
      
      const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
      const hoursWatched = Math.round(totalViews * 0.75); // Estimate based on average watch time
      
      const analytics = {
        totalViews,
        hoursWatched,
        avgWatchTime: "45 minutes", // This would come from detailed analytics
        deviceTypes: [
          { device: "Desktop", percentage: 65 },
          { device: "Mobile", percentage: 30 },
          { device: "Tablet", percentage: 5 }
        ],
        topCountries: ["United States", "Canada", "United Kingdom", "Australia"],
        coursePerformance: videos.map(video => ({
          id: video.id,
          title: video.title,
          views: video.views || 0,
          watchTime: Math.round((video.views || 0) * 0.75),
          sales: video.price || 0,
          earnings: ((video.price || 0) * 0.8) // 80% revenue share
        }))
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Creator Earnings
  app.get('/api/creator/earnings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const totalEarnings = await storage.getCreatorEarnings(userId);
      
      const earnings = {
        thisMonth: Math.round(totalEarnings * 0.6), // Simulate current month earnings
        lastPayout: { 
          date: "2025-01-01", 
          amount: Math.round(totalEarnings * 0.4) 
        },
        nextPayout: "2025-02-01",
        totalEarnings: totalEarnings
      };
      
      res.json(earnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      res.status(500).json({ message: 'Failed to fetch earnings' });
    }
  });

  // Creator Payout History
  app.get('/api/creator/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Mock payout history - in production, this would come from a payouts table
      const payoutHistory = [
        { 
          date: "2025-01-01", 
          grossSales: 3400, 
          creatorShare: 2720, 
          method: "Stripe", 
          status: "Paid" 
        },
        { 
          date: "2024-12-01", 
          grossSales: 1400, 
          creatorShare: 1120, 
          method: "PayPal", 
          status: "Paid" 
        },
        { 
          date: "2024-11-01", 
          grossSales: 2100, 
          creatorShare: 1680, 
          method: "Stripe", 
          status: "Paid" 
        }
      ];
      
      res.json(payoutHistory);
    } catch (error) {
      console.error('Error fetching payout history:', error);
      res.status(500).json({ message: 'Failed to fetch payout history' });
    }
  });

  // PayPal Integration Routes
  app.get('/api/paypal/setup', async (req, res) => {
    try {
      // This would implement PayPal client token generation
      // For now, return a mock response
      res.json({
        clientToken: "sandbox_paypal_client_token",
        message: "PayPal setup ready"
      });
    } catch (error) {
      console.error('Error setting up PayPal:', error);
      res.status(500).json({ message: 'Failed to setup PayPal' });
    }
  });

  app.post('/api/creator/paypal/connect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paypalEmail } = req.body;
      
      if (!paypalEmail) {
        return res.status(400).json({ message: 'PayPal email is required' });
      }
      
      // In production, this would store the PayPal email and validate it
      // For now, just simulate the connection
      res.json({ 
        message: 'PayPal account connected successfully',
        paypalEmail 
      });
    } catch (error) {
      console.error('Error connecting PayPal:', error);
      res.status(500).json({ message: 'Failed to connect PayPal account' });
    }
  });

  // Create a pre-application (no auth required)
  app.post("/api/pre-applications", async (req, res) => {
    try {
      // For now, we'll store this in the same table but mark it differently
      // In production, you might want a separate table or email these to support@proflix.app
      const preApplication = {
        userId: "guest", // No user ID for public applications
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone || null,
        country: "Unknown", // Default value
        socialLinks: req.body.socialHandles || null,
        courseTitle: req.body.contentType || "General Content", // Map content type to course title
        professionalBackground: req.body.whyJoin || "Not provided",
        hasSoldCourses: req.body.sellingElsewhere || false,
        previousSales: req.body.sellingWhere || null,
        priceRange: "under_100" as const, // Default value
        contentReadiness: "not_ready" as const, // Default value  
        whyTopCreator: req.body.additionalInfo || "Pre-application submission",
        hasAudience: false, // Default value
        audienceDetails: req.body.socialHandles || null,
        freePreview: "maybe" as const, // Default value
        supportNeeds: req.body.specialRequests || null,
        agreedToTerms: true, // Auto-agree for pre-applications
        agreedToRevenue: true, // Auto-agree for pre-applications
        agreedToContent: true, // Auto-agree for pre-applications
        signatureName: req.body.fullName,
        status: "pre-application", // Mark as pre-application
      };

      const application = await storage.createCreatorApplication(preApplication);
      
      // TODO: In production, also email this to support@proflix.app
      // await sendEmail(process.env.SENDGRID_API_KEY, {
      //   to: "support@proflix.app",
      //   from: "noreply@proflix.app",
      //   subject: "New ProFlix Creator Pre-Application",
      //   html: `<p>New creator application from ${preApplication.fullName} (${preApplication.email})</p>`
      // });

      res.json({ message: "Pre-application submitted successfully" });
    } catch (error: any) {
      console.error("Pre-application error:", error);
      res.status(500).json({ message: "Error submitting pre-application: " + error.message });
    }
  });

  // Creator Dashboard Routes for 3-Tier System
  app.get('/api/creator/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getCreatorStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      res.status(500).json({ message: "Failed to fetch creator stats" });
    }
  });

  app.post('/api/creator/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountType } = req.body;
      
      if (!['pro', 'streaming'].includes(accountType)) {
        return res.status(400).json({ message: "Invalid account type" });
      }

      const user = await storage.upgradeCreatorAccount(userId, accountType);
      res.json(user);
    } catch (error) {
      console.error("Error upgrading account:", error);
      res.status(500).json({ message: "Failed to upgrade account" });
    }
  });

  app.post('/api/creator/payment-urls', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paypalUrl, stripeUrl } = req.body;
      
      const user = await storage.updateCreatorPaymentUrls(userId, paypalUrl, stripeUrl);
      res.json(user);
    } catch (error) {
      console.error("Error updating payment URLs:", error);
      res.status(500).json({ message: "Failed to update payment URLs" });
    }
  });

  // Streaming subscription endpoints
  app.post('/api/subscribe/streaming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mark as subscribed with 1-month free trial
      const trialEnd = new Date();
      trialEnd.setMonth(trialEnd.getMonth() + 1);

      const user = await storage.upsertUser({
        id: userId,
        isStreamingSubscriber: true,
        streamingTrialEndsAt: trialEnd,
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("Error subscribing to streaming:", error);
      res.status(500).json({ message: "Failed to subscribe to streaming" });
    }
  });

  // LearnTube API routes - YouTube content management
  app.get('/api/learntube/videos', async (req, res) => {
    try {
      const videos = await storage.getLearnTubeVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching LearnTube videos:', error);
      res.status(500).json({ message: 'Failed to fetch LearnTube videos' });
    }
  });

  // Alternative route for frontend compatibility
  app.get('/api/videos/learntube', async (req, res) => {
    try {
      const videos = await storage.getLearnTubeVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching LearnTube videos:', error);
      res.status(500).json({ message: 'Failed to fetch LearnTube videos' });
    }
  });

  app.post('/api/learntube/videos', requireAdminAuth, async (req, res) => {
    try {
      const videoData = {
        ...req.body,
        youtubeId: req.body.youtubeId,
        categoryId: parseInt(req.body.categoryId),
        subcategoryId: parseInt(req.body.subcategoryId),
        durationMinutes: parseInt(req.body.durationMinutes) || 0,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
      };
      
      const video = await storage.createLearnTubeVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error('Error creating LearnTube video:', error);
      res.status(500).json({ message: 'Failed to create LearnTube video' });
    }
  });

  app.delete('/api/learntube/videos/all', requireAdminAuth, async (req, res) => {
    try {
      const result = await storage.bulkDeleteLearnTubeContent();
      res.json(result);
    } catch (error) {
      console.error('Error deleting all LearnTube content:', error);
      res.status(500).json({ message: 'Failed to delete LearnTube content' });
    }
  });

  // Add YouTube video via embed code (ADMIN-ONLY TEMPORARY SYSTEM)
  app.post('/api/admin/learntube/add-embed', requireAdminAuth, async (req, res) => {
    try {
      const { embedCode, categoryId, customTitle } = req.body;
      
      console.log('⚠️ ADMIN-ONLY LearnTube: Adding temporary YouTube content that generates no revenue');
      
      if (!embedCode || !categoryId) {
        return res.status(400).json({ 
          message: 'Embed code and category are required' 
        });
      }
      
      // Extract video ID from embed code
      const srcMatch = embedCode.match(/src="https:\/\/www\.youtube\.com\/embed\/([^"?]+)/);
      if (!srcMatch) {
        return res.status(400).json({ 
          message: 'Invalid YouTube embed code. Please use the embed code from YouTube.' 
        });
      }
      
      const videoId = srcMatch[1];
      
      console.log(`🎬 Embed code request: { embedCode: "${embedCode.substring(0, 100)}...", categoryId: ${categoryId} }`);
      console.log(`✅ Extracted video ID: ${videoId}`);
      
      // Validate categoryId is a valid number
      const parsedCategoryId = parseInt(categoryId);
      if (isNaN(parsedCategoryId)) {
        return res.status(400).json({ 
          message: 'Invalid category ID. Please select a valid category.' 
        });
      }
      
      // Validate category exists
      const categoryExists = await storage.getCategoryById(parsedCategoryId);
      if (!categoryExists) {
        return res.status(400).json({ 
          message: 'Category not found. Please select a valid category.' 
        });
      }
      
      // Auto-generate video data with better title
      const categoryName = categoryExists.name;
      const finalTitle = customTitle || `${categoryName} Educational Content`;
      const videoData = {
        youtubeId: videoId,
        title: finalTitle,
        description: `Learn about ${categoryName.toLowerCase()} with this educational video. This is temporary content that will be replaced with original ProFlix videos.`,
        videoUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        categoryId: parsedCategoryId,
        subcategoryId: 992, // Default subcategory
        duration: '0',
        durationMinutes: 0,
        creatorId: 'system',
        source: 'learntube',
        isLearnTube: true,
        isProTube: false,
        canRunAds: false,
        isCourse: false,
        coursePrice: 0,
        courseDescription: null,
        isFreeContent: false,
        offersPremiumDiscount: false,
        shareCount: 0,
        adRevenue: 0,
        adImpressions: 0,
        isDonatedToStreaming: false,
        streamingWatchTime: 0,
        views: 0,
        purchases: 0,
        likes: 0,
        dislikes: 0,
        isPublished: true,
        isFeatured: false,
        offerFreePreview: false,
        tags: null,
        language: 'en',
      };
      
      console.log(`📝 Auto-generating video data from embed code:`, {
        youtubeId: videoId,
        title: videoData.title,
        description: videoData.description,
        categoryId: videoData.categoryId,
        embedUrl: videoData.videoUrl
      });
      
      const video = await storage.createLearnTubeVideo(videoData);
      
      console.log(`✅ YouTube video embedded successfully: ${video.id}`);
      
      res.json({
        success: true,
        video: video
      });
      
    } catch (error) {
      console.error('💥 Error adding YouTube video via embed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      res.status(500).json({ 
        message: 'Failed to add YouTube video via embed code',
        error: error.message 
      });
    }
  });

  app.get('/api/videos/by-source/:source', async (req, res) => {
    try {
      const source = req.params.source as 'proflix' | 'learntube';
      if (!['proflix', 'learntube'].includes(source)) {
        return res.status(400).json({ message: 'Invalid source' });
      }
      
      const videos = await storage.getVideosBySource(source);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos by source:', error);
      res.status(500).json({ message: 'Failed to fetch videos by source' });
    }
  });

  // Pro Creator Code System
  app.post('/api/pro-creator/generate-code', requireAdminAuth, async (req, res) => {
    try {
      console.log('🎫 Admin generating Pro Creator code...');
      const { count = 1, expiresAt } = req.body;
      
      const codes = [];
      for (let i = 0; i < count; i++) {
        const code = await storage.generateProCreatorCode(expiresAt);
        codes.push(code);
      }
      
      if (codes.length === 1) {
        console.log(`✅ Generated Pro Creator code: ${codes[0].code}`);
        res.json(codes[0]);
      } else {
        console.log(`✅ Generated ${codes.length} Pro Creator codes`);
        res.json(codes);
      }
    } catch (error) {
      console.error('❌ Error generating Pro Creator code:', error);
      res.status(500).json({ message: 'Failed to generate Pro Creator code' });
    }
  });

  app.post('/api/pro-creator/use-code', async (req, res) => {
    try {
      const { code, userId } = req.body;
      
      if (!code || !userId) {
        return res.status(400).json({ message: 'Code and user ID are required' });
      }
      
      console.log(`🎫 User ${userId} attempting to use Pro Creator code: ${code}`);
      
      const success = await storage.useProCreatorCode(code, userId);
      
      if (success) {
        console.log(`✅ Pro Creator code used successfully: ${code}`);
        res.json({ 
          success: true, 
          message: 'Pro Creator code applied successfully! You now have 12 months of free Pro Creator access.' 
        });
      } else {
        console.log(`❌ Invalid or expired Pro Creator code: ${code}`);
        res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired Pro Creator code' 
        });
      }
    } catch (error) {
      console.error('❌ Error using Pro Creator code:', error);
      res.status(500).json({ message: 'Failed to use Pro Creator code' });
    }
  });

  app.get('/api/pro-creator/codes', requireAdminAuth, async (req, res) => {
    try {
      const codes = await storage.getAllProCreatorCodes();
      res.json(codes);
    } catch (error) {
      console.error('❌ Error fetching Pro Creator codes:', error);
      res.status(500).json({ message: 'Failed to fetch Pro Creator codes' });
    }
  });

  // Bulk delete LearnTube videos (Admin only)
  app.delete('/api/admin/learntube/bulk-delete', requireAdminAuth, async (req, res) => {
    try {
      const { confirmation } = req.body;
      
      if (confirmation !== 'DELETE') {
        return res.status(400).json({ 
          message: 'Invalid confirmation. You must type "DELETE" to confirm bulk deletion.' 
        });
      }
      
      console.log('🗑️ Admin initiating bulk deletion of all LearnTube videos...');
      
      // Get count before deletion for logging
      const beforeCount = await storage.getLearnTubeVideoCount();
      
      // Delete all LearnTube videos
      const deletedCount = await storage.deleteAllLearnTubeVideos();
      
      console.log(`✅ Bulk deleted ${deletedCount} LearnTube videos (was ${beforeCount} total)`);
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deletedCount} LearnTube videos`,
        deletedCount 
      });
    } catch (error) {
      console.error('❌ Error during bulk deletion:', error);
      res.status(500).json({ message: 'Failed to delete LearnTube videos' });
    }
  });

  // Creator Discovery API endpoints
  app.get('/api/featured-creators', async (req, res) => {
    try {
      const creators = await storage.getFeaturedCreators();
      res.json(creators);
    } catch (error) {
      console.error('Error fetching featured creators:', error);
      res.status(500).json({ message: 'Failed to fetch featured creators' });
    }
  });

  // Subscribe to creator endpoint
  app.post('/api/subscribe-to-creator', isAuthenticated, async (req: any, res) => {
    try {
      const { creatorId, tier = 'free' } = req.body;
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      await storage.subscribeToCreator(userId, creatorId, tier);
      res.json({ message: 'Successfully subscribed to creator' });
    } catch (error) {
      console.error('Error subscribing to creator:', error);
      res.status(500).json({ message: 'Failed to subscribe to creator' });
    }
  });

  // Create viewer account endpoint
  app.post('/api/create-viewer-account', async (req, res) => {
    try {
      const { email, name, tier = 'free', subscribeToCreator } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ message: 'Email and name are required' });
      }

      const viewerAccount = await storage.createViewerAccount({
        email,
        firstName: name,
        tier,
        subscribeToCreator
      });

      res.json({ 
        message: 'Account created successfully', 
        user: viewerAccount 
      });
    } catch (error) {
      console.error('Error creating viewer account:', error);
      res.status(500).json({ message: 'Failed to create viewer account' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
