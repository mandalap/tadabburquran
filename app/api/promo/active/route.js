'use server'

import { NextResponse } from 'next/server'
import { redis } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview') === '1'
    const raw = await redis.get('site:promo:active')
    if (!raw) {
      return NextResponse.json({ enabled: false })
    }
    const promo = JSON.parse(raw)
    if (preview) {
      return NextResponse.json(promo)
    }
    // Schedule & enabled check
    const now = Date.now()
    const startOk = !promo.startAt || new Date(promo.startAt).getTime() <= now
    const endOk = !promo.endAt || new Date(promo.endAt).getTime() > now
    if (promo.enabled && startOk && endOk) {
      return NextResponse.json(promo)
    }
    return NextResponse.json({ enabled: false })
  } catch (error) {
    return NextResponse.json({ enabled: false })
  }
}
