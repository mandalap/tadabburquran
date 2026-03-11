/**
 * Test email configuration
 * Run with: node scripts/test-email.js
 */

// Load environment variables
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const nodemailer = require('nodemailer')

async function testEmail() {
  console.log('╔════════════════════════════════════════════════════════════════════╗')
  console.log('║ 📧 TESTING EMAIL CONFIGURATION                                   ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝\n')

  // Check config
  const config = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD ? '***' + process.env.MAIL_PASSWORD.slice(-4) : '(not set)',
    encryption: process.env.MAIL_ENCRYPTION,
    from: process.env.MAIL_FROM_ADDRESS || process.env.EMAIL_FROM
  }

  console.log('Configuration:')
  console.log('  Host:', config.host || '(not set)')
  console.log('  Port:', config.port || '(not set)')
  console.log('  Username:', config.user || '(not set)')
  console.log('  Password:', config.pass)
  console.log('  Encryption:', config.encryption || '(not set)')
  console.log('  From:', config.from || '(not set)')
  console.log('')

  if (!config.host || !config.user || !config.pass) {
    console.log('❌ SMTP credentials not complete!')
    console.log('   Please set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD in .env.local')
    process.exit(1)
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: config.encryption === 'ssl' || Number(config.port) === 465,
    auth: {
      user: config.user,
      pass: process.env.MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  })

  console.log('Connecting to SMTP server...\n')

  try {
    // Verify connection
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Send test email
    const testEmail = process.argv[2] || 'test@example.com'

    console.log(`Sending test email to: ${testEmail}\n`)

    const info = await transporter.sendMail({
      from: config.from || 'TadabburQuran <noreply@tadabburquran.test>',
      to: testEmail,
      subject: 'Test Email - TadabburQuran',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #D4AF37;">✅ Test Email Berhasil!</h2>
          <p>Jika Anda menerima email ini, konfigurasi SMTP sudah benar.</p>
          <p>Waktu kirim: ${new Date().toLocaleString('id-ID')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Ini adalah email test dari TadabburQuran</p>
        </div>
      `,
      text: `Test Email Berhasil!\n\nWaktu kirim: ${new Date().toLocaleString('id-ID')}`
    })

    console.log('✅ Email sent successfully!')
    console.log('   Message ID:', info.messageId)
    console.log('   Response:', info.response)
    console.log('\nCek inbox di: https://mailtrap.io/inboxes')

  } catch (error) {
    console.log('\n❌ Error sending email:')
    console.log('   Code:', error.code)
    console.log('   Message:', error.message)
    console.log('\nPossible causes:')
    console.log('   1. Wrong MAIL_USERNAME or MAIL_PASSWORD')
    console.log('   2. Wrong MAIL_PORT (Mailtrap sandbox uses 2525)')
    console.log('   3. Firewall blocking connection')
  }
}

testEmail().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
