import { Request, Response, NextFunction } from "express";

// Environment validation
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'STRIPE_SECRET_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Request validation middleware
export function validateVideoUpload(req: Request, res: Response, next: NextFunction) {
  const { title, description, price, categoryId, subcategoryId } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  if (!description || description.trim().length === 0) {
    return res.status(400).json({ message: 'Description is required' });
  }
  
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 10 || priceNum > 1000) {
    return res.status(400).json({ message: 'Price must be between $10 and $1000' });
  }
  
  if (!categoryId || !subcategoryId) {
    return res.status(400).json({ message: 'Category and subcategory are required' });
  }
  
  next();
}

// Rate limiting for API endpoints
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // Basic rate limiting implementation
  const userKey = req.ip || 'unknown';
  const now = Date.now();
  
  // In production, use Redis or similar for distributed rate limiting
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const userRequests = global.rateLimitStore.get(userKey) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < 60000); // 1 minute window
  
  if (recentRequests.length > 100) { // 100 requests per minute
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  
  recentRequests.push(now);
  global.rateLimitStore.set(userKey, recentRequests);
  
  next();
}