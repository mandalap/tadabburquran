import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

// Helper: Delete avatar file
async function deleteAvatarFile(avatarUrl) {
  if (avatarUrl && avatarUrl.includes('/uploads/testimonials/')) {
    const filename = avatarUrl.split('/').pop()
    const filepath = join(process.cwd(), 'public', 'uploads', 'testimonials', filename)
    try {
      await unlink(filepath)
    } catch (err) {
      // File might not exist, ignore error
      console.log('Avatar file not found or already deleted:', filename)
    }
  }
}

// PATCH - Update testimonial (approve/visible status)
export async function PATCH(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { is_approved, is_visible } = body

    // Build dynamic update query
    const updates = []
    const values = []
    let paramIndex = 1

    if (is_approved !== undefined) {
      updates.push(`is_approved = $${paramIndex++}`)
      values.push(is_approved)
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramIndex++}`)
      values.push(is_visible)
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)

    const testimonial = await queryOne(
      `UPDATE testimonials SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    if (!testimonial) {
      return Response.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return Response.json(testimonial)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update testimonial full
export async function PUT(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, role = '', message, rating = 5, avatar = '' } = body

    if (!name || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const testimonial = await queryOne(
      `UPDATE testimonials SET name = $1, role = $2, message = $3, rating = $4, avatar = $5
       WHERE id = $6 RETURNING *`,
      [name, role, message, rating, avatar, id]
    )

    if (!testimonial) {
      return Response.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return Response.json(testimonial)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete testimonial
export async function DELETE(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get testimonial first to delete avatar file
    const testimonial = await queryOne(
      'SELECT * FROM testimonials WHERE id = $1',
      [id]
    )

    if (!testimonial) {
      return Response.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Delete avatar file if exists
    if (testimonial.avatar) {
      await deleteAvatarFile(testimonial.avatar)
    }

    // Delete from database
    await queryOne(
      'DELETE FROM testimonials WHERE id = $1 RETURNING *',
      [id]
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
