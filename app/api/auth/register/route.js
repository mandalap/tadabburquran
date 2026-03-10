'use server'

import { NextResponse } from 'next/server'
import { queryOne, query, redis } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

async function checkRateLimit(ip, email) {
  try {
    const ipKey = `rate:register:ip:${ip}`
    const emailKey = `rate:register:email:${(email || '').toLowerCase()}`

    const [ipCount, emailCount] = await Promise.all([
      redis.incr(ipKey),
      redis.incr(emailKey)
    ])

    if (ipCount === 1) await redis.expire(ipKey, 600) // 10 menit
    if (emailCount === 1) await redis.expire(emailKey, 3600) // 1 jam

    // Limit: 5 percobaan per IP/10 menit, 3 percobaan per email/jam
    if (ipCount > 5 || emailCount > 3) {
      return false
    }
    return true
  } catch (e) {
    return true
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    const body = await request.json()
    const { name, email, password } = body || {}

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const allowed = await checkRateLimit(ip, email)
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 })
    }

    const existing = await queryOne(`SELECT id, password_hash, email_verified FROM users WHERE email = $1`, [email.toLowerCase()])
    const passwordHash = await bcrypt.hash(password, 10)

    // Jika user sudah ada via OAuth (tanpa password), izinkan set password
    if (existing && !existing.password_hash) {
      await queryOne(
        `UPDATE users
         SET full_name = $1,
             password_hash = $2,
             role = COALESCE(role, 'user'),
             email_verified = COALESCE(email_verified, false),
             updated_at = NOW()
         WHERE id = $3
         RETURNING id`,
        [name, passwordHash, existing.id]
      )
      // Kirim email verifikasi
      const token = crypto.randomBytes(32).toString('hex')
      await redis.set(`verify:email:token:${token}`, existing.id, 'EX', 60 * 60 * 24)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verifyUrl = `${baseUrl}/auth/verify?token=${token}`
      await sendEmail({
        to: email,
        subject: 'Verifikasi Email Akun Tadabbur Quran',
        html: `<p>Assalamu'alaikum ${name},</p><p>Silakan verifikasi email Anda dengan klik tombol di bawah:</p><p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#D4AF37;color:#000;border-radius:8px;text-decoration:none;font-weight:bold;">Verifikasi Email</a></p><p>Link berlaku 24 jam.</p>`
      })
      return NextResponse.json({ success: true, message: 'Registrasi berhasil. Cek email untuk verifikasi.' })
    }

    if (existing && existing.password_hash) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }

    const id = crypto.randomUUID()
    await queryOne(
      `INSERT INTO users (id, email, full_name, password_hash, role, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'user', false, NOW(), NOW())
       RETURNING id`,
      [id, email.toLowerCase(), name, passwordHash]
    )

    const token = crypto.randomBytes(32).toString('hex')
    await redis.set(`verify:email:token:${token}`, id, 'EX', 60 * 60 * 24)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/auth/verify?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Verifikasi Email Akun Tadabbur Quran',
      html: `<p>Assalamu'alaikum ${name},</p><p>Silakan verifikasi email Anda dengan klik tombol di bawah:</p><p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#D4AF37;color:#000;border-radius:8px;text-decoration:none;font-weight:bold;">Verifikasi Email</a></p><p>Link berlaku 24 jam.</p>`
    })

    return NextResponse.json({ success: true, message: 'Registrasi berhasil. Cek email untuk verifikasi.' })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
