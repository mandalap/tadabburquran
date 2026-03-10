import { NextResponse } from 'next/server'
import { getMidtransClient, getClientKey, generateOrderId } from '@/lib/midtrans'
import { queryOne, query } from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json()
    const { courseId, courseSlug, userId, userEmail, userName } = body

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { success: false, error: 'Login diperlukan sebelum checkout' },
        { status: 401 }
      )
    }

    const verifiedUser = await queryOne(
      `SELECT id, full_name, email, role FROM users WHERE id = $1`,
      [userId]
    )
    if (!verifiedUser || verifiedUser.role !== 'user') {
      return NextResponse.json(
        { success: false, error: 'Hanya member yang dapat membeli kelas' },
        { status: 403 }
      )
    }

    if (!courseSlug && !courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID or Slug is required' },
        { status: 400 }
      )
    }

    // Fetch course details - try by slug first, then by ID
    let course
    const searchValue = courseSlug || courseId

    // Try by slug first
    try {
      course = await queryOne(
        `SELECT * FROM courses WHERE slug = $1`,
        [searchValue]
      )
    } catch (e) {
      console.log('Slug column might not exist, trying ID only')
    }

    // If not found by slug, try by ID
    if (!course) {
      course = await queryOne(
        `SELECT * FROM courses WHERE id = $1`,
        [searchValue]
      )
    }

    if (!course) {
      console.error('Course not found for:', searchValue)
      return NextResponse.json(
        { success: false, error: 'Course not found', searchValue },
        { status: 404 }
      )
    }

    const midtransClient = getMidtransClient()
    if (!midtransClient) {
      console.error('Midtrans client not configured')
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured. Please set MIDTRANS_SERVER_KEY in .env.local' },
        { status: 500 }
      )
    }

    // Block if already enrolled (paid)
    const alreadyEnrolled = await queryOne(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [verifiedUser.id, course.id]
    )
    if (alreadyEnrolled) {
      return NextResponse.json(
        { success: false, error: 'Anda sudah terdaftar di kelas ini', code: 'ALREADY_ENROLLED' },
        { status: 409 }
      )
    }

    // Block if there is a recent pending order for the same course
    const existingPending = await queryOne(
      `SELECT transaction_id, created_at FROM orders
       WHERE user_id = $1 AND course_id = $2 AND payment_status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [verifiedUser.id, course.id]
    )
    if (existingPending) {
      const createdAt = new Date(existingPending.created_at)
      const diffHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
      if (diffHours < 24) {
        return NextResponse.json(
          {
            success: false,
            error: 'Masih ada transaksi menunggu pembayaran untuk kelas ini',
            code: 'PENDING_EXISTS',
            transaction_id: existingPending.transaction_id
          },
          { status: 409 }
        )
      }
    }

    // Generate unique order ID
    const orderId = generateOrderId(userId || 'guest')

    // Store order info for finish page
    const finishUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/finish`)
    finishUrl.searchParams.set('orderId', orderId)
    if (course.slug) {
      finishUrl.searchParams.set('slug', course.slug)
    } else {
      finishUrl.searchParams.set('courseId', course.id)
    }

    try {
      await query(
        `INSERT INTO orders (user_id, course_id, course_name, price, payment_method, payment_status, transaction_id, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
         ON CONFLICT (transaction_id) DO NOTHING`,
        [verifiedUser.id, course.id, course.title, course.price || 0, 'midtrans', orderId]
      )
    } catch (e) {
      // Unique constraint on pending duplicate per course
      return NextResponse.json(
        {
          success: false,
          error: 'Masih ada transaksi menunggu pembayaran untuk kelas ini',
          code: 'PENDING_EXISTS'
        },
        { status: 409 }
      )
    }

    // Prepare transaction details
    const transactionDetails = {
      transaction_details: {
        order_id: orderId,
        gross_amount: course.price || 0,
      },
      item_details: [
        {
          id: course.id,
          name: course.title,
          price: course.price || 0,
          quantity: 1,
          category: course.category || 'E-Course',
        },
      ],
      customer_details: {
        first_name: verifiedUser.full_name?.split(' ')[0] || userName?.split(' ')[0] || 'Customer',
        last_name: verifiedUser.full_name?.split(' ').slice(1).join(' ') || userName?.split(' ').slice(1).join(' ') || '',
        email: verifiedUser.email || userEmail || 'customer@example.com',
      },
      callbacks: {
        finish: finishUrl.toString(),
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/error?orderId=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/pending?orderId=${orderId}`,
      },
      // Expiry: 24 hours
      expiry: {
        start: Date.now(),
        unit: 'hours',
        duration: 24,
      },
      // Custom data for webhook processing
      // IMPORTANT: Always use verifiedUser.id from database, not userId from request body
      // This ensures the correct user gets enrolled even if frontend sends wrong data
      custom_field1: course.id,
      custom_field2: verifiedUser.id, // Use verified user ID from database
      custom_field3: verifiedUser.email || userEmail || '',
    }

    console.log('Creating transaction:', {
      orderId,
      courseId: course.id,
      courseSlug: course.slug,
      price: course.price,
      userId: verifiedUser.id,
      userEmail: verifiedUser.email,
      customFields: {
        course_id: course.id,
        user_id: verifiedUser.id,
        email: verifiedUser.email
      }
    })

    // Create Snap transaction
    const snapTransaction = await midtransClient.createTransaction(transactionDetails)

    console.log('Transaction created successfully:', orderId)

    return NextResponse.json({
      success: true,
      token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url,
      client_key: getClientKey(),
      order_id: orderId,
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
      },
    })
  } catch (error) {
    const details = error?.ApiResponse?.status_message || error?.message || 'Unknown error'
    console.error('Error creating transaction:', details)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create transaction',
        details,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
