#!/usr/bin/env node

// Quick database connection test for production deployment
import { Pool } from '@neondatabase/serverless';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const dbUrl = process.env.DATABASE_URL;
  console.log('Database URL format:', dbUrl ? 'SET' : 'MISSING');
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Check for common URL encoding issues
  if (dbUrl.includes('%20') || dbUrl.includes("'") || dbUrl.startsWith('psql')) {
    console.error('❌ DATABASE_URL appears to be incorrectly formatted');
    console.error('   URL should start with: postgresql://');
    console.error('   Current URL starts with:', dbUrl.substring(0, 30) + '...');
    process.exit(1);
  }
  
  try {
    const pool = new Pool({ connectionString: dbUrl });
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log('   Current time:', result.rows[0].current_time);
    
    // Test basic table existence
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'categories', 'videos')
    `);
    
    console.log('✅ Found tables:', tableCheck.rows.map(r => r.table_name));
    
    await pool.end();
    console.log('✅ Database test completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();