import { Request, Response, NextFunction } from "express";

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.paypal.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https://api.stripe.com https://*.paypal.com; " +
    "frame-src https://js.stripe.com https://*.paypal.com;"
  );
  
  next();
}

// File upload security
export function validateFileUpload(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return next();
  }
  
  const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (req.file.fieldname === 'video' && !allowedVideoTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Invalid video file type. Only MP4, MOV, and AVI are allowed.' });
  }
  
  if (req.file.fieldname === 'thumbnail' && !allowedImageTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Invalid image file type. Only JPEG, PNG, and WebP are allowed.' });
  }
  
  // File size limits
  const maxVideoSize = 500 * 1024 * 1024; // 500MB
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  
  if (req.file.fieldname === 'video' && req.file.size > maxVideoSize) {
    return res.status(400).json({ message: 'Video file too large. Maximum size is 500MB.' });
  }
  
  if (req.file.fieldname === 'thumbnail' && req.file.size > maxImageSize) {
    return res.status(400).json({ message: 'Image file too large. Maximum size is 5MB.' });
  }
  
  next();
}