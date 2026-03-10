export const verificationEmailTemplate = ({ name, verifyUrl }) => {
  const subject = 'Verifikasi Email - TadabburQuran.id'
  const text = `Assalamu'alaikum ${name || ''}\n\nTerima kasih sudah mendaftar. Silakan verifikasi email Anda dengan membuka tautan berikut:\n${verifyUrl}\n\nJika Anda tidak merasa mendaftar, abaikan email ini.\n\nTadabburQuran.id`
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;">
      <h2>Verifikasi Email</h2>
      <p>Assalamu'alaikum ${name || ''},</p>
      <p>Terima kasih sudah mendaftar. Silakan verifikasi email Anda dengan tombol berikut:</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;background:#d4a017;color:#111;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
          Verifikasi Email
        </a>
      </p>
      <p>Jika tombol tidak berfungsi, salin tautan ini:</p>
      <p>${verifyUrl}</p>
      <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
      <p>Salam,<br/>TadabburQuran.id</p>
    </div>
  `
  return { subject, text, html }
}

export const resetPasswordEmailTemplate = ({ name, resetUrl }) => {
  const subject = 'Reset Password - TadabburQuran.id'
  const text = `Assalamu'alaikum ${name || ''}\n\nKami menerima permintaan reset password. Silakan buka tautan berikut:\n${resetUrl}\n\nJika Anda tidak meminta reset password, abaikan email ini.\n\nTadabburQuran.id`
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;">
      <h2>Reset Password</h2>
      <p>Assalamu'alaikum ${name || ''},</p>
      <p>Kami menerima permintaan reset password. Klik tombol berikut:</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;background:#d4a017;color:#111;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
      </p>
      <p>Jika tombol tidak berfungsi, salin tautan ini:</p>
      <p>${resetUrl}</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      <p>Salam,<br/>TadabburQuran.id</p>
    </div>
  `
  return { subject, text, html }
}
