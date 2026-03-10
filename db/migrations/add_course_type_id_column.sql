DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'course_type_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN course_type_id UUID REFERENCES course_types(id);
    END IF;
END $$;
