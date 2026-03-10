import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'
import sharp from 'sharp'

// POST - Upload and compress testimonial avatar
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const oldAvatar = formData.get('oldAvatar') // For deleting old image

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 })
    }

    // Validate file size (max 2MB for avatar)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const filename = `avatar-${timestamp}-${random}.webp`

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'testimonials')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }

    const filepath = join(uploadDir, filename)

    // Compress and convert to WebP using sharp
    // Avatar size: 200x200px max, square crop, quality 85
    await sharp(buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .webp({ quality: 85, effort: 4 })
      .toFile(filepath)

    // Delete old avatar if provided and exists
    if (oldAvatar && oldAvatar.includes('/uploads/testimonials/')) {
      const oldFilename = oldAvatar.split('/').pop()
      const oldFilepath = join(uploadDir, oldFilename)
      try {
        await unlink(oldFilepath)
      } catch (err) {
        // File might not exist, ignore error
        console.log('Old avatar not found or already deleted:', oldFilename)
      }
    }

    // Return the URL path
    const url = `/uploads/testimonials/${filename}`

    return Response.json({
      url,
      filename,
      size: file.size
    })
  } catch (error) {
    console.error('Error uploading testimonial avatar:', error)
    return Response.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
