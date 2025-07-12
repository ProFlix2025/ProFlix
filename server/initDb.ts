import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Create all tables with direct SQL
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" VARCHAR PRIMARY KEY NOT NULL,
        "sess" JSONB NOT NULL,
        "expire" TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
      
      CREATE TABLE IF NOT EXISTS "users" (
        "id" VARCHAR PRIMARY KEY NOT NULL,
        "email" VARCHAR UNIQUE,
        "first_name" VARCHAR,
        "last_name" VARCHAR,
        "profile_image_url" VARCHAR,
        "role" VARCHAR NOT NULL DEFAULT 'viewer',
        "creator_status" VARCHAR DEFAULT 'none',
        "subscription_tier" VARCHAR DEFAULT 'free',
        "account_type" VARCHAR DEFAULT 'free',
        "upload_hours_used" INTEGER DEFAULT 0,
        "upload_hours_limit" INTEGER DEFAULT 5,
        "monthly_hours_used" INTEGER DEFAULT 0,
        "monthly_hours_limit" INTEGER DEFAULT 8,
        "is_streaming_subscriber" BOOLEAN DEFAULT false,
        "streaming_trial_ends_at" TIMESTAMP,
        "streaming_subscription_ends_at" TIMESTAMP,
        "paypal_payment_url" VARCHAR,
        "stripe_payment_url" VARCHAR,
        "channel_name" VARCHAR,
        "channel_description" TEXT,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "slug" VARCHAR UNIQUE NOT NULL,
        "description" TEXT,
        "emoji" VARCHAR,
        "created_at" TIMESTAMP DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS "subcategories" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "slug" VARCHAR UNIQUE NOT NULL,
        "description" TEXT,
        "category_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS "videos" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "description" TEXT,
        "video_url" VARCHAR NOT NULL,
        "thumbnail_url" VARCHAR,
        "duration" INTEGER,
        "views" INTEGER DEFAULT 0,
        "likes" INTEGER DEFAULT 0,
        "dislikes" INTEGER DEFAULT 0,
        "creator_id" VARCHAR NOT NULL,
        "category_id" INTEGER NOT NULL,
        "subcategory_id" INTEGER,
        "price" INTEGER DEFAULT 0,
        "video_tier" VARCHAR DEFAULT 'streaming',
        "has_free_preview" BOOLEAN DEFAULT false,
        "preview_duration" INTEGER DEFAULT 120,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE,
        FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "video_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
        UNIQUE("user_id", "video_id")
      );
      
      CREATE TABLE IF NOT EXISTS "shared_videos" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "video_id" INTEGER NOT NULL,
        "share_token" VARCHAR UNIQUE NOT NULL,
        "recipient_email" VARCHAR,
        "message" TEXT,
        "created_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS "video_likes" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "video_id" INTEGER NOT NULL,
        "is_like" BOOLEAN NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
        UNIQUE("user_id", "video_id")
      );
      
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "user_id" VARCHAR NOT NULL,
        "video_id" INTEGER NOT NULL,
        "parent_id" INTEGER,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
        FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS "playlists" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "description" TEXT,
        "user_id" VARCHAR NOT NULL,
        "is_public" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS "playlist_videos" (
        "id" SERIAL PRIMARY KEY,
        "playlist_id" INTEGER NOT NULL,
        "video_id" INTEGER NOT NULL,
        "position" INTEGER NOT NULL,
        "added_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
        UNIQUE("playlist_id", "video_id")
      );
      
      CREATE TABLE IF NOT EXISTS "watch_history" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "video_id" INTEGER NOT NULL,
        "watch_time" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
        UNIQUE("user_id", "video_id")
      );
      
      CREATE TABLE IF NOT EXISTS "creator_applications" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "channel_name" VARCHAR NOT NULL,
        "channel_description" TEXT NOT NULL,
        "content_type" VARCHAR NOT NULL,
        "experience_level" VARCHAR NOT NULL,
        "sample_content" TEXT NOT NULL,
        "social_links" TEXT,
        "why_proflix" TEXT NOT NULL,
        "target_audience" TEXT NOT NULL,
        "content_schedule" TEXT NOT NULL,
        "status" VARCHAR DEFAULT 'pending',
        "admin_notes" TEXT,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS "course_purchases" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "video_id" INTEGER NOT NULL,
        "amount" INTEGER NOT NULL,
        "stripe_payment_intent_id" VARCHAR,
        "status" VARCHAR DEFAULT 'pending',
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE
      );
    `);
    
    // Add missing columns that may not exist in production
    try {
      await db.execute(sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS emoji VARCHAR;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS subcategory_ids INTEGER[];`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS subcategory_id INTEGER;`);
      
      // Add critical missing columns for production
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'proflix';`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_id VARCHAR;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_learn_tube BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_pro_tube BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS can_run_ads BOOLEAN DEFAULT TRUE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_type VARCHAR DEFAULT 'free';`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_course BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS course_price INTEGER DEFAULT 0;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS course_description TEXT;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_free_content BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS offers_premium_discount BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS ad_revenue INTEGER DEFAULT 0;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS ad_impressions INTEGER DEFAULT 0;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_donated_to_streaming BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS streaming_watch_time INTEGER DEFAULT 0;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS purchases INTEGER DEFAULT 0;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS offer_free_preview BOOLEAN DEFAULT FALSE;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT;`);
      await db.execute(sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'en';`);
      
      console.log('✅ Missing columns added successfully');
    } catch (error) {
      console.log('⚠️ Column addition completed (some may have already existed)');
    }
    
    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}