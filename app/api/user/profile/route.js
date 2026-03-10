import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// PATCH - Update user profile
export async function PATCH(request) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name } = body

    // Validate input
    if (!full_name || full_name.trim().length === 0) {
      return Response.json({ error: 'Nama lengkap diperlukan' }, { status: 400 })
    }

    // Update user profile
    const user = await queryOne(
      'UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, avatar_url, role',
      [full_name.trim(), session.user.id]
    )

    if (!user) {
      return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return Response.json({
      success: true,
      user,
      message: 'Profil berhasil diperbarui'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get user profile
export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await queryOne(
      'SELECT id, email, full_name, avatar_url, role, email_verified, created_at FROM users WHERE id = $1',
      [session.user.id]
    )

    if (!user) {
      return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return Response.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
