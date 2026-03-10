import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// PUT - Update category
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
      description = '',
      icon = '',
      color = 'text-gray-600',
      sort_order = 0,
      is_active = true,
      type = 'ecourse',
      show_on_homepage = true
    } = body

    if (!name || !slug) {
      return Response.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    let category
    try {
      // Coba update dengan kolom type dan show_on_homepage
      category = await queryOne(
        `UPDATE categories SET
          name = $1, slug = $2, description = $3, icon = $4, color = $5,
          sort_order = $6, is_active = $7, type = $8, show_on_homepage = $9, updated_at = NOW()
         WHERE id = $10
         RETURNING *`,
        [name, slug, description, icon, color, sort_order, is_active, type, show_on_homepage, id]
      )
    } catch (e) {
      // Fallback jika kolom type belum ada
      category = await queryOne(
        `UPDATE categories SET
          name = $1, slug = $2, description = $3, icon = $4, color = $5,
          sort_order = $6, is_active = $7, updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [name, slug, description, icon, color, sort_order, is_active, id]
      )
    }

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    return Response.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    if (error.code === '23505') {
      return Response.json({ error: 'Category name or slug already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const category = await queryOne(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    )

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
