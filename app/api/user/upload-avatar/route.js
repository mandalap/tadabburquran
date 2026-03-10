import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { queryOne } from '@/lib/db'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to compress image using canvas
async function compressImage(buffer, maxWidth = 400, quality = 0.8) {
  const { createCanvas, loadImage } = await import('canvas')

  // Load the image
  const image = await loadImage(buffer)

  // Calculate new dimensions maintaining aspect ratio
  let width = image.width
  let height = image.height

  if (width > maxWidth) {
    const ratio = maxWidth / width
    width = maxWidth
    height = height * ratio
  }

  // Create canvas and resize
  const canvas = createCanvas(Math.round(width), Math.round(height))
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, Math.round(width), Math.round(height))

  // Convert to buffer with compression
  const compressedBuffer = canvas.toDataURL('image/jpeg', quality)
  return Buffer.from(compressedBuffer.split(',')[1], 'base64')
}

// POST - Upload and update user avatar
export async function POST(request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await queryOne('SELECT id, avatar_url FROM users WHERE email = $1', [session.user.email])
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    const bytes = await file.arrayBuffer()
    if (bytes.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Compress image
    let compressedBuffer
    try {
      compressedBuffer = await compressImage(bytes, 400, 0.8)
    } catch (error) {
      console.error('Image compression error:', error)
      // Fallback: use original buffer
      compressedBuffer = Buffer.from(bytes)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `avatar_${user.id}_${timestamp}_${random}.jpg`

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const filepath = path.join(uploadDir, filename)

    // Write compressed image
    await writeFile(filepath, compressedBuffer)

    // Delete old avatar if exists
    if (user.avatar_url) {
      try {
        const oldFilename = path.basename(user.avatar_url)
        const oldFilepath = path.join(uploadDir, oldFilename)
        const fs = await import('fs/promises')
        await fs.unlink(oldFilepath).catch(() => {
          // Ignore error if file doesn't exist
        })
      } catch (error) {
        console.error('Error deleting old avatar:', error)
      }
    }

    // Update database
    const avatarUrl = `/uploads/avatars/${filename}`
    const updatedUser = await queryOne(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, avatar_url, role, created_at',
      [avatarUrl, user.id]
    )

    return NextResponse.json({
      success: true,
      user: updatedUser,
      avatarUrl
    })
  } catch (error) {
    console.error('Upload avatar error:', error)
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}
