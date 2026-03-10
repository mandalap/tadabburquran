import { queryAll } from '@/lib/db'

// GET - Fetch public testimonials (approved and visible only, max 9, random order)
export async function GET() {
  try {
    const testimonials = await queryAll(
      `SELECT id, name, role, message, avatar, rating, created_at
       FROM testimonials
       WHERE is_approved = true AND is_visible = true
       ORDER BY RANDOM()
       LIMIT 9`
    )

    return Response.json({ testimonials })
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return Response.json({ testimonials: [] })
  }
}
