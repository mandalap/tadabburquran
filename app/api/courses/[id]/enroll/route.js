import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'

// POST /api/courses/[id]/enroll - Enroll user in a course (for free courses)
export async function POST(request, { params }) {
  try {
    const { id: courseIdOrSlug } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get course by slug or ID
    let course = null
    try {
      course = await queryOne(`SELECT * FROM courses WHERE slug = $1`, [courseIdOrSlug])
    } catch (e) {}

    if (!course) {
      course = await queryOne(`SELECT * FROM courses WHERE id = $1`, [courseIdOrSlug])
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if course is free
    const isFree = !course.price || course.price === 0
    if (!isFree) {
      return NextResponse.json(
        { success: false, error: 'This is a paid course. Please go through checkout.' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await queryOne(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [userId, course.id]
    )

    if (existingEnrollment) {
      // User already enrolled, return enrollment data
      const enrollment = await queryOne(`
        SELECT e.*, c.modules
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.id = $1
      `, [existingEnrollment.id])

      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        enrollment
      })
    }

    // Create new enrollment
    const result = await query(
      `INSERT INTO enrollments (user_id, course_id, enrolled_at, progress)
       VALUES ($1, $2, NOW(), 0)
       RETURNING *`,
      [userId, course.id]
    )

    // Create order record for free course
    await query(
      `INSERT INTO orders (user_id, course_id, course_name, price, payment_method, payment_status, transaction_id, paid_at, created_at, email_sent)
       VALUES ($1, $2, $3, 0, 'free', 'paid', 'FREE-' || $4 || '-' || EXTRACT(EPOCH FROM NOW())::bigint, NOW(), NOW(), true)
       RETURNING *`,
      [userId, course.id, course.title, course.id]
    )

    // Get enrollment with modules
    const enrollment = await queryOne(`
      SELECT e.*, c.modules
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = $1
    `, [result.id])

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Successfully enrolled in free course'
    })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
