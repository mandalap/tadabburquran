DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'course_type'
    ) THEN
        ALTER TABLE courses ADD COLUMN course_type VARCHAR(50);
    END IF;
END $$;
