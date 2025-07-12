-- Complete Production Database Fix
-- Adds all missing columns that are causing 500 errors

-- Critical missing columns for video content system
ALTER TABLE videos ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'proflix';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_id VARCHAR;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_learn_tube BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_pro_tube BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS can_run_ads BOOLEAN DEFAULT TRUE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_type VARCHAR DEFAULT 'free';

-- Course and monetization columns
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_course BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS course_price INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS course_description TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_free_content BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS offers_premium_discount BOOLEAN DEFAULT FALSE;

-- Ad revenue and analytics columns
ALTER TABLE videos ADD COLUMN IF NOT EXISTS ad_revenue INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS ad_impressions INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_donated_to_streaming BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS streaming_watch_time INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS purchases INTEGER DEFAULT 0;

-- Video metadata and features
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS offer_free_preview BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'en';

-- Ensure Pro Creator codes table exists
CREATE TABLE IF NOT EXISTS "pro_creator_codes" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR NOT NULL UNIQUE,
  "is_used" BOOLEAN DEFAULT FALSE,
  "used_by_user_id" VARCHAR,
  "used_at" TIMESTAMP,
  "expires_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create system user for LearnTube videos
INSERT INTO users (id, email, first_name, last_name, role, is_system_account, channel_name, channel_description)
VALUES ('system', 'system@proflix.com', 'System', 'Admin', 'creator', true, 'LearnTube', 'Educational content from YouTube')
ON CONFLICT (id) DO UPDATE SET
  email = 'system@proflix.com',
  first_name = 'System',
  last_name = 'Admin',
  role = 'creator',
  is_system_account = true,
  channel_name = 'LearnTube',
  channel_description = 'Educational content from YouTube';

-- Update completed
SELECT 'Production database fix completed successfully' AS status;