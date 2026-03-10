// Email notification service using Resend
// Note: You need to install resend: npm install resend

// For development, we'll log emails instead of sending them
// In production, replace with actual email service

const EMAIL_TEMPLATES = {
  enrollment: {
    subject: 'Alhamdulillah! Pembelian Kelas "{{className}}" Berhasil ✨',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="font-size: 48px; margin-bottom: 10px;">📖</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Tadabbur Quran</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Platform Pembelajaran Quran Terpercaya</p>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <!-- Greeting -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #d4edda; color: #155724; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
              ✓ Pembayaran Berhasil Diterima
            </div>
            <h2 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 24px;">Alhamdulillah! Selamat Bergabung</h2>
            <p style="color: #666; margin: 0; font-size: 16px;">Assalamu'alaikum {{userName}},</p>
          </div>

          <!-- Thank You Message -->
          <p style="color: #444; line-height: 1.7; font-size: 15px; margin-bottom: 20px;">
            Alhamdulillahi Rabbil 'Alamin, segala puji bagi Allah SWT yang telah memberikan kemudahan bagi Anda untuk menuntut ilmu-Nya.
          </p>
          <p style="color: #444; line-height: 1.7; font-size: 15px; margin-bottom: 25px;">
            Terima kasih telah mempercayakan pembelajaran Anda kepada <strong>Tadabbur Quran</strong>. Anda kini resmi terdaftar di:
          </p>

          <!-- Course Card -->
          <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #D4AF37; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="color: #D4AF37; margin: 0 0 15px 0; font-size: 20px;">{{className}}</h3>
            <div style="border-top: 1px solid #eee; padding-top: 15px;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>Pengajar:</strong> {{instructor}}</p>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>Jenis:</strong> {{courseType}}</p>
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Nomor Order:</strong> #{{orderId}}</p>
            </div>
          </div>

          <!-- Doa Section -->
          <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #ffeaa7;">
            <h4 style="color: #8B6914; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <span>🤲</span> Doa & Harapan Kami untuk Anda
            </h4>
            <p style="color: #5c4d0f; line-height: 1.8; margin: 0 0 15px 0; font-style: italic; font-size: 14px;">
              "Barakallahu lakum fi ma' ab'tum wa ja'ala lakum makhzulan mutaqabbal."
            </p>
            <p style="color: #5c4d0f; line-height: 1.8; margin: 0 0 15px 0; font-size: 14px;">
              <strong>Artinya:</strong> "Mudah-mudahan Allah memberikan keberkahan kepada kalian dalam apa yang telah kalian belanjakan, dan menjadikan apa yang kalian peroleh sebagai persediaan yang baik (yang diterima)."
            </p>
            <p style="color: #5c4d0f; line-height: 1.8; margin: 0; font-size: 14px;">
              Semoga ilmu yang Anda peroleh dari kelas ini menjadi ilmu yang bermanfaat (an-nafi'), ilmu yang memberikan keberkahan (al-mubarok), dan ilmu yang bisa diamalkan serta menjadi sebab turunnya rahmat Allah di dunia dan menjadi penyelamat di akhirat nanti. Aamiin ya Rabbal 'Alamin.
            </p>
          </div>

          <!-- Motivation -->
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px dashed #D4AF37;">
            <p style="color: #666; margin: 0 0 12px 0; font-size: 14px;">
              <strong>💡 Tips Memaksimalkan Pembelajaran:</strong>
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
              <li>Sediakan waktu khusus untuk belajar dengan khusyuk</li>
              <li>Siapkan catatan untuk mencatat poin-poin penting</li>
              <li>Review materi ulang setelah selesai setiap sesi</li>
              <li>Amalkan ilmu yang dipelajari segera setelah belajar</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="{{classUrl}}" style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
              🚀 Mulai Belajar Sekarang
            </a>
          </div>

          <!-- Footer Note -->
          <p style="color: #888; font-size: 14px; text-align: center; margin: 25px 0 0 0;">
            "Siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga." <br>
            <span style="font-style: italic;">(HR. Muslim)</span>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 25px; color: #999; font-size: 13px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0;">Butuh bantuan? Hubungi kami di <a href="mailto:support@tadabburquran.com" style="color: #D4AF37; text-decoration: none;">support@tadabburquran.com</a></p>
          <p style="margin: 0;">&copy; 2024 Tadabbur Quran. Semua hak dilindungi.</p>
        </div>
      </div>
    `
  },

  // Template khusus untuk Webinar
  enrollmentWebinar: {
    subject: 'Pendaftaran Webinar "{{className}}" Berhasil! 🎉',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Tadabbur Quran</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Webinar Series</p>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #d4edda; color: #155724; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
              ✓ Pendaftaran Webinar Berhasil
            </div>
            <h2 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 24px;">Siap Menambah Ilmu!</h2>
            <p style="color: #666; margin: 0; font-size: 16px;">Assalamu'alaikum {{userName}},</p>
          </div>

          <p style="color: #444; line-height: 1.7; font-size: 15px; margin-bottom: 20px;">
            Alhamdulillah, Anda telah berhasil terdaftar dalam webinar <strong>{{className}}</strong>. Bersiaplah untuk sesi pembelajaran yang inspiratif bersama {{instructor}}.
          </p>

          <!-- Webinar Details -->
          <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #667eea; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 18px;">📅 Detail Webinar</h3>
            <div style="border-top: 1px solid #eee; padding-top: 15px;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>Judul:</strong> {{className}}</p>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>Pembicara:</strong> {{instructor}}</p>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>Tanggal:</strong> {{webinarDate}}</p>
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Waktu:</strong> {{webinarTime}}</p>
            </div>
          </div>

          <!-- Doa Section -->
          <div style="background: linear-gradient(135deg, #f3e7ff 0%, #e5d9f2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #d4c4f7;">
            <h4 style="color: #5b42a3; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <span>🤲</span> Doa Kehadiran Webinar
            </h4>
            <p style="color: #4a3d7a; line-height: 1.8; margin: 0 0 15px 0; font-style: italic; font-size: 14px;">
              "Allahumma la sahla illa ma ja'altahu sahla wa anta taj'alul hazna in syi'ta sahla."
            </p>
            <p style="color: #4a3d7a; line-height: 1.8; margin: 0; font-size: 14px;">
              <strong>Artinya:</strong> "Ya Allah, tidak ada kemudahan kecuali apa yang Engkau jadikan mudah. Dan Engkau menjadikan kesedihan (kesusahan) jika Engkau menghendaki, sebagai sesuatu yang mudah."
            </p>
            <p style="color: #4a3d7a; line-height: 1.8; margin: 15px 0 0 0; font-size: 14px;">
              Semoga Allah memberikan kemudahan bagi Anda untuk menghadiri webinar ini dan memahami materi yang disampaikan. Semoga ilmu yang didapat menjadi sebab keberkahan hidup Anda. Aamiin.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="{{webinarUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🎥 Akses Link Webinar
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center; margin: 25px 0 0 0;">
            Link webinar akan dikirim 1 jam sebelum sesi dimulai melalui WhatsApp/Email.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 25px; color: #999; font-size: 13px; border-top: 1px solid #eee;">
          <p style="margin: 0;">&copy; 2024 Tadabbur Quran. Semua hak dilindungi.</p>
        </div>
      </div>
    `
  },

  // Template khusus untuk Ebook/Digital Product
  enrollmentEbook: {
    subject: 'Ebook "{{className}}" Siap Diunduh! 📚',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="font-size: 48px; margin-bottom: 10px;">📚</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Tadabbur Quran</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Digital Library</p>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #d4edda; color: #155724; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
              ✓ Pembelian Ebook Berhasil
            </div>
            <h2 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 24px;">Ebook Siap Diunduh!</h2>
            <p style="color: #666; margin: 0; font-size: 16px;">Assalamu'alaikum {{userName}},</p>
          </div>

          <p style="color: #444; line-height: 1.7; font-size: 15px; margin-bottom: 20px;">
            Alhamdulillah, pembelian ebook <strong>{{className}}</strong> telah berhasil. Ebook ini kini tersedia di dashboard Anda dan dapat diunduh kapan saja.
          </p>

          <!-- Doa Section -->
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #a5d6a7;">
            <h4 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <span>🤲</span> Doa Kehidupan dalam Kitab
            </h4>
            <p style="color: #1b5e20; line-height: 1.8; margin: 0 0 15px 0; font-style: italic; font-size: 14px;">
              "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan thoyyiban, wa 'amalan mutaqabbala."
            </p>
            <p style="color: #1b5e20; line-height: 1.8; margin: 0; font-size: 14px;">
              <strong>Artinya:</strong> "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima."
            </p>
            <p style="color: #1b5e20; line-height: 1.8; margin: 15px 0 0 0; font-size: 14px;">
              Semoga ebook ini menjadi jalan untuk Anda memperoleh ilmu yang bermanfaat, dan semoga setiap lembar yang Anda baca membuka pintu pemahaman dan keberkahan dalam hidup Anda. Jadikanlah setiap bacaan sebagai bekal amal shalih. Aamiin ya Mujibas sa'ilin.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="{{ebookUrl}}" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);">
              📥 Unduh Ebook Sekarang
            </a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
            Ebook juga tersedia dalam format PDF yang ramah mobile untuk dibaca di mana saja.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 25px; color: #999; font-size: 13px; border-top: 1px solid #eee;">
          <p style="margin: 0;">&copy; 2024 Tadabbur Quran. Semua hak dilindungi.</p>
        </div>
      </div>
    `
  },

  paymentPending: {
    subject: 'Menunggu Pembayaran - Order #{{orderId}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎓 Tadabbur Quran</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Menunggu Pembayaran</h2>
          <p>Assalamu'alaikum {{userName}},</p>
          <p>Anda telah membuat order untuk <strong>{{className}}</strong>.</p>
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Nomor Order:</strong> #{{orderId}}</p>
            <p style="margin: 10px 0 0 0;"><strong>Total:</strong> Rp {{price}}</p>
            <p style="margin: 10px 0 0 0;"><strong>Metode:</strong> {{paymentMethod}}</p>
          </div>
          <p>Silakan selesaikan pembayaran dalam <strong>24 jam</strong> agar pesanan Anda tidak kadaluarsa.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{paymentUrl}}" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Lanjut Pembayaran</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; 2024 Tadabbur Quran. All rights reserved.</p>
        </div>
      </div>
    `
  },

  welcome: {
    subject: 'Selamat Datang di Tadabbur Quran!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎓 Tadabbur Quran</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Selamat Datang!</h2>
          <p>Assalamu'alaikum {{userName}},</p>
          <p>Selamat datang di <strong>Tadabbur Quran</strong>!</p>
          <p>Platform pembelajaran Quran dengan metode tadabbur yang mendalam dan aplikatif.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Apa yang bisa Anda lakukan?</h3>
            <ul style="line-height: 1.8;">
              <li>✓ Jelajahi berbagai kelas tafsir dan tadabbur</li>
              <li>✓ Belajar dari ustadz-ustadz terpercaya</li>
              <li>✓ Dapatkan sertifikat setelah menyelesaikan kelas</li>
              <li>✓ Akses materi selamanya</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{exploreUrl}}" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Jelajahi Kelas</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; 2024 Tadabbur Quran. All rights reserved.</p>
        </div>
      </div>
    `
  },

  certificate: {
    subject: 'Sertifikat Kelas {{className}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎓 Tadabbur Quran</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Selamat! 🎉</h2>
          <p>Assalamu'alaikum {{userName}},</p>
          <p>Alhamdulillah, Anda telah menyelesaikan kelas <strong>{{className}}</strong>!</p>
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0; text-align: center; font-size: 18px;"><strong>Sertifikat Anda siap!</strong></p>
          </div>
          <p>Terima kasih telah menuntut ilmu dengan bersungguh-sungguh. Semoga ilmu yang Anda pelajari bermanfaat di dunia dan akhirat.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{certificateUrl}}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Unduh Sertifikat</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; 2024 Tadabbur Quran. All rights reserved.</p>
        </div>
      </div>
    `
  }
}

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} type - Email type from EMAIL_TEMPLATES
 * @param {object} data - Data to replace in template
 * @returns {Promise<boolean>}
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      // No email service configured - log to console
      console.log('╔═══════════════════════════════════════════════════════════════════╗')
      console.log('║ 📧 EMAIL SERVICE NOT CONFIGURED                                ║')
      console.log('╠═══════════════════════════════════════════════════════════════════╣')
      console.log(`║ To:      ${to.padEnd(55)}║`)
      console.log(`║ Subject: ${subject.padEnd(55)}║`)
      console.log('╠═══════════════════════════════════════════════════════════════════╣')
      console.log('║ To send real emails, configure RESEND_API_KEY in .env.local     ║')
      console.log('║ Get API key: https://resend.com/api-keys                        ║')
      console.log('╚═══════════════════════════════════════════════════════════════════╝')
      console.log('HTML preview:', html.substring(0, 200) + '...')
      return false
    }

    // Send email using Resend
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    // For development with @resend.dev, override recipient to account owner email
    // Resend free tier only allows sending to the account owner's email
    const devEmail = process.env.DEV_EMAIL || 'juli23man@gmail.com'
    const isDev = process.env.NODE_ENV !== 'production'

    const result = await resend.emails.send({
      // Use resend.dev for development, custom domain for production
      from: process.env.EMAIL_FROM || 'Tadabbur Quran <onboarding@resend.dev>',
      to: isDev ? devEmail : to, // Override recipient in development
      subject: isDev ? `[DEV] ${subject} (originally to: ${to})` : subject, // Add prefix in dev
      html,
      ...(text && { text })
    })

    console.log('✅ Email sent successfully:', result)
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error.message)
    return false
  }
}

/**
 * Queue email for background processing
 */
export async function queueEmail({ to, type, data, delay = 0 }) {
  // In production, you might want to use a job queue like Bull or AWS SQS
  if (delay > 0) {
    setTimeout(() => {
      sendEmail({ to, type, data })
    }, delay)
  } else {
    return sendEmail({ to, type, data })
  }
}

export { EMAIL_TEMPLATES }
