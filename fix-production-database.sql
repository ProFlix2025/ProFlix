-- Fix production database schema to match development
-- This script adds all missing columns needed for ProFlix platform

-- Add missing columns to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'proflix';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_id VARCHAR;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_learn_tube BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_pro_tube BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS can_run_ads BOOLEAN DEFAULT TRUE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_type VARCHAR DEFAULT 'free';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS subcategory_ids INTEGER[];

-- Update existing videos to have proper defaults
UPDATE videos SET source = 'proflix' WHERE source IS NULL OR source = '';
UPDATE videos SET video_type = 'free' WHERE video_type IS NULL OR video_type = '';
UPDATE videos SET can_run_ads = TRUE WHERE can_run_ads IS NULL;
UPDATE videos SET is_learn_tube = FALSE WHERE is_learn_tube IS NULL;
UPDATE videos SET is_pro_tube = FALSE WHERE is_pro_tube IS NULL;

-- Ensure pro_creator_codes table exists
CREATE TABLE IF NOT EXISTS pro_creator_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    used_by_user_id VARCHAR,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on code column for faster lookups
CREATE INDEX IF NOT EXISTS idx_pro_creator_codes_code ON pro_creator_codes(code);
CREATE INDEX IF NOT EXISTS idx_pro_creator_codes_expires_at ON pro_creator_codes(expires_at);

-- Add video content source indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_source ON videos(source);
CREATE INDEX IF NOT EXISTS idx_videos_is_learn_tube ON videos(is_learn_tube);
CREATE INDEX IF NOT EXISTS idx_videos_is_pro_tube ON videos(is_pro_tube);
CREATE INDEX IF NOT EXISTS idx_videos_can_run_ads ON videos(can_run_ads);

-- Display completion message
SELECT 'ProFlix production database schema updated successfully!' as status;