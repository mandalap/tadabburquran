import { queryOne } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { slug } = await params

    const course = await queryOne(
      `SELECT * FROM courses WHERE slug = $1`,
      [slug]
    )

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 })
    }

    return Response.json({ course })
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
