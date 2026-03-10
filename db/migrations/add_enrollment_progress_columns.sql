ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_watched_lesson TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_watched_position INTEGER DEFAULT 0;
