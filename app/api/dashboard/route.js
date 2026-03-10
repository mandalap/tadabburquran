import { NextResponse } from 'next/server'
import { queryAll, queryOne } from '@/lib/db'

// GET /api/dashboard - Get user dashboard data (enrolled courses & purchase history)
export async function GET(req) {
  try {
    console.log('Fetching dashboard data...')
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    const enrolledCourses = await queryAll(
      `
      SELECT DISTINCT ON (e.user_id, e.course_id)
        e.id as enrollment_id,
        e.enrolled_at,
        e.completed_at,
        e.progress,
        c.id,
        c.slug,
        c.title,
        c.short_description,
        c.instructor,
        c.instructor_title,
        c.instructors,
        c.category,
        c.course_type,
        c.price,
        c.cover,
        c.duration,
        c.event_date,
        c.rating,
        c.reviews,
        c.students,
        c.video_preview,
        c.modules
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      ${userId ? 'WHERE e.user_id = $1' : ''}
      ORDER BY e.user_id, e.course_id, e.enrolled_at DESC
      LIMIT 10
    `,
      userId ? [userId] : []
    )

    console.log(`Found ${enrolledCourses.length} enrolled courses`)

    // Add instructor avatars to enrolled courses
    const coursesWithInstructors = await Promise.all(enrolledCourses.map(async (course) => {
      let instructors = []

      // Try to use instructors array from database
      if (course.instructors && Array.isArray(course.instructors) && course.instructors.length > 0) {
        // Get creator details for each instructor
        const creatorIds = course.instructors.map(i => i.creator_id).filter(id => id)
        if (creatorIds.length > 0) {
          const placeholders = creatorIds.map((_, i) => `$${i + 1}`).join(',')
          const creators = await queryAll(
            `SELECT id, name, slug, title, avatar, rating, reviews
             FROM creators
             WHERE id IN (${placeholders})`,
            creatorIds
          )

          // Map creators to instructors with their details
          instructors = course.instructors
            .map(i => {
              const creator = creators.find(c => c.id === i.creator_id)
              return {
                creator_id: i.creator_id,
                name: i.name,
                avatar: creator?.avatar || null,
                rating: creator?.rating || 0,
                reviews: creator?.reviews || 0,
                title: creator?.title || ''
              }
            })
            .filter(i => i.name) // Only include instructors with names
        }
      } else if (course.instructor) {
        // Fallback: try to find creator by name
        try {
          const creator = await queryOne(
            `SELECT id, name, slug, title, avatar, rating, reviews
             FROM creators
             WHERE LOWER(name) = LOWER($1)`,
            [course.instructor]
          )
          if (creator) {
            instructors = [{
              creator_id: creator.id,
              name: creator.name,
              avatar: creator.avatar,
              rating: creator.rating,
              reviews: creator.reviews,
              title: creator.title
            }]
          }
        } catch (e) {
          // Ignore error
        }
      }

      return {
        ...course,
        instructors
      }
    }))

    const purchaseHistory = await queryAll(
      `
      SELECT
        o.id,
        o.course_name,
        o.price,
        o.payment_method,
        o.payment_status,
        o.transaction_id,
        o.paid_at,
        o.created_at,
        c.slug,
        c.cover,
        c.category
      FROM orders o
      LEFT JOIN courses c ON o.course_id = c.id
      ${userId ? 'WHERE o.user_id = $1' : ''}
      ORDER BY o.created_at DESC
      LIMIT 10
    `,
      userId ? [userId] : []
    )

    console.log(`Found ${purchaseHistory.length} orders`)

    // Format purchase history for display
    const formattedHistory = purchaseHistory.map(item => ({
      id: item.id,
      courseName: item.course_name,
      price: item.price,
      paymentMethod: getPaymentMethodName(item.payment_method),
      paymentStatus: item.payment_status,
      status: getStatusLabel(item.payment_status),
      transactionId: item.transaction_id,
      date: item.paid_at ? formatDate(item.paid_at) : formatDate(item.created_at),
      cover: item.cover,
      category: item.category,
      slug: item.slug
    }))

    return NextResponse.json({
      enrolledCourses: coursesWithInstructors,
      purchaseHistory: formattedHistory
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
function getPaymentMethodName(method) {
  const methods = {
    'qris': 'QRIS',
    'gopay': 'GoPay',
    'dana': 'DANA',
    'ovo': 'OVO',
    'shopeepay': 'ShopeePay',
    'bank_transfer': 'Transfer Bank',
    'credit_card': 'Kartu Kredit'
  }
  return methods[method] || method || '-'
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Menunggu Pembayaran',
    'paid': 'Berhasil',
    'failed': 'Gagal',
    'expired': 'Kadaluarsa'
  }
  return labels[status] || status
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
