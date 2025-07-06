import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVideoSchema, updateVideoSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

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
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB for videos
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
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

  app.post('/api/videos/:id/view', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementVideoViews(id);
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

      const videoData = {
        title: req.body.title,
        description: req.body.description,
        videoUrl: `/uploads/${files.video[0].filename}`,
        thumbnailUrl: files.thumbnail ? `/uploads/${files.thumbnail[0].filename}` : null,
        duration: req.body.duration,
        categoryId: parseInt(req.body.categoryId),
        subcategoryId: parseInt(req.body.subcategoryId),
        creatorId,
        isPublished: req.body.isPublished === 'true',
      };

      const validation = insertVideoSchema.safeParse(videoData);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid video data', errors: validation.error.errors });
      }

      const video = await storage.createVideo(validation.data);
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

  app.delete('/api/creator/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      // Check if video belongs to creator
      const existingVideo = await storage.getVideo(videoId);
      if (!existingVideo || existingVideo.creatorId !== creatorId) {
        return res.status(404).json({ message: 'Video not found' });
      }

      await storage.deleteVideo(videoId);
      res.json({ message: 'Video deleted' });
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ message: 'Failed to delete video' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
