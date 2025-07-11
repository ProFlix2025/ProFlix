// Migration script to add subcategoryIds column to videos table
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

async function migrateSubcategories() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    webSocketConstructor: ws
  });
  
  try {
    console.log('🔄 Starting subcategories migration...');
    
    // Add the new column
    await pool.query('ALTER TABLE videos ADD COLUMN IF NOT EXISTS subcategory_ids INTEGER[]');
    console.log('✅ Added subcategory_ids column');
    
    // Update existing records to use the old subcategoryId in the new array
    await pool.query(`
      UPDATE videos 
      SET subcategory_ids = ARRAY[subcategory_id] 
      WHERE subcategory_ids IS NULL AND subcategory_id IS NOT NULL
    `);
    console.log('✅ Migrated existing data');
    
    // Make the new column NOT NULL
    await pool.query('ALTER TABLE videos ALTER COLUMN subcategory_ids SET NOT NULL');
    console.log('✅ Set NOT NULL constraint');
    
    // Eventually we can drop the old column (but keep it for now for compatibility)
    // await pool.query('ALTER TABLE videos DROP COLUMN subcategory_id');
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateSubcategories();