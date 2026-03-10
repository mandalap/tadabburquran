import nodemailer from 'nodemailer'

const resendEndpoint = 'https://api.resend.com/emails'
const mailtrapEndpoint = 'https://send.api.mailtrap.io/api/send'

export async function sendEmail({ to, subject, html, text }) {
  const fromAddress = process.env.MAIL_FROM_ADDRESS
  const fromName = process.env.MAIL_FROM_NAME
  const fromEmail = process.env.EMAIL_FROM
    || (fromAddress ? `${fromName || 'TadabburQuran'} <${fromAddress}>` : null)
    || 'TadabburQuran <noreply@tadabburquran.id>'
  const resendKey = process.env.RESEND_API_KEY
  const mailtrapToken = process.env.MAILTRAP_TOKEN

  const smtpHost = process.env.MAIL_HOST
  const smtpPort = Number(process.env.MAIL_PORT || 587)
  const smtpUser = process.env.MAIL_USERNAME
  const smtpPass = process.env.MAIL_PASSWORD
  const smtpEncryption = (process.env.MAIL_ENCRYPTION || '').toLowerCase()

  // SMTP Transport (Mailtrap, Gmail, etc.)
  if (smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpEncryption === 'ssl' || smtpPort === 465,
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
        tls: smtpEncryption === 'tls' ? { rejectUnauthorized: false } : undefined
      })
      await transporter.sendMail({
        from: fromEmail,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
        text
      })
      console.log(`✅ Email sent via SMTP to ${to}`)
      return true
    } catch (error) {
      console.error('❌ SMTP Error:', error.message)
      return false
    }
  }

  // Resend API
  if (resendKey) {
    try {
      const response = await fetch(resendEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text
        })
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`Resend error: ${body}`)
      }
      console.log(`✅ Email sent via Resend to ${to}`)
      return true
    } catch (error) {
      console.error('❌ Resend Error:', error.message)
      return false
    }
  }

  // Mailtrap API
  if (mailtrapToken) {
    try {
      const response = await fetch(mailtrapEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mailtrapToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: { email: fromEmail },
          to: [{ email: Array.isArray(to) ? to[0] : to }],
          subject,
          html,
          text
        })
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`Mailtrap error: ${body}`)
      }
      console.log(`✅ Email sent via Mailtrap to ${to}`)
      return true
    } catch (error) {
      console.error('❌ Mailtrap Error:', error.message)
      return false
    }
  }

  // No email provider configured - log to console
  console.log('\n╔════════════════════════════════════════════════════════════════════╗')
  console.log('║ 📧 EMAIL SERVICE NOT CONFIGURED                                ║')
  console.log('╠════════════════════════════════════════════════════════════════════╣')
  console.log(`║ To:      ${to.padEnd(55)}║`)
  console.log(`║ Subject: ${subject.padEnd(55)}║`)
  console.log('╠════════════════════════════════════════════════════════════════════╣')
  console.log('║ Configure one of these in .env.local:                             ║')
  console.log('║ 1. SMTP: MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD       ║')
  console.log('║ 2. Mailtrap API: MAILTRAP_TOKEN                                   ║')
  console.log('║ 3. Resend: RESEND_API_KEY                                         ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝')
  console.log(`\nHTML Preview (first 300 chars):\n${html.substring(0, 300)}...\n`)

  return false
}
