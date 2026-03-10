DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'event_date'
    ) THEN
        ALTER TABLE courses ADD COLUMN event_date DATE;
    END IF;
END $$;
