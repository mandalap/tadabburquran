import { queryOne, queryAll } from '@/lib/db'

// GET - Fetch single creator by slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params  // Await params in Next.js 15+

    console.log('Fetching creator for slug:', slug)

    // First try: find by slug
    let creator = await queryOne(
      `SELECT id, name, slug, specialty, title, bio, avatar, rating, reviews,
        courses_count, students_count, is_top_creator, is_featured,
        social_youtube, social_instagram, social_telegram, creator_type, created_at
       FROM creators
       WHERE slug = $1 AND is_active = true`,
      [slug]
    )

    console.log('Creator by slug result:', creator)

    // If not found by slug, try finding courses with instructor matching this slug
    if (!creator) {
      const nameVariations = [
        slug?.replace(/-/g, ' ') || '', // "muhammad rizki"
        slug || '', // "muhammad-rizki"
        slug?.split('-')?.join(' ') || '', // "muhammad rizki"
        slug?.split('-')?.[0] || '', // "muhammad"
      ]

      console.log('Trying name variations:', nameVariations)

      // Find courses with this instructor
      let courses = null
      for (const variation of nameVariations) {
        if (!variation) continue

        const foundCourses = await queryAll(
          `SELECT id, title, slug, short_description, description, category, price, original_price,
            cover, instructor, instructor_title, instructors, rating, reviews, students, duration,
            is_published
           FROM courses
           WHERE is_published = true AND instructor ILIKE $1
           ORDER BY students DESC
           LIMIT 50`,
          [`%${variation}%`]
        )

        if (foundCourses.length > 0) {
          courses = foundCourses
          console.log('Found courses with variation:', variation, 'count:', courses.length)

          // Create dynamic creator from first course
          const firstCourse = courses[0]
          creator = {
            id: firstCourse.id,
            name: firstCourse.instructor || 'Kreator',
            slug: slug,
            title: firstCourse.instructor_title || '',
            specialty: null,
            bio: null,
            avatar: null,
            rating: 0,
            reviews: 0,
            courses_count: courses.length,
            students_count: courses.reduce((sum, c) => sum + (c.students || 0), 0),
            is_top_creator: false,
            is_featured: false,
            social_youtube: null,
            social_instagram: null,
            social_telegram: null,
            creator_type: 'ustadz',
            created_at: firstCourse.created_at,
            is_dynamic: true
          }
          break
        }
      }

      // Return courses if found
      if (creator && courses) {
        return Response.json({
          creator,
          courses,
          isDynamicCreator: true
        })
      }

      // Still not found - return recommendations
      const recommendedCreators = await queryAll(
        `SELECT id, name, slug, specialty, title, avatar, rating, reviews,
          courses_count, students_count, is_top_creator
         FROM creators
         WHERE is_active = true
         ORDER BY is_top_creator DESC, students_count DESC
         LIMIT 6`
      )

      console.log('No creator found, returning recommendations:', recommendedCreators.length)

      return Response.json({
        error: 'Creator not found',
        recommendedCreators
      }, { status: 404 })
    }

    // Fetch creator's courses
    const courses = await queryAll(
      `SELECT id, title, slug, short_description, description, category, price, original_price,
        cover, instructor, instructor_title, instructors, rating, reviews, students, duration,
        is_published
       FROM courses
       WHERE is_published = true
         AND (
           instructor = $1
           OR EXISTS (
             SELECT 1 FROM jsonb_array_elements(instructors) as elem
             WHERE elem->>'creator_id' = $2
                OR elem->>'name' = $3
           )
         )
       ORDER BY students DESC`,
      [creator.name, creator.id, creator.name]
    )

    console.log('Returning creator:', creator.name, 'with courses:', courses.length)

    return Response.json({
      creator,
      courses,
      isDynamicCreator: false
    })
  } catch (error) {
    console.error('Error fetching creator:', error)
    return Response.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}
