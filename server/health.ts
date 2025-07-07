import { Request, Response } from 'express';
import { db } from './db';

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connectivity
    await db.execute('SELECT 1');
    
    // Check environment variables
    const requiredVars = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'SESSION_SECRET'];
    const missing = requiredVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      return res.status(503).json({
        status: 'unhealthy',
        message: 'Missing environment variables',
        missing
      });
    }
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}