import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { sendEmail } from '@/lib/email'

/**
 * POST /api/checkout/send-email
 * Send confirmation email manually (for testing or resend)
 * Body: { orderId: string }
 */
export async function POST(request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order information
    const order = await queryOne(
      `SELECT o.*, u.email, u.full_name, u.username, c.title as course_title, c.slug, c.instructor, c.category, c.type, c.price
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN courses c ON o.course_id = c.id
       WHERE o.transaction_id = $1 OR o.id = $1`,
      [orderId]
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Determine email template based on course type
    let courseType = 'E-Course'
    let emailTemplate = 'enrollment'
    let classUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kelas/${order.slug || order.course_id}`

    if (order.category?.toLowerCase().includes('webinar') || order.type?.toLowerCase().includes('webinar')) {
      courseType = 'Webinar'
      emailTemplate = 'enrollmentWebinar'
    } else if (order.category?.toLowerCase().includes('ebook') || order.category?.toLowerCase().includes('buku') || order.type?.toLowerCase().includes('ebook')) {
      courseType = 'Ebook'
      emailTemplate = 'enrollmentEbook'
      classUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    }

    // Format price
    const price = order.price ? order.price.toLocaleString('id-ID') : 'Gratis'

    // Determine instructor name
    let instructorName = order.instructor || 'Ustadz Terpercaya'
    if (order.instructor && typeof order.instructor === 'object') {
      instructorName = order.instructor.name || order.instructor.title || 'Ustadz Terpercaya'
    }

    // Prepare email data
    const emailData = {
      userName: order.full_name || order.username || 'Akhi/Ukhti',
      className: order.course_title || order.course_name,
      instructor: instructorName,
      courseType: courseType,
      orderId: order.transaction_id?.split('-').pop() || order.id,
      price: price,
      classUrl: classUrl,
      webinarUrl: classUrl,
      webinarDate: 'Segera diinfokan',
      webinarTime: 'Segera diinfokan',
      ebookUrl: classUrl
    }

    // Send email
    const emailSent = await sendEmail({
      to: order.email,
      type: emailTemplate,
      data: emailData
    })

    if (emailSent) {
      // Update email_sent status
      await queryOne(
        `UPDATE orders SET email_sent = true WHERE transaction_id = $1 OR id = $1`,
        [orderId]
      )

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        email: order.email,
        template: emailTemplate
      })
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
