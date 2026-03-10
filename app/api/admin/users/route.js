import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET - Fetch all users
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await queryAll(
      `SELECT id, email, full_name, avatar_url, role, email_verified, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    )

    return Response.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
