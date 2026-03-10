import { NextResponse } from 'next/server'
import { queryOne, queryAll, query } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/courses/[id]/enrollment - Check if user is enrolled in this course
export async function GET(request, { params }) {
  try {
    const { id: courseIdOrSlug } = await params

    console.log('Enrollment check for course:', courseIdOrSlug)

    // Get course by slug or ID
    let course = null
    try {
      course = await queryOne(`SELECT * FROM courses WHERE slug = $1`, [courseIdOrSlug])
    } catch (e) {
      console.error('Error querying by slug:', e)
    }

    if (!course) {
      course = await queryOne(`SELECT * FROM courses WHERE id = $1`, [courseIdOrSlug])
    }

    if (!course) {
      console.log('Course not found:', courseIdOrSlug)
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    console.log('Course found:', course.id, course.title)

    // Check if user is authenticated - wrap in try/catch to prevent auth errors from breaking the API
    let session = null
    try {
      session = await auth()
    } catch (authError) {
      console.warn('Auth error, continuing as unauthenticated:', authError.message)
    }

    if (!session?.user?.email) {
      // User not logged in - return not enrolled
      console.log('User not logged in, returning isEnrolled: false')
      return NextResponse.json({
        success: true,
        isEnrolled: false,
        enrollment: null,
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          price: course.price,
          modules: course.modules
        }
      })
    }

    // Get user from database
    const user = await queryOne(
      'SELECT id, role FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!user) {
      // User not found in database
      console.log('User not found in database:', session.user.email)
      return NextResponse.json({
        success: true,
        isEnrolled: false,
        enrollment: null,
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          price: course.price,
          modules: course.modules
        }
      })
    }

    console.log('User found:', user.id, 'checking enrollment for course:', course.id)

    // Check enrollment for THIS specific user only
    const userEnrollment = await queryOne(`
      SELECT e.*, c.modules
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.course_id = $1 AND e.user_id = $2
      ORDER BY e.enrolled_at DESC
      LIMIT 1
    `, [course.id, user.id])

    const isEnrolled = !!userEnrollment
    console.log('Enrollment check result:', { userId: user.id, courseId: course.id, isEnrolled })

    return NextResponse.json({
      success: true,
      isEnrolled,
      enrollment: userEnrollment,
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        price: course.price,
        modules: course.modules
      }
    })
  } catch (error) {
    console.error('Enrollment check error:', error)
    return NextResponse.json(
      { success: false, error: error.message, details: error.stack },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/enroll - Enroll user in a course (for free courses)
export async function POST(request, { params }) {
  try {
    const { id: courseIdOrSlug } = await params

    // SECURITY: Verify user is authenticated
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please login first.' },
        { status: 401 }
      )
    }

    // Get authenticated user from database
    const authUser = await queryOne(
      'SELECT id, role FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
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

    // SECURITY: Use authenticated user ID, NOT from request body
    const userId = authUser.id

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
