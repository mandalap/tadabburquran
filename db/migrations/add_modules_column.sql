-- Migration: Add modules column to courses table
-- Run this to add modules column to existing database

ALTER TABLE courses ADD COLUMN IF NOT EXISTS modules JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN courses.modules IS 'Course modules with lessons structure. Format: [{"id": "mod1", "title": "Module Name", "lessons": [{"id": "l1", "title": "Lesson Title", "duration": "12:00", "videoUrl": "https://youtube.com/...", "isFree": true}]}]';
