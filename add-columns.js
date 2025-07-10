import { Pool } from '@neondatabase/serverless';

async function addMissingColumns() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Add is_free_content column to videos table if it doesn't exist
    await pool.query(`
      ALTER TABLE videos 
      ADD COLUMN IF NOT EXISTS is_free_content BOOLEAN DEFAULT false;
    `);
    
    // Add is_system_account column to users table if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_system_account BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ Database columns added successfully');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await pool.end();
  }
}

addMissingColumns();