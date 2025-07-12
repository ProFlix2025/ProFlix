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
  
  console.log('🔐 Credential verification:', {
    username,
    expectedUsername: ADMIN_USERNAME,
    usernameMatch: username === ADMIN_USERNAME,
    expectedPassword: ADMIN_PASSWORD,
    hashMatch: expectedHash === providedHash
  });
  
  return username === ADMIN_USERNAME && crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(providedHash, 'hex')
  );
}

// Admin authentication middleware
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = (req as any).session;
  
  // Check if admin is authenticated via session
  if (!session || !session.isAdmin) {
    return res.status(401).json({ 
      error: 'Admin authentication required',
      redirectTo: '/admin/login' 
    });
  }
  
  // Add admin info to request
  (req as any).admin = { userId: 'admin' };
  next();
};

// Admin login endpoint
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Admin login attempt:', { username, passwordLength: password?.length });
    
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
      
      // Log failed login to database (production safe)
      try {
        await db.execute(sql`
          INSERT INTO admin_security_logs (event_type, ip_address, user_agent, details, created_at)
          VALUES (
            'failed_login',
            ${clientIp || 'unknown'},
            ${req.get('User-Agent') || 'unknown'},
            ${JSON.stringify({ username, timestamp: new Date().toISOString() })},
            NOW()
          )
          ON CONFLICT DO NOTHING
        `);
      } catch (error) {
        // Don't let logging errors crash the login process
        console.log('Failed login logging skipped:', error.message);
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset failed attempts on successful login
    adminLoginAttempts.delete(attemptKey);
    
    // Set admin session using express-session
    (req as any).session.isAdmin = true;
    (req as any).session.adminUser = 'admin';
    (req as any).session.adminLoginTime = new Date().toISOString();
    
    // Log successful login
    console.log(`✅ Admin login successful from ${clientIp} at ${new Date().toISOString()}`);
    
    // Log successful login to database (production safe)
    try {
      // Only try to create table if it doesn't exist - use a simpler approach for production
      await db.execute(sql`
        INSERT INTO admin_security_logs (event_type, ip_address, user_agent, details, created_at)
        VALUES (
          'successful_login',
          ${clientIp || 'unknown'},
          ${req.get('User-Agent') || 'unknown'},
          ${JSON.stringify({ username, timestamp: new Date().toISOString() })},
          NOW()
        )
        ON CONFLICT DO NOTHING
      `);
    } catch (error) {
      // Don't let logging errors crash the admin login
      console.log('Admin security logging skipped:', error.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Admin login successful',
      authenticated: true
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin logout endpoint
export const adminLogout = (req: Request, res: Response) => {
  const session = (req as any).session;
  
  if (session) {
    session.isAdmin = false;
    session.adminUser = null;
    session.adminLoginTime = null;
  }
  
  res.json({ success: true, message: 'Admin logout successful' });
};

// Check admin session status
export const adminStatus = (req: Request, res: Response) => {
  const session = (req as any).session;
  
  if (!session || !session.isAdmin) {
    return res.json({ authenticated: false });
  }
  
  res.json({ 
    authenticated: true, 
    adminUser: session.adminUser,
    loginTime: session.adminLoginTime
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