import { queryOne } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return Response.json({ error: 'Token tidak valid' }, { status: 400 })
    }

    const tokenRow = await queryOne(
      `SELECT evt.user_id, u.email_verified
       FROM email_verification_tokens evt
       JOIN users u ON evt.user_id = u.id
       WHERE evt.token = $1 AND evt.expires_at > NOW()`,
      [token]
    )

    // Token tidak ditemukan atau sudah kedaluwarsa
    if (!tokenRow) {
      // Cek apakah token pernah ada (sudah digunakan)
      const userCheck = await queryOne(
        `SELECT u.email_verified FROM users u
         WHERE u.email_verified = true
         LIMIT 1`
      )
      if (userCheck) {
        return Response.json({ error: 'Email sudah diverifikasi sebelumnya. Silakan login.' }, { status: 200 })
      }
      return Response.json({ error: 'Token kedaluwarsa atau tidak valid' }, { status: 400 })
    }

    // User sudah verified, hapus token dan return success
    if (tokenRow.email_verified) {
      await queryOne('DELETE FROM email_verification_tokens WHERE user_id = $1', [tokenRow.user_id])
      return Response.json({ success: true, message: 'Email sudah diverifikasi sebelumnya' })
    }

    // Verifikasi email
    await queryOne(
      `UPDATE users SET email_verified = true, updated_at = NOW()
       WHERE id = $1`,
      [tokenRow.user_id]
    )
    await queryOne('DELETE FROM email_verification_tokens WHERE token = $1', [token])

    return Response.json({ success: true, message: 'Email berhasil diverifikasi' })
  } catch (error) {
    console.error('Verify email error:', error)
    return Response.json({ error: 'Gagal verifikasi email' }, { status: 500 })
  }
}
