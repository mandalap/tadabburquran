import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { query, queryOne, queryAll } from '@/lib/db'
import { sendEmail } from '@/lib/email'

// Verify Midtrans signature
function verifySignature(notificationBody, signatureKey) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const orderId = notificationBody.order_id
  const statusCode = notificationBody.status_code
  const grossAmount = notificationBody.gross_amount

  // Create signature hash
  const rawSignature = `${orderId}${statusCode}${grossAmount}${serverKey}`
  const computedSignature = crypto
    .createHash('sha512')
    .update(rawSignature)
    .digest('hex')

  return computedSignature === signatureKey
}

// Create enrollment and order records
async function createEnrollmentAndOrder(data) {
  const {
    order_id,
    courseId,
    userId,
    paymentType,
    transactionTime,
    grossAmount,
    courseTitle,
  } = data

  try {
    // Check if enrollment already exists
    const existingEnrollment = await queryOne(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    )

    const isNewEnrollment = !existingEnrollment

    // Create enrollment if not exists
    if (isNewEnrollment) {
      await query(
        `INSERT INTO enrollments (user_id, course_id, enrolled_at, progress)
         VALUES ($1, $2, NOW(), 0)
         ON CONFLICT (user_id, course_id) DO NOTHING`,
        [userId, courseId]
      )
      console.log(`✅ Created NEW enrollment for user ${userId}, course ${courseId}`)
    } else {
      console.log(`ℹ️ Enrollment already exists for user ${userId}, course ${courseId}`)
    }

    // Check if order already exists
    const existingOrder = await queryOne(
      `SELECT id, email_sent FROM orders WHERE transaction_id = $1`,
      [order_id]
    )

    // Create order record if not exists
    if (!existingOrder) {
      // Get course name for order
      let courseName = courseTitle || 'Course'
      if (!courseTitle) {
        const course = await queryOne(`SELECT title FROM courses WHERE id = $1`, [courseId])
        courseName = course?.title || 'Course'
      }

      await query(
        `INSERT INTO orders (user_id, course_id, course_name, price, payment_method, payment_status, transaction_id, paid_at, created_at, email_sent)
         VALUES ($1, $2, $3, $4, $5, 'paid', $6, NOW(), NOW(), false)
         ON CONFLICT (transaction_id) DO NOTHING`,
        [userId, courseId, courseName, parseInt(grossAmount) || 0, paymentType || 'midtrans', order_id]
      )
      console.log(`Created order ${order_id}`)

      // Send confirmation email for new orders
      await sendConfirmationEmail({
        orderId: order_id,
        courseId,
        userId,
        courseName,
        isNewEnrollment
      })
    } else {
      await query(
        `UPDATE orders
         SET payment_status = 'paid', paid_at = COALESCE(paid_at, NOW())
         WHERE transaction_id = $1`,
        [order_id]
      )
    }

    if (existingOrder && !existingOrder.email_sent) {
      // Send email if not sent yet
      await sendConfirmationEmail({
        orderId: order_id,
        courseId,
        userId,
        courseName: existingOrder.course_name || courseTitle,
        isNewEnrollment: false
      })

      // Mark email as sent
      await query(`UPDATE orders SET email_sent = true WHERE transaction_id = $1`, [order_id])
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating enrollment/order:', error)
    return { success: false, error: error.message }
  }
}

// Send confirmation email after successful payment
async function sendConfirmationEmail({ orderId, courseId, userId, courseName, isNewEnrollment }) {
  try {
    // Get user information
    const user = await queryOne(
      `SELECT email, full_name, username FROM users WHERE id = $1`,
      [userId]
    )

    if (!user || !user.email) {
      console.log('No user email found, skipping email notification')
      return
    }

    // Get course information
    const course = await queryOne(
      `SELECT title, slug, instructor, category, type FROM courses WHERE id = $1`,
      [courseId]
    )

    if (!course) {
      console.log('No course found, skipping email notification')
      return
    }

    // Get course type name
    let courseType = 'E-Course'
    let emailTemplate = 'enrollment'
    let classUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kelas/${course.slug || courseId}`

    // Check if it's a webinar
    if (course.category?.toLowerCase().includes('webinar') || course.type?.toLowerCase().includes('webinar')) {
      courseType = 'Webinar'
      emailTemplate = 'enrollmentWebinar'
    }
    // Check if it's an ebook
    else if (course.category?.toLowerCase().includes('ebook') || course.category?.toLowerCase().includes('buku') || course.type?.toLowerCase().includes('ebook')) {
      courseType = 'Ebook'
      emailTemplate = 'enrollmentEbook'
      classUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    }

    // Format price
    const price = course.price ? course.price.toLocaleString('id-ID') : 'Gratis'

    // Determine instructor name
    let instructorName = course.instructor || 'Ustadz Terpercaya'
    if (course.instructor && typeof course.instructor === 'object') {
      instructorName = course.instructor.name || course.instructor.title || 'Ustadz Terpercaya'
    }

    // Prepare email data
    const emailData = {
      userName: user.full_name || user.username || 'Akhi/Ukhti',
      className: course.title || courseName,
      instructor: instructorName,
      courseType: courseType,
      orderId: orderId.split('-').pop() || orderId,
      price: price,
      classUrl: classUrl,
      webinarUrl: classUrl,
      webinarDate: course.date || 'Segera diinfokan',
      webinarTime: course.time || 'Segera diinfokan',
      ebookUrl: classUrl
    }

    // Send email
    const emailSent = await sendEmail({
      to: user.email,
      type: emailTemplate,
      data: emailData
    })

    if (emailSent) {
      console.log(`✅ Confirmation email sent to ${user.email} for order ${orderId}`)

      // Mark email as sent in database
      await query(`UPDATE orders SET email_sent = true WHERE transaction_id = $1`, [orderId])
    } else {
      console.log(`⚠️ Failed to send email to ${user.email}`)
    }

    return { success: emailSent }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // For development/testing, you might want to skip signature verification
    const signatureKey = request.headers.get('x-signature-key')
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && (!signatureKey || !verifySignature(body, signatureKey))) {
      console.error('Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const {
      order_id,
      transaction_status,
      payment_type,
      transaction_time,
      fraud_status,
      custom_field1: courseId,
      custom_field2: userId,
      gross_amount,
      customer_details,
      custom_field3
    } = body

    console.log('Payment notification received:', {
      order_id,
      status: transaction_status,
      payment_type,
      course_id: courseId,
      user_id: userId,
      gross_amount,
      timestamp: new Date().toISOString()
    })

    // Handle different transaction statuses
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      let finalUserId = userId && userId !== 'guest' ? userId : null
      const email = customer_details?.email || custom_field3
      if (!finalUserId && email) {
        const existingUser = await queryOne(
          `SELECT id, role FROM users WHERE email = $1`,
          [email]
        )
        if (existingUser?.id && existingUser.role === 'user') {
          finalUserId = existingUser.id
        }
      }

      if (!finalUserId) {
        console.error('Payment received but user is not a member. Skipping enrollment.', {
          order_id,
          email,
          custom_field2_userId: userId,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json({ status: 'ok' })
      }

      console.log('Creating enrollment for user:', {
        order_id,
        finalUserId,
        courseId,
        timestamp: new Date().toISOString()
      })

      // Payment successful - create enrollment and order
      const result = await createEnrollmentAndOrder({
        order_id,
        courseId,
        userId: finalUserId,
        paymentType: payment_type,
        transactionTime: transaction_time,
        grossAmount: gross_amount,
      })

      if (!result.success) {
        console.error('Failed to create enrollment:', {
          order_id,
          error: result.error,
          userId: finalUserId,
          courseId,
          timestamp: new Date().toISOString()
        })
      } else {
        console.log('✅ Payment successful and enrollment created:', {
          order_id,
          userId: finalUserId,
          courseId,
          timestamp: new Date().toISOString()
        })
      }
    } else if (transaction_status === 'pending') {
      console.log(`Payment pending for order ${order_id}`)
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      // Payment failed or cancelled
      console.log(`Payment failed for order ${order_id}: ${transaction_status}`)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Midtrans also sends GET requests for verification
export async function GET(request) {
  return NextResponse.json({ status: 'ok' })
}
