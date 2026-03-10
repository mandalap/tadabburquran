import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// PATCH - Update user (role, email_verified, password)
export async function PATCH(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { role, email_verified, password } = body

    // Build dynamic update query
    const updates = []
    const values = []
    let paramIndex = 1

    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`)
      values.push(role)
    }
    if (email_verified !== undefined) {
      updates.push(`email_verified = $${paramIndex++}`)
      values.push(email_verified)
    }
    if (password) {
      // Validate password strength
      if (password.length < 6) {
        return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
      }
      const passwordHash = await bcrypt.hash(password, 10)
      updates.push(`password_hash = $${paramIndex++}`)
      values.push(passwordHash)
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)

    const user = await queryOne(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, avatar_url, role, email_verified, created_at`,
      values
    )

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Prevent deleting yourself
    if (session.user.id === id) {
      return Response.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    const user = await queryOne(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    )

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
