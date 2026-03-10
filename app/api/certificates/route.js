import { NextResponse } from 'next/server'
import { queryOne, queryAll } from '@/lib/db'

// GET /api/certificates - Get user certificates
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const courseId = searchParams.get('course_id')

    if (courseId && userId) {
      // Get specific certificate
      const certificate = await queryOne(`
        SELECT c.*, co.title as course_title, co.cover as course_cover,
               u.full_name, u.email, i.name as instructor_name
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN creators i ON co.instructor_id = i.id
        WHERE c.user_id = $1 AND c.course_id = $2
      `, [userId, courseId])

      return NextResponse.json({ certificate })
    }

    if (userId) {
      // Get all user certificates
      const certificates = await queryAll(`
        SELECT c.*, co.title as course_title, co.cover as course_cover, co.slug as course_slug
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        WHERE c.user_id = $1
        ORDER BY c.issued_at DESC
      `, [userId])

      return NextResponse.json({ certificates })
    }

    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/certificates - Generate certificate
export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, courseId } = body

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'user_id and courseId are required' }, { status: 400 })
    }

    // Check if enrollment exists and is completed
    const enrollment = await queryOne(`
      SELECT completed_at FROM enrollments
      WHERE user_id = $1 AND course_id = $2
    `, [userId, courseId])

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (!enrollment.completed_at) {
      return NextResponse.json({ error: 'Course not completed yet' }, { status: 400 })
    }

    // Check if certificate already exists
    const existing = await queryOne(`
      SELECT id, certificate_url FROM certificates
      WHERE user_id = $1 AND course_id = $2
    `, [userId, courseId])

    if (existing) {
      return NextResponse.json({
        success: true,
        certificate: existing,
        message: 'Certificate already exists'
      })
    }

    // Get course and user details
    const details = await queryOne(`
      SELECT c.title as course_title, c.duration, c.instructor,
             u.full_name, u.email
      FROM courses c
      JOIN users u ON u.id = $1
      WHERE c.id = $2
    `, [userId, courseId])

    if (!details) {
      return NextResponse.json({ error: 'Course or user not found' }, { status: 404 })
    }

    // Generate certificate number
    const certificateNumber = `TQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create certificate record
    const certificate = await queryOne(`
      INSERT INTO certificates (user_id, course_id, certificate_number, issued_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [userId, courseId, certificateNumber])

    // TODO: Generate actual certificate PDF/image
    // For now, return the certificate record
    const certificateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/certificate/${certificateNumber}`

    return NextResponse.json({
      success: true,
      certificate: {
        ...certificate,
        certificate_url: certificateUrl,
        course_title: details.course_title,
        student_name: details.full_name
      }
    })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Certificate verification endpoint
export async function verifyCertificate(certificateNumber) {
  try {
    const certificate = await queryOne(`
      SELECT c.*, co.title as course_title, u.full_name as student_name,
             e.completed_at
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON c.user_id = u.id
      JOIN enrollments e ON e.user_id = c.user_id AND e.course_id = c.course_id
      WHERE c.certificate_number = $1
    `, [certificateNumber])

    return certificate
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return null
  }
}
