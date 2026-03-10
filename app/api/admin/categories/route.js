import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET - Fetch all categories
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Coba ambil dengan kolom show_on_homepage
    let categories
    try {
      categories = await queryAll(
        `SELECT id, name, slug, description, icon, color, sort_order, is_active, show_on_homepage, created_at
         FROM categories
         ORDER BY sort_order ASC, name ASC`
      )
    } catch (e) {
      // Fallback jika kolom show_on_homepage belum ada
      categories = await queryAll(
        `SELECT id, name, slug, description, icon, color, sort_order, is_active, created_at
         FROM categories
         ORDER BY sort_order ASC, name ASC`
      )
      // Tambahkan default values
      categories = categories.map(c => ({ ...c, show_on_homepage: true }))
    }

    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description = '',
      icon = 'book-open',
      color = 'text-gray-600',
      sort_order = 0,
      is_active = true,
      show_on_homepage = true
    } = body

    if (!name || !slug) {
      return Response.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    let category
    try {
      // Coba insert dengan kolom show_on_homepage
      category = await queryOne(
        `INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active, show_on_homepage)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, slug, description, icon, color, sort_order, is_active, show_on_homepage]
      )
    } catch (e) {
      // Fallback jika kolom show_on_homepage belum ada
      category = await queryOne(
        `INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, slug, description, icon, color, sort_order, is_active]
      )
    }

    return Response.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    if (error.code === '23505') {
      return Response.json({ error: 'Category name or slug already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
