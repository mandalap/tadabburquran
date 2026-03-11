import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - Fetch all creators
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creators = await queryAll(
      `SELECT id, name, slug, specialty, gelar_depan, title, bio, avatar, rating, reviews,
        courses_count, students_count, is_featured, is_top_creator, sort_order,
        is_active, social_youtube, social_instagram, social_telegram, creator_type, created_at
       FROM creators
       ORDER BY is_top_creator DESC, sort_order ASC, name ASC`
    )

    return Response.json(creators)
  } catch (error) {
    console.error('Error fetching creators:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new creator
export async function POST(request) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      specialty = '',
      gelar_depan = '',
      title = '',
      bio = '',
      avatar = '',
      rating = 0,
      reviews = 0,
      courses_count = 0,
      students_count = 0,
      is_featured = false,
      is_top_creator = false,
      sort_order = 0,
      is_active = true,
      social_youtube = '',
      social_instagram = '',
      social_telegram = '',
      creator_type = 'ustadz'
    } = body

    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    // Slug HANYA dari name, tanpa gelar
    const slug = slugify(name)

    if (!slug) {
      return Response.json({ error: 'Could not generate a valid slug from name' }, { status: 400 })
    }

    if (is_featured) {
      const featuredCount = await queryOne(
        'SELECT COUNT(*) as count FROM creators WHERE is_featured = true'
      )
      if (parseInt(featuredCount.count) >= 5) {
        return Response.json({ error: 'Maksimal 5 kreator featured' }, { status: 400 })
      }
    }

    const creator = await queryOne(
      `INSERT INTO creators (name, slug, specialty, gelar_depan, title, bio, avatar,
        rating, reviews, courses_count, students_count, is_featured, is_top_creator,
        sort_order, is_active, social_youtube, social_instagram, social_telegram, creator_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [name, slug, specialty, gelar_depan, title, bio, avatar, rating, reviews,
        courses_count, students_count, is_featured, is_top_creator, sort_order, is_active,
        social_youtube, social_instagram, social_telegram, creator_type]
    )

    return Response.json(creator, { status: 201 })
  } catch (error) {
    console.error('Error creating creator:', error)
    if (error.code === '23505') {
      return Response.json({ error: 'Creator name or slug already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
