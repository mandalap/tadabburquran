import { NextResponse } from 'next/server'
import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/user/enrollments - Get all enrolled course IDs for current user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ enrolledIds: [] })
    }

    const user = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )

    if (!user) {
      return NextResponse.json({ enrolledIds: [] })
    }

    // Get all enrolled course IDs
    const enrollments = await queryAll(
      'SELECT course_id FROM enrollments WHERE user_id = $1',
      [user.id]
    )

    const enrolledIds = enrollments.map(e => e.course_id)

    return NextResponse.json({ enrolledIds })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ enrolledIds: [] }, { status: 500 })
  }
}
