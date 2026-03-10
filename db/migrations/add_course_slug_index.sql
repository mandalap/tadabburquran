-- Add slug column to courses table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'slug'
    ) THEN
        ALTER TABLE courses ADD COLUMN slug VARCHAR(255);
    END IF;
END $$;

-- Generate slugs from existing titles
UPDATE courses
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '\s+', '-', 'g'), '[^a-zA-Z0-9-]', '', 'g'))
WHERE slug IS NULL OR slug = '';

-- Make slug unique for rows with duplicate slugs by appending UUID
DO $$
DECLARE
    course_record RECORD;
    counter INTEGER;
BEGIN
    FOR course_record IN
        SELECT id, title, slug FROM courses
    LOOP
        SELECT COUNT(*) INTO counter
        FROM courses
        WHERE slug = course_record.slug AND id != course_record.id;

        IF counter > 0 THEN
            UPDATE courses
            SET slug = course_record.slug || '-' || SUBSTRING(id::TEXT, 1, 8)
            WHERE id = course_record.id;
        END IF;
    END LOOP;
END $$;

-- Add unique constraint on slug
ALTER TABLE courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);

-- Add index on slug for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Add index on category for faster joins
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Add index on is_published for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
