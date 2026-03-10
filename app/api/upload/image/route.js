import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'
import sharp from 'sharp'

// POST - Upload and compress image
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const filename = `img-${timestamp}-${random}.webp`

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'editor')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }

    const filepath = join(uploadDir, filename)

    // Compress and convert to WebP using sharp
    // Get metadata to determine optimal dimensions
    const metadata = await sharp(buffer).metadata()
    let width = metadata.width
    let height = metadata.height

    // Resize if too large (max width 1200px for editor content)
    const maxWidth = 1200
    if (width > maxWidth) {
      const ratio = maxWidth / width
      width = maxWidth
      height = Math.round(height * ratio)
    }

    // Process image: resize, convert to WebP, quality 80
    await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(filepath)

    // Return the URL path
    const url = `/uploads/editor/${filename}`

    return Response.json({
      url,
      filename,
      width,
      height,
      size: file.size
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return Response.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
