import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { sql } from 'drizzle-orm';

// Admin session storage
const adminSessions = new Map<string, { userId: string, expiresAt: number }>();

// Rate limiting for admin login attempts
const adminLoginAttempts = new Map<string, { count: number, resetTime: number }>();

// Environment variables for admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ProFlix2025!Admin';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Hash password with salt
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Generate secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify admin credentials
function verifyAdminCredentials(username: string, password: string): boolean {
  const salt = 'proflix-admin-salt-2025';
  const expectedHash = hashPassword(ADMIN_PASSWORD, salt);
  const providedHash = hashPassword(password, salt);
  
  return username === ADMIN_USERNAME && crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(providedHash, 'hex')
  );
}

// Admin authentication middleware
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.cookies?.['admin-session'] || req.headers['x-admin-session'];
  
  if (!sessionToken) {
    return res.status(401).json({ 
      error: 'Admin authentication required',
      redirectTo: '/admin/login' 
    });
  }
  
  const session = adminSessions.get(sessionToken);
  
  if (!session || session.expiresAt < Date.now()) {
    // Clean up expired session
    if (session) {
      adminSessions.delete(sessionToken);
    }
    return res.status(401).json({ 
      error: 'Admin session expired',
      redirectTo: '/admin/login' 
    });
  }
  
  // Extend session by 1 hour
  session.expiresAt = Date.now() + (60 * 60 * 1000);
  
  // Add admin info to request
  (req as any).admin = { userId: session.userId };
  next();
};

// Admin login endpoint
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Rate limiting check
    const clientIp = req.ip || req.connection.remoteAddress;
    const attemptKey = `admin-login-${clientIp}`;
    
    // Simple rate limiting (in production, use Redis or database)
    if (!adminLoginAttempts.has(attemptKey)) {
      adminLoginAttempts.set(attemptKey, { count: 0, resetTime: Date.now() + 900000 }); // 15 minutes
    }
    
    const attempts = adminLoginAttempts.get(attemptKey)!;
    
    if (attempts.count >= 5 && Date.now() < attempts.resetTime) {
      return res.status(429).json({ 
        error: 'Too many failed attempts. Try again in 15 minutes.' 
      });
    }
    
    if (Date.now() >= attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = Date.now() + 900000;
    }
    
    // Verify credentials
    if (!verifyAdminCredentials(username, password)) {
      attempts.count++;
      
      // Log failed attempt
      console.warn(`Failed admin login attempt from ${clientIp} at ${new Date().toISOString()}`);
      
      // TODO: Log to database for security monitoring
      // await db.execute(sql`
      //   INSERT INTO admin_security_logs (event_type, ip_address, user_agent, details, created_at)
      //   VALUES (
      //     'failed_login',
      //     ${clientIp},
      //     ${req.get('User-Agent') || 'unknown'},
      //     ${JSON.stringify({ username, timestamp: new Date().toISOString() })},
      //     NOW()
      //   )
      //   ON CONFLICT DO NOTHING
      // `);
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset failed attempts on successful login
    adminLoginAttempts.delete(attemptKey);
    
    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    
    adminSessions.set(sessionToken, {
      userId: 'admin',
      expiresAt
    });
    
    // Log successful login
    console.log(`Admin login successful from ${clientIp} at ${new Date().toISOString()}`);
    
    // Log successful login to database
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS admin_security_logs (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await db.execute(sql`
        INSERT INTO admin_security_logs (event_type, ip_address, user_agent, details, created_at)
        VALUES (
          'successful_login',
          ${clientIp},
          ${req.get('User-Agent') || 'unknown'},
          ${JSON.stringify({ username, timestamp: new Date().toISOString() })},
          NOW()
        )
      `);
    } catch (error) {
      console.log('Admin security logging error:', error);
    }
    
    // Set secure cookie
    res.cookie('admin-session', sessionToken, {
      httpOnly: true,
      secure: false, // Allow in development
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    
    res.json({ 
      success: true, 
      message: 'Admin login successful',
      expiresAt: new Date(expiresAt).toISOString()
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin logout endpoint
export const adminLogout = (req: Request, res: Response) => {
  const sessionToken = req.cookies?.['admin-session'];
  
  if (sessionToken) {
    adminSessions.delete(sessionToken);
  }
  
  res.clearCookie('admin-session');
  res.json({ success: true, message: 'Admin logout successful' });
};

// Check admin session status
export const adminStatus = (req: Request, res: Response) => {
  const sessionToken = req.cookies?.['admin-session'];
  
  if (!sessionToken) {
    return res.json({ authenticated: false });
  }
  
  const session = adminSessions.get(sessionToken);
  
  if (!session || session.expiresAt < Date.now()) {
    return res.json({ authenticated: false });
  }
  
  res.json({ 
    authenticated: true, 
    expiresAt: new Date(session.expiresAt).toISOString()
  });
};

// Rate limiting storage already declared above

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt < now) {
      adminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000);