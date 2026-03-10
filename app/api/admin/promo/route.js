'use server'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redis } from '@/lib/db'

export async function GET() {
  try {
    const raw = await redis.get('site:promo:active')
    return NextResponse.json(raw ? JSON.parse(raw) : { enabled: false })
  } catch {
    return NextResponse.json({ enabled: false })
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    // Normalize CTA URL
    let normalizedCta = (body.ctaUrl || '/').trim()
    if (!(normalizedCta.startsWith('/') || normalizedCta.startsWith('http://') || normalizedCta.startsWith('https://'))) {
      normalizedCta = `/${normalizedCta}`
    }
    const payload = {
      enabled: !!body.enabled,
      title: body.title || '',
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      ctaLabel: body.ctaLabel || 'Lihat Detail',
      ctaUrl: normalizedCta,
      dismissHours: Number(body.dismissHours || 24),
      startAt: body.startAt || null,
      endAt: body.endAt || null,
      version: Date.now(),
      updatedAt: new Date().toISOString()
    }
    await redis.set('site:promo:active', JSON.stringify(payload))
    return NextResponse.json({ success: true, promo: payload })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save promo' }, { status: 500 })
  }
}
