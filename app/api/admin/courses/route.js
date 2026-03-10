import { queryAll, queryOne, query } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET - Fetch all courses
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let courses
    try {
      courses = await queryAll(
        `SELECT id, title, short_description, description, instructor, instructor_title,
          course_type, course_type_id, category, price, original_price, rating, reviews, students, duration, event_date, cover,
          modules, is_published, created_at, updated_at
         FROM courses
         ORDER BY created_at DESC`
      )
    } catch (error) {
      courses = await queryAll(
        `SELECT id, title, short_description, description, instructor, instructor_title,
          category, price, original_price, rating, reviews, students, duration, cover,
          modules, is_published, created_at, updated_at
         FROM courses
         ORDER BY created_at DESC`
      )
      courses = courses.map(course => ({ ...course, event_date: null, course_type: '', course_type_id: null }))
    }

    // Parse instructors JSON for frontend compatibility
    const coursesWithInstructors = courses.map(course => {
      let parsedModules = course.modules || []
      if (typeof parsedModules === 'string') {
        try {
          parsedModules = JSON.parse(parsedModules)
        } catch {
          parsedModules = []
        }
      }
      return {
        ...course,
        instructors: [{ creator_id: null, name: course.instructor || '', title: course.instructor_title || '' }],
        modules: Array.isArray(parsedModules) ? parsedModules : []
      }
    })

    return Response.json(coursesWithInstructors)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new course
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    let course
    try {
      course = await queryOne(
        `INSERT INTO courses (
          title, short_description, description, instructor, instructor_title,
          course_type, course_type_id, category, price, original_price, duration, event_date, cover, modules, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [title, short_description, description, instructor, instructor_title,
          course_type, course_type_id, category, price, original_price, duration, event_date, cover, JSON.stringify(modules), is_published]
      )
    } catch (error) {
      course = await queryOne(
        `INSERT INTO courses (
          title, short_description, description, instructor, instructor_title,
          category, price, original_price, duration, cover, modules, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [title, short_description, description, instructor, instructor_title,
          category, price, original_price, duration, cover, JSON.stringify(modules), is_published]
      )
      course = { ...course, event_date: null, course_type: '', course_type_id: null }
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

    return Response.json(courseWithInstructors, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
