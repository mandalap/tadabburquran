import { queryOne } from '@/lib/db'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'
import { resetPasswordEmailTemplate } from '@/lib/email/templates'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return Response.json({ error: 'Email diperlukan' }, { status: 400 })
    }

    const user = await queryOne('SELECT id, email, full_name FROM users WHERE email = $1', [email])
    if (!user) {
      // Return success even if user not found (security best practice)
      return Response.json({ success: true, message: 'Jika email terdaftar, tautan reset password akan dikirim.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    await queryOne('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id])
    await queryOne(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [user.id, token]
    )

    // Try to send email, but don't fail if email is not configured
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/auth/reset?token=${token}`
      const template = resetPasswordEmailTemplate({ name: user.full_name, resetUrl })
      await sendEmail({ to: user.email, ...template })
    } catch (emailError) {
      // If email is not configured, log a warning but don't fail the request
      console.warn('Email not configured or failed to send password reset:', emailError.message)
    }

    return Response.json({ success: true, message: 'Jika email terdaftar, tautan reset password akan dikirim.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Gagal memproses permintaan' }, { status: 500 })
  }
}
