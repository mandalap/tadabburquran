import { queryAll } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Debug endpoint to see all unique instructors
export async function GET() {
  try {
    const instructors = await queryAll(`
      SELECT DISTINCT instructor, instructor_title,
             COUNT(*) as course_count,
             STRING_AGG(title, ', ') as courses
      FROM courses
      WHERE is_published = true AND instructor IS NOT NULL
      GROUP BY instructor, instructor_title
      ORDER BY instructor
    `)

    const creators = await queryAll(`
      SELECT id, name, slug FROM creators
      WHERE is_active = true
      ORDER BY name
    `)

    return NextResponse.json({
      instructors_from_courses: instructors,
      creators_in_db: creators
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
