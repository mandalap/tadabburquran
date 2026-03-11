-- Prevent duplicate paid orders per user per course
CREATE UNIQUE INDEX IF NOT EXISTS unique_paid_order_per_course
ON orders(user_id, course_id)
WHERE payment_status = 'paid';

-- Prevent multiple open pending orders per user per course
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_order_per_course
ON orders(user_id, course_id)
WHERE payment_status = 'pending';
