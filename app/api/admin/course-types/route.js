import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let types
    try {
      types = await queryAll(
        `SELECT ct.id, ct.category_id, ct.name, ct.slug, ct.sort_order, ct.is_active, ct.created_at,
          c.name as category_name
         FROM course_types ct
         LEFT JOIN categories c ON ct.category_id = c.id
         ORDER BY ct.sort_order ASC, ct.name ASC`
      )
    } catch (error) {
      types = []
    }

    return Response.json(types)
  } catch (error) {
    console.error('Error fetching course types:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      category_id,
      sort_order = 0,
      is_active = true
    } = body

    if (!name || !slug || !category_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const type = await queryOne(
      `INSERT INTO course_types (name, slug, category_id, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, slug, category_id, sort_order, is_active]
    )

    return Response.json(type, { status: 201 })
  } catch (error) {
    console.error('Error creating course type:', error)
    if (error.code === '23505') {
      return Response.json({ error: 'Type name or slug already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
