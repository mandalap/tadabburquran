import { queryAll } from '@/lib/db'

export async function GET() {
  try {
    let types
    try {
      types = await queryAll(
        `SELECT ct.id, ct.category_id, ct.name, ct.slug, ct.sort_order, ct.is_active,
          c.name as category_name
         FROM course_types ct
         LEFT JOIN categories c ON ct.category_id = c.id
         WHERE ct.is_active = true
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
