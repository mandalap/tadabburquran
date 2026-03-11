import { queryOne, queryAll } from '@/lib/db'
import { auth } from '@/lib/auth'
import { existsSync } from 'fs'
import path from 'path'
import { unlink } from 'fs/promises'

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

async function deleteOldAvatar(url) {
  if (!url || url.startsWith('/images/')) return
  const filepath = path.join(process.cwd(), 'public', url)
  if (filepath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
    if (existsSync(filepath)) {
      try {
        await unlink(filepath)
      } catch (error) {
        console.error('Failed to delete old avatar:', error)
      }
    }
  }
}

// PUT - Update creator
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
      gelar_depan = '',
      title = '',
      specialty = '',
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

    const currentCreator = await queryOne('SELECT is_featured, avatar FROM creators WHERE id = \$1', [id])
    if (!currentCreator) {
      return Response.json({ error: 'Creator not found' }, { status: 404 })
    }

    if (is_featured && !currentCreator.is_featured) {
      const featuredCount = await queryOne(
        'SELECT COUNT(*) as count FROM creators WHERE is_featured = true'
      )
      if (parseInt(featuredCount.count) >= 5) {
        return Response.json({ error: 'Maksimal 5 kreator featured' }, { status: 400 })
      }
    }

    if (avatar && avatar !== currentCreator.avatar) {
      await deleteOldAvatar(currentCreator.avatar)
    }

    const creator = await queryOne(
      `UPDATE creators SET
        name = $1, slug = $2, gelar_depan = $3, title = $4, specialty = $5, bio = $6, avatar = $7,
        rating = $8, reviews = $9, courses_count = $10, students_count = $11,
        is_featured = $12, is_top_creator = $13, sort_order = $14, is_active = $15,
        social_youtube = $16, social_instagram = $17, social_telegram = $18, creator_type = $19, updated_at = NOW()
       WHERE id = $20
       RETURNING *`,
      [name, slug, gelar_depan, title, specialty, bio, avatar, rating, reviews, courses_count, students_count,
        is_featured, is_top_creator, sort_order, is_active, social_youtube, social_instagram, social_telegram, creator_type, id]
    )

    return Response.json(creator)
  } catch (error) {
    console.error('Error updating creator:', error)
    if (error.code === '23505') {
      return Response.json({ error: 'Creator name or slug already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete creator
export async function DELETE(request, { params }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const creator = await queryOne('SELECT avatar FROM creators WHERE id = \$1', [id])
    if (!creator) {
      return Response.json({ error: 'Creator not found' }, { status: 404 })
    }
    await deleteOldAvatar(creator.avatar)
    await queryOne('DELETE FROM creators WHERE id = \$1 RETURNING *', [id])
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting creator:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Toggle featured/top creator status
export async function PATCH(request, { params }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const { is_featured, is_top_creator } = body
    const currentCreator = await queryOne('SELECT is_featured, is_top_creator FROM creators WHERE id = \$1', [id])
    if (!currentCreator) {
      return Response.json({ error: 'Creator not found' }, { status: 404 })
    }
    if (is_featured !== undefined && is_featured && !currentCreator.is_featured) {
      const featuredCount = await queryOne(
        'SELECT COUNT(*) as count FROM creators WHERE is_featured = true'
      )
      if (parseInt(featuredCount.count) >= 5) {
        return Response.json({ error: 'Maksimal 5 kreator featured' }, { status: 400 })
      }
    }
    const updates = []
    const values = []
    let paramIndex = 1
    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramIndex++}`)
      values.push(is_featured)
    }
    if (is_top_creator !== undefined) {
      updates.push(`is_top_creator = $${paramIndex++}`)
      values.push(is_top_creator)
    }
    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }
    values.push(id)
    const creator = await queryOne(
      `UPDATE creators SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return Response.json(creator)
  } catch (error) {
    console.error('Error updating creator:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
