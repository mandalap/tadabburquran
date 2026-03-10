-- Add instructors JSONB column to courses table
-- This allows storing multiple instructors for a single course (e.g., webinars with multiple speakers)

-- Add the new column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructors JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data: if instructor field exists, convert it to instructors array
UPDATE courses
SET instructors = JSONB_BUILD_ARRAY(
  JSONB_BUILD_OBJECT(
    'name', instructor,
    'title', COALESCE(instructor_title, '')
  )
)
WHERE instructors = '[]'::jsonb AND instructor IS NOT NULL AND instructor != '';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_instructors ON courses USING GIN (instructors);
