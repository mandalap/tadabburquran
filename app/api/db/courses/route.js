import { NextResponse } from 'next/server'
import { queryAll, queryOne, cachedQuery, invalidateCache } from '@/lib/db'

// GET all courses or single course by ID
export async function GET(request) {
  const { pathname } = new URL(request.url)
  const pathSegments = pathname.split('/')

  try {
    // Get single course by ID
    // /api/db/courses/:id
    if (pathSegments[pathSegments.length - 2] === 'courses') {
      const courseId = pathSegments[pathSegments.length - 1]

      const course = await cachedQuery(
        `course:${courseId}`,
        () => queryOne(
          `SELECT * FROM course_summary WHERE id = $1`,
          [courseId]
        ),
        300 // Cache 5 menit
      )

      if (!course) {
        return NextResponse.json(
          { success: false, message: 'Course not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, course })
    }

    // Get all courses with caching
    const courses = await cachedQuery(
      'courses:all:published',
      () => queryAll(`
        SELECT
          id, title, short_description, instructor, instructor_title,
          category, price, original_price, rating, reviews, students,
          duration, cover
        FROM courses
        WHERE is_published = true
        ORDER BY created_at DESC
      `),
      300 // Cache 5 menit
    )

    return NextResponse.json({
      success: true,
      courses,
      total: courses.length
    })
  } catch (error) {
    console.error('Courses API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Database error', error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new course
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      title,
      short_description,
      description,
      instructor,
      instructor_title,
      instructor_bio,
      category,
      price,
      original_price,
      duration,
      cover
    } = body

    // Insert course
    const result = await queryOne(`
      INSERT INTO courses (
        title, short_description, description, instructor, instructor_title,
        instructor_bio, category, price, original_price, duration, cover
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      title, short_description, description, instructor, instructor_title,
      instructor_bio, category, price, original_price, duration, cover
    ])

    // Invalidate cache
    await invalidateCache('courses:*')

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course: result
    })
  } catch (error) {
    console.error('Create Course Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create course', error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update course
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')

    const values = [id, ...Object.values(updateData)]

    const result = await queryOne(`
      UPDATE courses
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values)

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // Invalidate cache
    await invalidateCache('courses:*')
    await invalidateCache(`course:${id}`)

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course: result
    })
  } catch (error) {
    console.error('Update Course Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update course', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete course
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      )
    }

    const result = await queryOne(`
      DELETE FROM courses WHERE id = $1 RETURNING id
    `, [id])

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // Invalidate cache
    await invalidateCache('courses:*')
    await invalidateCache(`course:${id}`)

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Delete Course Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete course', error: error.message },
      { status: 500 }
    )
  }
}
