SELECT id, email FROM users WHERE email = 'juli23man@gmail.com';

SELECT o.id, o.transaction_id, o.user_id, o.payment_status, o.course_id, c.title, o.created_at
FROM orders o
LEFT JOIN courses c ON c.id = o.course_id
ORDER BY o.created_at DESC
LIMIT 10;

SELECT o.id, o.transaction_id, o.user_id, o.payment_status, o.course_id, c.title, o.created_at
FROM orders o
LEFT JOIN courses c ON c.id = o.course_id
WHERE o.transaction_id = 'ORD-9A2A42-MMGD7I77-BTHG';

SELECT e.id, e.user_id, e.course_id, c.title, e.enrolled_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = (SELECT id FROM users WHERE email = 'juli23man@gmail.com')
ORDER BY e.enrolled_at DESC
LIMIT 10;
