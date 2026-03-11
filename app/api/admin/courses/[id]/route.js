import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// Tambahkan fungsi ini di bagian atas
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}

// PUT - Update course
export async function PUT(request, { params }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const {
      title,
      short_description,
      description = '',
      instructor,
      instructor_title = '',
      course_type = '',
      course_type_id = null,
      category = '',
      price,
      original_price = 0,
      duration = '',
      event_date = null,
      cover = '',
      modules = [],
      is_published = true
    } = body

    if (!title || !short_description || price === undefined || !instructor) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate slug dari title
    const slug = generateSlug(title)

    let course
    try {
      course = await queryOne(
        `UPDATE courses SET
          title = $1, short_description = $2, description = $3, instructor = $4,
          instructor_title = $5, course_type = $6, course_type_id = $7, category = $8, price = $9,
          original_price = $10, duration = $11, event_date = $12, cover = $13, modules = $14, 
          is_published = $15, slug = $16, updated_at = NOW()
        WHERE id = $17
        RETURNING *`,
        [title, short_description, description, instructor, instructor_title,
          course_type, course_type_id, category, price, original_price, duration, 
          event_date, cover, JSON.stringify(modules), is_published, slug, id]
      )
    } catch (error) {
      course = await queryOne(
        `UPDATE courses SET
          title = $1, short_description = $2, description = $3, instructor = $4,
          instructor_title = $5, category = $6, price = $7,
          original_price = $8, duration = $9, cover = $10, modules = $11, 
          is_published = $12, slug = $13, updated_at = NOW()
        WHERE id = $14
        RETURNING *`,
        [title, short_description, description, instructor, instructor_title,
          category, price, original_price, duration, cover, JSON.stringify(modules), 
          is_published, slug, id]
      )
      course = { ...course, event_date: null, course_type: '', course_type_id: null }
    }
    // ... sisa kode tidak berubah
    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 })
    }

    // Add instructors array to response for frontend compatibility
    let parsedModules = course.modules || []
    if (typeof parsedModules === 'string') {
      try {
        parsedModules = JSON.parse(parsedModules)
      } catch {
        parsedModules = []
      }
    }
    const courseWithInstructors = {
      ...course,
      instructors: [{ creator_id: null, name: course.instructor, title: course.instructor_title || '' }],
      modules: Array.isArray(parsedModules) ? parsedModules : []
    }

    return Response.json(courseWithInstructors)
  } catch (error) {
    console.error('Error updating course:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete course
export async function DELETE(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const course = await queryOne(
      'DELETE FROM courses WHERE id = $1 RETURNING *',
      [id]
    )

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
