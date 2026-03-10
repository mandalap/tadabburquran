import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'

// GET - Get current user data
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await queryOne(
      'SELECT id, email, full_name, avatar_url, phone, bio, role, created_at, updated_at, password_hash IS NOT NULL as has_password FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update user profile (name, phone, bio)
export async function PATCH(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone, bio } = body

    // Get current user
    const currentUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update query dynamically based on provided fields
    const updates = []
    const values = []
    let paramIndex = 1

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`)
      values.push(full_name)
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`)
      values.push(phone || null)
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`)
      values.push(bio || null)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(currentUser.id)

    const updatedUser = await queryOne(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, avatar_url, phone, bio, role, created_at, updated_at, password_hash IS NOT NULL as has_password`,
      values
    )

    return NextResponse.json({ user: updatedUser, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user role (for fixing incorrect roles)
export async function PUT(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Only allow users to change their own role from 'admin' to 'user'
    // Or if they are already an admin changing someone else's role
    const currentUser = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Allow self-change from admin to user (security fix)
    if (currentUser.role !== 'admin' && currentUser.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedUser = await queryOne(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, full_name, avatar_url, role, created_at',
      [role, session.user.email]
    )

    return NextResponse.json({ user: updatedUser, message: 'Role updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
