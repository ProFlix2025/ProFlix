import { db } from './db';
import { sql } from 'drizzle-orm';

export async function fixProductionDatabase() {
  console.log('🔧 Starting comprehensive production database fix...');
  
  try {
    // First, let's check what tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:', tables.rows.map(r => r.table_name));
    
    // Check and fix categories table
    console.log('🔍 Checking categories table...');
    const categoriesColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Categories columns:', categoriesColumns.rows);
    
    // Add missing emoji column if not exists
    const hasEmoji = categoriesColumns.rows.some(col => col.column_name === 'emoji');
    if (!hasEmoji) {
      console.log('➕ Adding emoji column to categories...');
      await db.execute(sql`ALTER TABLE categories ADD COLUMN emoji VARCHAR(2);`);
    }
    
    // Check and fix videos table
    console.log('🔍 Checking videos table...');
    const videosColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'videos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Videos columns:', videosColumns.rows);
    
    // Add missing columns to videos table
    const videoColumnsToAdd = [
      { name: 'duration_minutes', type: 'INTEGER' },
      { name: 'is_published', type: 'BOOLEAN DEFAULT true' },
      { name: 'share_count', type: 'INTEGER DEFAULT 0' },
      { name: 'subcategory_id', type: 'INTEGER' },
      { name: 'subcategory_ids', type: 'INTEGER[]' }
    ];
    
    for (const col of videoColumnsToAdd) {
      const hasColumn = videosColumns.rows.some(dbCol => dbCol.column_name === col.name);
      if (!hasColumn) {
        console.log(`➕ Adding ${col.name} column to videos...`);
        await db.execute(sql`ALTER TABLE videos ADD COLUMN ${sql.raw(col.name)} ${sql.raw(col.type)};`);
      }
    }
    
    // Check and fix users table
    console.log('🔍 Checking users table...');
    const usersColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Users columns:', usersColumns.rows);
    
    // Add missing columns to users table
    const userColumnsToAdd = [
      { name: 'pro_creator_tier', type: 'VARCHAR DEFAULT \'free\'' },
      { name: 'video_hour_limit', type: 'INTEGER DEFAULT 5' },
      { name: 'current_video_hours', type: 'INTEGER DEFAULT 0' },
      { name: 'is_pro_creator', type: 'BOOLEAN DEFAULT false' },
      { name: 'pro_creator_ends_at', type: 'TIMESTAMP' }
    ];
    
    for (const col of userColumnsToAdd) {
      const hasColumn = usersColumns.rows.some(dbCol => dbCol.column_name === col.name);
      if (!hasColumn) {
        console.log(`➕ Adding ${col.name} column to users...`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN ${sql.raw(col.name)} ${sql.raw(col.type)};`);
      }
    }
    
    // Update existing records with default values
    console.log('🔄 Updating existing records...');
    await db.execute(sql`UPDATE videos SET is_published = true WHERE is_published IS NULL;`);
    await db.execute(sql`UPDATE videos SET share_count = 0 WHERE share_count IS NULL;`);
    await db.execute(sql`UPDATE users SET pro_creator_tier = 'free' WHERE pro_creator_tier IS NULL;`);
    await db.execute(sql`UPDATE users SET video_hour_limit = 5 WHERE video_hour_limit IS NULL;`);
    await db.execute(sql`UPDATE users SET current_video_hours = 0 WHERE current_video_hours IS NULL;`);
    
    // Add emojis to categories
    console.log('🎨 Adding emojis to categories...');
    const categoryEmojis = [
      { name: 'Art & Creativity', emoji: '🎨' },
      { name: 'Business & Finance', emoji: '💼' },
      { name: 'Education & Learning', emoji: '📚' },
      { name: 'Entertainment', emoji: '🎬' },
      { name: 'Fashion & Style', emoji: '👗' },
      { name: 'Film & Media', emoji: '🎥' },
      { name: 'Fitness & Health', emoji: '💪' },
      { name: 'Food & Cooking', emoji: '🍳' },
      { name: 'Gaming', emoji: '🎮' },
      { name: 'Home & DIY', emoji: '🏠' },
      { name: 'Lifestyle', emoji: '✨' },
      { name: 'Music & Audio', emoji: '🎵' },
      { name: 'News & Politics', emoji: '📰' },
      { name: 'Pets & Animals', emoji: '🐾' },
      { name: 'Science & Technology', emoji: '🔬' },
      { name: 'Sports & Recreation', emoji: '⚽' },
      { name: 'Travel & Adventure', emoji: '✈️' },
      { name: 'Automotive', emoji: '🚗' },
      { name: 'Beauty & Skincare', emoji: '💄' },
      { name: 'Comedy', emoji: '😂' },
      { name: 'Dance', emoji: '💃' },
      { name: 'Digital Marketing', emoji: '📱' },
      { name: 'Environment', emoji: '🌱' },
      { name: 'History', emoji: '📜' },
      { name: 'Languages', emoji: '🗣️' },
      { name: 'Mental Health', emoji: '🧠' },
      { name: 'Photography', emoji: '📸' },
      { name: 'Real Estate', emoji: '🏘️' },
      { name: 'Relationships', emoji: '💕' },
      { name: 'Spirituality', emoji: '🧘' },
      { name: 'Parenting', emoji: '👶' }
    ];
    
    for (const { name, emoji } of categoryEmojis) {
      await db.execute(sql`
        UPDATE categories 
        SET emoji = ${emoji} 
        WHERE name = ${name} AND (emoji IS NULL OR emoji = '');
      `);
    }
    
    // Test the categories query
    console.log('🧪 Testing categories query...');
    const testCategories = await db.execute(sql`SELECT id, name, emoji FROM categories LIMIT 5;`);
    console.log('📊 Sample categories:', testCategories.rows);
    
    console.log('✅ Production database fix completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Production database fix failed:', error);
    throw error;
  }
}