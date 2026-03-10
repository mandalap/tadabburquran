'use server'

import { NextResponse } from 'next/server'
import { queryOne, redis } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token tidak ditemukan' }, { status: 400 })
    }

    const key = `verify:email:token:${token}`
    const userId = await redis.get(key)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Token tidak valid atau kadaluarsa' }, { status: 400 })
    }

    const user = await queryOne(
      `UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1 RETURNING id, email`,
      [userId]
    )
    await redis.del(key)

    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Email berhasil diverifikasi' })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
