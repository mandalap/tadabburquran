import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      slug,
      category_id,
      sort_order = 0,
      is_active = true
    } = body

    if (!name || !slug || !category_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const type = await queryOne(
      `UPDATE course_types SET
        name = $1, slug = $2, category_id = $3, sort_order = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, slug, category_id, sort_order, is_active, id]
    )

    if (!type) {
      return Response.json({ error: 'Type not found' }, { status: 404 })
    }

    return Response.json(type)
  } catch (error) {
    console.error('Error updating course type:', error)
    if (error.code === '23505') {
      return Response.json({ error: 'Type name or slug already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const type = await queryOne(
      'DELETE FROM course_types WHERE id = $1 RETURNING *',
      [id]
    )

    if (!type) {
      return Response.json({ error: 'Type not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting course type:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
