-- Remove duplicate PAID orders per (user_id, course_id), keep the latest paid_at/created_at
WITH ranked AS (
  SELECT id, user_id, course_id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, course_id
           ORDER BY COALESCE(paid_at, created_at) DESC, created_at DESC
         ) AS rn
  FROM orders
  WHERE payment_status = 'paid'
)
DELETE FROM orders o
USING ranked r
WHERE o.id = r.id AND r.rn > 1;

-- Create unique index after cleanup
DO $$
BEGIN
  BEGIN
    CREATE UNIQUE INDEX unique_paid_order_per_course
      ON orders(user_id, course_id)
      WHERE payment_status = 'paid';
  EXCEPTION WHEN duplicate_table THEN
    -- Index already exists
    NULL;
  END;
END $$;
