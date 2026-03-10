import { NextResponse } from 'next/server'
import { queryOne, queryAll } from '@/lib/db'

// GET /api/reviews - Get reviews by course_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('course_id')

    if (!courseId) {
      return NextResponse.json({ error: 'course_id is required' }, { status: 400 })
    }

    const reviews = await queryAll(`
      SELECT r.id, r.user_id, r.course_id, r.rating, r.comment, r.created_at,
             u.full_name, u.avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [courseId])

    // Calculate average rating
    const stats = await queryOne(`
      SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM reviews
      WHERE course_id = $1
    `, [courseId])

    // Get rating distribution
    const distribution = await queryAll(`
      SELECT
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE course_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [courseId])

    return NextResponse.json({
      reviews,
      stats: {
        total: parseInt(stats.total_reviews) || 0,
        average: parseFloat(stats.average_rating) || 0
      },
      distribution
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/reviews - Create a new review
export async function POST(req) {
  try {
    const body = await req.json()
    const { course_id, user_id, rating, comment } = body

    // Validation
    if (!course_id || !user_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user already reviewed this course
    const existing = await queryOne(`
      SELECT id FROM reviews WHERE course_id = $1 AND user_id = $2
    `, [course_id, user_id])

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 })
    }

    if (process.env.REVIEWS_REQUIRE_ENROLLMENT === 'true') {
      const enrolled = await queryOne(`
        SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2
      `, [course_id, user_id])

      if (!enrolled) {
        return NextResponse.json({ error: 'You must be enrolled to review' }, { status: 403 })
      }
    }

    // Create review
    const result = await queryOne(`
      INSERT INTO reviews (course_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [course_id, user_id, rating, comment || ''])

    // Update course rating
    await updateCourseRating(course_id)

    return NextResponse.json({
      success: true,
      review: result
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function updateCourseRating(courseId) {
  try {
    const stats = await queryOne(`
      SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM reviews
      WHERE course_id = $1
    `, [courseId])

    await queryOne(`
      UPDATE courses
      SET rating = $1, reviews = $2
      WHERE id = $3
    `, [parseFloat(stats.average_rating).toFixed(1), parseInt(stats.total_reviews), courseId])
  } catch (error) {
    console.error('Error updating course rating:', error)
  }
}
