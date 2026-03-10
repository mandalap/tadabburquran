import { NextResponse } from 'next/server'
import { queryOne, queryAll } from '@/lib/db'

// GET single course by ID or slug with modules
export async function GET(request, { params }) {
  try {
    const { id: courseIdOrSlug } = await params

    // Check if the input is a UUID (looks like xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrSlug)

    // Get course details (by slug or ID)
    // Note: slug column might not exist yet, so fallback to id only
    let course
    if (isUuid) {
      course = await queryOne(
        `SELECT c.*, cat.name as category_name, cat.slug as category_slug,
                cat.icon as category_icon, cat.color as category_color
         FROM courses c
         LEFT JOIN categories cat ON c.category = cat.name
         WHERE c.id = $1`,
        [courseIdOrSlug]
      )
    } else {
      // Try by slug first, if column exists
      try {
        course = await queryOne(
          `SELECT c.*, cat.name as category_name, cat.slug as category_slug,
                  cat.icon as category_icon, cat.color as category_color
           FROM courses c
           LEFT JOIN categories cat ON c.category = cat.name
           WHERE c.slug = $1`,
          [courseIdOrSlug]
        )
      } catch (e) {
        // If slug column doesn't exist, try by title (fallback)
        course = await queryOne(
          `SELECT c.*, cat.name as category_name, cat.slug as category_slug,
                  cat.icon as category_icon, cat.color as category_color
           FROM courses c
           LEFT JOIN categories cat ON c.category = cat.name
           WHERE LOWER(REPLACE(c.title, ' ', '-')) LIKE LOWER($1)`,
          [`%${courseIdOrSlug}%`]
        )
      }
    }

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // Parse instructors array and get creator details with avatar
    let instructors = []
    if (course.instructors && Array.isArray(course.instructors) && course.instructors.length > 0) {
      // Get creator details for each instructor
      const creatorIds = course.instructors.map(i => i.creator_id).filter(id => id)
      if (creatorIds.length > 0) {
        const placeholders = creatorIds.map((_, i) => `$${i + 1}`).join(',')
        const creators = await queryAll(
          `SELECT id, name, slug, title, avatar, rating, reviews, bio
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
              title: creator?.title || '',
              bio: creator?.bio || ''
            }
          })
          .filter(i => i.name) // Only include instructors with names
      }
    } else if (course.instructor) {
      // Fallback: try to find creator by name
      try {
        const creator = await queryOne(
          `SELECT id, name, slug, title, avatar, rating, reviews, bio
           FROM creators
           WHERE LOWER(name) = LOWER($1)`,
          [course.instructor]
        )
        if (creator) {
          instructors = [{
            creator_id: creator.id,
            name: creator.name,
            avatar: creator.avatar,
            rating: creator.rating,
            reviews: creator.reviews,
            title: creator.title,
            bio: creator.bio
          }]
        } else {
          instructors = [{ name: course.instructor }]
        }
      } catch (e) {
        instructors = [{ name: course.instructor }]
      }
    }

    // Use modules from database or default modules
    let dbModules = course.modules || []
    if (typeof dbModules === 'string') {
      try {
        dbModules = JSON.parse(dbModules)
      } catch (error) {
        dbModules = []
      }
    }
    if (!Array.isArray(dbModules)) {
      dbModules = []
    }

    // If no modules in database, use default modules
    const modules = dbModules.length > 0 ? dbModules : [
      {
        id: 'intro',
        title: 'Pengantar',
        lessons: [
          {
            id: 'intro-1',
            title: `Pengantar ${course.title}`,
            duration: '12:00',
            isFree: true,
            isLocked: false,
            instructor: course.instructor
          }
        ]
      },
      {
        id: 'module-1',
        title: 'Modul 1: Pendahuluan',
        lessons: [
          {
            id: 'm1-1',
            title: 'Materi Dasar',
            duration: '25:00',
            isFree: false,
            isLocked: true,
            instructor: course.instructor
          },
          {
            id: 'm1-2',
            title: 'Latihan Pendahuluan',
            duration: '20:00',
            isFree: false,
            isLocked: true,
            instructor: course.instructor
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Modul 2: Pembahasan Mendalam',
        lessons: [
          {
            id: 'm2-1',
            title: 'Pembahasan Materi Inti',
            duration: '35:00',
            isFree: false,
            isLocked: true,
            instructor: course.instructor
          },
          {
            id: 'm2-2',
            title: 'Studi Kasus',
            duration: '30:00',
            isFree: false,
            isLocked: true,
            instructor: course.instructor
          }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        instructors,
        modules
      }
    })
  } catch (error) {
    console.error('Course Detail API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Database error', error: error.message },
      { status: 500 }
    )
  }
}
