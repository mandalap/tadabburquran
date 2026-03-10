import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST - Change user password or Set password for OAuth user
export async function POST(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword, isSettingPassword } = body

    // Validate new password
    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    // Get current user with password hash
    const user = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasPassword = !!user.password_hash

    // Scenario 1: User already has password - need to verify current password
    if (hasPassword && !isSettingPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 401 })
      }
    }

    // Scenario 2: OAuth user setting password for the first time
    // No need to verify current password

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await queryOne(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [newPasswordHash, user.id]
    )

    const message = hasPassword
      ? 'Password berhasil diubah'
      : 'Password berhasil dibuat. Anda sekarang bisa login dengan email dan password.'

    return NextResponse.json({
      message,
      hasPassword: true
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
