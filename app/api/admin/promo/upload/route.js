'use server'

import { auth } from '@/lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path, { join } from 'path'
import sharp from 'sharp'

export async function POST(request) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const oldImage = formData.get('oldImage') // e.g. /uploads/promo/xxx.webp

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Only JPG, PNG, WebP allowed.' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const filename = `promo-${timestamp}-${random}.webp`

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'promo')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch {}

    const filepath = join(uploadDir, filename)

    // Compress to width max 1200px, quality 82
    const metadata = await sharp(buffer).metadata()
    let width = metadata.width
    const maxWidth = 1200
    if (width > maxWidth) width = maxWidth

    await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(filepath)

    // Delete old image if provided
    if (oldImage && String(oldImage).includes('/uploads/promo/')) {
      const oldFilename = String(oldImage).split('/').pop()
      const oldPath = join(uploadDir, oldFilename)
      try {
        if (existsSync(oldPath)) await unlink(oldPath)
      } catch {}
    }

    const url = `/uploads/promo/${filename}`
    return Response.json({ url, filename })
  } catch (error) {
    console.error('Promo upload error:', error)
    return Response.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
