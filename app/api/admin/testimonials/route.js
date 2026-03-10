import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET - Fetch all testimonials with pagination
export async function GET(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const offset = (page - 1) * limit

    const testimonials = await queryAll(
      `SELECT id, name, role, message, rating, avatar, is_approved, is_visible, created_at
       FROM testimonials
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return Response.json(testimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new testimonial
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, role = '', message, rating = 5, avatar = '' } = body

    if (!name || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const testimonial = await queryOne(
      `INSERT INTO testimonials (name, role, message, rating, avatar, is_approved, is_visible)
       VALUES ($1, $2, $3, $4, $5, true, true)
       RETURNING *`,
      [name, role, message, rating, avatar]
    )

    return Response.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
