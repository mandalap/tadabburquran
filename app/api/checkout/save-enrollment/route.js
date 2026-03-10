import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { sendEmail } from '@/lib/email'

// POST /api/checkout/save-enrollment - Manually save enrollment after payment
// This is called from the frontend after successful Midtrans payment
export async function POST(request) {
  try {
    const body = await request.json()
    const { orderId, courseId, slug, userId, email } = body

    if (!orderId && !courseId && !slug) {
      return NextResponse.json(
        { success: false, error: 'orderId, courseId, or slug required' },
        { status: 400 }
      )
    }

    // Get course details if only slug provided
    let course = null
    if (slug && !courseId) {
      course = await queryOne(`SELECT * FROM courses WHERE slug = $1`, [slug])
    } else if (courseId) {
      course = await queryOne(`SELECT * FROM courses WHERE id = $1`, [courseId])
    }

    if (!course && orderId) {
      const orderCourse = await queryOne(
        `SELECT c.*
         FROM orders o
         JOIN courses c ON c.id = o.course_id
         WHERE o.transaction_id = $1`,
        [orderId]
      )
      course = orderCourse || null
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get user - only allow registered users
    let finalUserId = userId === 'guest' ? null : userId
    let userEmail = email
    let userName = 'Sahabat Quran'

    if (orderId) {
      const orderOwner = await queryOne(
        `SELECT o.user_id, u.email, u.full_name
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         WHERE o.transaction_id = $1`,
        [orderId]
      )
      if (orderOwner?.user_id) {
        finalUserId = orderOwner.user_id
        userEmail = orderOwner.email || userEmail
        userName = orderOwner.full_name || userName
      }
    }

    if (!finalUserId) {
      return NextResponse.json(
        { success: false, error: 'Login diperlukan sebelum pendaftaran kelas' },
        { status: 401 }
      )
    }

    const verifiedUser = await queryOne(
      `SELECT id, full_name, email, role FROM users WHERE id = $1`,
      [finalUserId]
    )

    if (!verifiedUser || verifiedUser.role !== 'user') {
      return NextResponse.json(
        { success: false, error: 'Hanya member yang dapat mendaftar kelas' },
        { status: 403 }
      )
    }

    userName = verifiedUser.full_name || userName
    userEmail = verifiedUser.email || userEmail

    const finalCourseId = course.id
    const isNewEnrollment = !await queryOne(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [finalUserId, finalCourseId]
    )

    // Create enrollment if it doesn't exist
    if (isNewEnrollment) {
      await query(
        `INSERT INTO enrollments (user_id, course_id, enrolled_at, progress)
         VALUES ($1, $2, NOW(), 0)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [finalUserId, finalCourseId]
      )
      console.log(`Created enrollment for user ${finalUserId}, course ${finalCourseId}`)
    }

    // Check if order already exists
    const existingOrder = await queryOne(
      `SELECT id FROM orders WHERE transaction_id = $1`,
      [orderId]
    )

    if (!existingOrder && orderId) {
      await query(
        `INSERT INTO orders (user_id, course_id, course_name, price, payment_method, payment_status, transaction_id, paid_at, created_at)
         VALUES ($1, $2, $3, $4, $5, 'paid', $6, NOW(), NOW())
         ON CONFLICT (transaction_id) DO NOTHING`,
        [finalUserId, finalCourseId, course.title, course.price || 0, 'midtrans', orderId]
      )
      console.log(`Created order ${orderId}`)
    } else if (orderId) {
      await query(
        `UPDATE orders
         SET payment_status = 'paid', paid_at = COALESCE(paid_at, NOW())
         WHERE transaction_id = $1`,
        [orderId]
      )
    }

    // Create notification
    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, action_url)
         VALUES ($1, 'enrollment', 'Pendaftaran Berhasil!', $2, $3)
         ON CONFLICT (user_id, type, action_url) DO NOTHING`,
        [
          finalUserId,
          `Selamat! Anda telah terdaftar di kelas ${course.title}.`,
          `/kelas/${course.slug || course.id}`
        ]
      )
    } catch (notifError) {
      console.error('Error creating notification:', notifError)
      // Don't fail the request if notification fails
    }

    // Send enrollment email
    if (userEmail && isNewEnrollment) {
      try {
        await sendEmail({
          to: userEmail,
          type: 'enrollment',
          data: {
            userName,
            className: course.title,
            instructor: course.instructor || 'Ustadz',
            price: (course.price || 0).toLocaleString('id-ID'),
            classUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kelas/${course.slug || course.id}`
          }
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment saved successfully',
      enrollment: {
        userId: finalUserId,
        courseId: finalCourseId,
        orderId,
      }
    })
  } catch (error) {
    console.error('Error saving enrollment:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
