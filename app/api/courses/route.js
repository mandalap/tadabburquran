import { queryAll } from '@/lib/db'

// GET - Fetch all published courses with category info and creator details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')

    let courses
    if (categoryId) {
      try {
        courses = await queryAll(
          `SELECT c.id, c.slug, c.title, c.short_description, c.description, c.instructor,
            c.instructor_title, c.course_type, c.course_type_id, c.category, c.price, c.original_price, c.rating,
            c.reviews, c.students, c.duration, c.cover, c.is_published, c.created_at,
            c.instructors,
            cat.name as category_name, cat.slug as category_slug,
            cat.icon as category_icon, cat.color as category_color,
            ct.name as type_name, ct.slug as type_slug
           FROM courses c
           LEFT JOIN categories cat ON c.category = cat.name
           LEFT JOIN course_types ct ON c.course_type_id = ct.id
           WHERE c.is_published = true AND cat.slug = $1
           ORDER BY c.created_at DESC`,
          [categoryId]
        )
      } catch (error) {
        courses = await queryAll(
          `SELECT c.id, c.slug, c.title, c.short_description, c.description, c.instructor,
            c.instructor_title, c.course_type, c.course_type_id, c.category, c.price, c.original_price, c.rating,
            c.reviews, c.students, c.duration, c.cover, c.is_published, c.created_at,
            c.instructors,
            cat.name as category_name, cat.slug as category_slug,
            cat.icon as category_icon, cat.color as category_color
           FROM courses c
           LEFT JOIN categories cat ON c.category = cat.name
           WHERE c.is_published = true AND cat.slug = $1
           ORDER BY c.created_at DESC`,
          [categoryId]
        )
      }
    } else {
      try {
        courses = await queryAll(
          `SELECT c.id, c.slug, c.title, c.short_description, c.description, c.instructor,
            c.instructor_title, c.course_type, c.course_type_id, c.category, c.price, c.original_price, c.rating,
            c.reviews, c.students, c.duration, c.cover, c.is_published, c.created_at,
            c.instructors,
            cat.name as category_name, cat.slug as category_slug,
            cat.icon as category_icon, cat.color as category_color,
            ct.name as type_name, ct.slug as type_slug
           FROM courses c
           LEFT JOIN categories cat ON c.category = cat.name
           LEFT JOIN course_types ct ON c.course_type_id = ct.id
           WHERE c.is_published = true
           ORDER BY c.created_at DESC`
        )
      } catch (error) {
        courses = await queryAll(
          `SELECT c.id, c.slug, c.title, c.short_description, c.description, c.instructor,
            c.instructor_title, c.course_type, c.course_type_id, c.category, c.price, c.original_price, c.rating,
            c.reviews, c.students, c.duration, c.cover, c.is_published, c.created_at,
            c.instructors,
            cat.name as category_name, cat.slug as category_slug,
            cat.icon as category_icon, cat.color as category_color
           FROM courses c
           LEFT JOIN categories cat ON c.category = cat.name
           WHERE c.is_published = true
           ORDER BY c.created_at DESC`
        )
      }
    }

    // Parse instructors JSON and get creator details
    const coursesWithCreators = await Promise.all(courses.map(async (course) => {
      let instructors = []

      // Try to use instructors array from database
      if (course.instructors && Array.isArray(course.instructors) && course.instructors.length > 0) {
        // Get creator details for each instructor
        const creatorIds = course.instructors.map(i => i.creator_id).filter(id => id)
        if (creatorIds.length > 0) {
          const placeholders = creatorIds.map((_, i) => `$${i + 1}`).join(',')
          const creators = await queryAll(
            `SELECT id, name, slug, title, avatar, rating, reviews
             FROM creators
             WHERE id IN (${placeholders})`,
            creatorIds
          )

          // Map creators to instructors with their details
          instructors = course.instructors
            .map(i => {
              const creator = creators.find(c => c.id === i.creator_id)
              return {
                creator_id: i.creator_id,
                name: i.name,
                avatar: creator?.avatar || null,
                rating: creator?.rating || 0,
                reviews: creator?.reviews || 0,
                title: creator?.title || ''
              }
            })
            .filter(i => i.name) // Only include instructors with names
        }
      } else if (course.instructor) {
        // Fallback: use instructor field
        instructors = [{ name: course.instructor }]
      }

      return {
        ...course,
        course_type: course.course_type || '',
        course_type_id: course.course_type_id || null,
        type_name: course.type_name || '',
        type_slug: course.type_slug || '',
        instructors
      }
    }))

    return Response.json({ courses: coursesWithCreators })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
