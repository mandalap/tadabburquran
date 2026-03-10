import { NextResponse } from 'next/server'
import { queryAll, queryOne, cachedQuery, invalidateCache } from '@/lib/db'

// GET all testimonials
export async function GET() {
  try {
    const testimonials = await cachedQuery(
      'testimonials:all:visible',
      () => queryAll(`
        SELECT id, name, role, message, avatar, created_at
        FROM testimonials
        WHERE is_visible = true
        ORDER BY created_at DESC
      `),
      600 // Cache 10 menit
    )

    return NextResponse.json({
      success: true,
      testimonials,
      total: testimonials.length
    })
  } catch (error) {
    console.error('Testimonials API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Database error', error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new testimonial
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, role, message, avatar } = body

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: 'Name and message are required' },
        { status: 400 }
      )
    }

    const result = await queryOne(`
      INSERT INTO testimonials (name, role, message, avatar)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, role || 'Pelanggan', message, avatar || null])

    // Invalidate cache
    await invalidateCache('testimonials:*')

    return NextResponse.json({
      success: true,
      message: 'Testimonial created successfully',
      testimonial: result
    })
  } catch (error) {
    console.error('Create Testimonial Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create testimonial', error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update testimonial
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, name, role, message, avatar, is_visible } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Testimonial ID is required' },
        { status: 400 }
      )
    }

    const result = await queryOne(`
      UPDATE testimonials
      SET name = COALESCE($2, name),
          role = COALESCE($3, role),
          message = COALESCE($4, message),
          avatar = COALESCE($5, avatar),
          is_visible = COALESCE($6, is_visible)
      WHERE id = $1
      RETURNING *
    `, [id, name, role, message, avatar, is_visible])

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Invalidate cache
    await invalidateCache('testimonials:*')

    return NextResponse.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial: result
    })
  } catch (error) {
    console.error('Update Testimonial Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update testimonial', error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete testimonial
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Testimonial ID is required' },
        { status: 400 }
      )
    }

    const result = await queryOne(`
      DELETE FROM testimonials WHERE id = $1 RETURNING id
    `, [id])

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Invalidate cache
    await invalidateCache('testimonials:*')

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    })
  } catch (error) {
    console.error('Delete Testimonial Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete testimonial', error: error.message },
      { status: 500 }
    )
  }
}
