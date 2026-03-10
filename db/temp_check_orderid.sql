SELECT o.id, o.user_id, o.course_id, o.payment_status, o.payment_method, o.transaction_id, o.created_at
FROM orders o
WHERE o.transaction_id = 'ORD-9A2A42-MMGD7I77-BTHG';

SELECT id, email FROM users WHERE email = 'juli23man@gmail.com';
