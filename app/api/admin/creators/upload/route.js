import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'creators')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const filename = `creator-${timestamp}-${randomStr}.webp`
    const filepath = path.join(uploadDir, filename)

    // Process image with sharp: convert to WebP and compress
    const processedImage = await sharp(buffer)
      .resize({
        width: 400,
        height: 400,
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 85,
        effort: 6
      })
      .toBuffer()

    // Save the processed image
    await writeFile(filepath, processedImage)

    // Return the URL path
    const url = `/uploads/creators/${filename}`

    return Response.json({
      success: true,
      url,
      filename,
      size: processedImage.length,
      originalSize: file.size,
      compression: Math.round((1 - processedImage.length / file.size) * 100)
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return Response.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

// DELETE - Remove uploaded image
export async function DELETE(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    // Prevent directory traversal
    if (url.includes('..')) {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const filepath = path.join(process.cwd(), 'public', url)

    // Only allow deleting from uploads/creators directory
    if (!filepath.startsWith(path.join(process.cwd(), 'public', 'uploads', 'creators'))) {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises')
      await unlink(filepath)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return Response.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
