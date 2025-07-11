import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addProTubeColumns() {
  try {
    console.log('🔄 Adding ProTube columns to videos table...');
    
    // Add the new columns
    await pool.query(`
      ALTER TABLE videos 
      ADD COLUMN IF NOT EXISTS source varchar DEFAULT 'proflix',
      ADD COLUMN IF NOT EXISTS youtube_id varchar,
      ADD COLUMN IF NOT EXISTS is_learn_tube boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_pro_tube boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS can_run_ads boolean DEFAULT true;
    `);

    console.log('✅ Added ProTube columns successfully');
    
    // Update existing videos to have correct source
    await pool.query(`
      UPDATE videos 
      SET source = 'proflix', 
          can_run_ads = true 
      WHERE source IS NULL;
    `);

    console.log('✅ Updated existing videos with correct source');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'videos' 
      AND column_name IN ('source', 'youtube_id', 'is_learn_tube', 'is_pro_tube', 'can_run_ads')
      ORDER BY column_name;
    `);
    
    console.log('📊 New columns added:', result.rows);
    
  } catch (error) {
    console.error('❌ Error adding ProTube columns:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addProTubeColumns().catch(console.error);