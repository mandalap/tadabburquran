import { queryOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return Response.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    const tokenRow = await queryOne(
      `SELECT user_id FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    )

    if (!tokenRow) {
      return Response.json({ error: 'Token kedaluwarsa atau tidak valid. Silakan request reset password baru.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await queryOne(
      `UPDATE users SET password_hash = $1, email_verified = true, updated_at = NOW()
       WHERE id = $2`,
      [hashed, tokenRow.user_id]
    )
    await queryOne('DELETE FROM password_reset_tokens WHERE token = $1', [token])

    return Response.json({ success: true, message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json({ error: 'Gagal reset password' }, { status: 500 })
  }
}
