DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'enrollments'
  ) THEN
    DELETE FROM enrollments e
    USING enrollments e2
    WHERE e.user_id = e2.user_id
      AND e.course_id = e2.course_id
      AND e.enrolled_at < e2.enrolled_at;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'enrollments'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'enrollments_user_course_unique'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id);
  END IF;
END $$;
