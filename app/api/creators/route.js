import { queryAll } from '@/lib/db'

// GET - Fetch creators for public display
// Query params:
//   - all=true: get all active creators (not just featured)
//   - featured=true: get only featured creators (default)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const getAll = searchParams.get('all') === 'true'

    let query = `SELECT id, name, slug, specialty, title, bio, avatar, rating, reviews,
        courses_count, students_count, is_featured, is_top_creator, sort_order
       FROM creators
       WHERE is_active = true`

    if (!getAll) {
      query += ' AND is_featured = true'
    }

    query += ' ORDER BY is_top_creator DESC, sort_order ASC'

    const creators = await queryAll(query)

    return Response.json(creators)
  } catch (error) {
    console.error('Error fetching creators:', error)
    return Response.json([], { status: 200 })
  }
}
