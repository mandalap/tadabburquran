import { queryAll } from '@/lib/db'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kreator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Dynamic course pages
  let courseUrls = []
  try {
    const courses = await queryAll(`
      SELECT slug, updated_at
      FROM courses
      WHERE is_published = true
      ORDER BY updated_at DESC
      LIMIT 1000
    `)

    courseUrls = courses.map(course => ({
      url: `${baseUrl}/kelas/${course.slug || course.id}`,
      lastModified: course.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error)
  }

  // Dynamic creator pages
  let creatorUrls = []
  try {
    const creators = await queryAll(`
      SELECT slug, updated_at
      FROM creators
      WHERE is_active = true
      ORDER BY updated_at DESC
      LIMIT 500
    `)

    creatorUrls = creators.map(creator => ({
      url: `${baseUrl}/kreator/${creator.slug || creator.id}`,
      lastModified: creator.updated_at || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching creators for sitemap:', error)
  }

  return [...staticPages, ...courseUrls, ...creatorUrls]
}
