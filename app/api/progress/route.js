import { NextResponse } from 'next/server'
import { queryOne, queryAll } from '@/lib/db'

// GET /api/progress - Get user progress for a course
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const courseId = searchParams.get('course_id')

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'user_id and course_id are required' }, { status: 400 })
    }

    // Get enrollment progress
    const enrollment = await queryOne(`
      SELECT progress, completed_at, last_watched_lesson, last_watched_position, enrolled_at
      FROM enrollments
      WHERE user_id = $1 AND course_id = $2
    `, [userId, courseId])

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Get lesson progress details
    const lessonProgress = await queryAll(`
      SELECT lesson_id, completed, watched_seconds, last_watched_at
      FROM lesson_progress
      WHERE user_id = $1 AND course_id = $2
    `, [userId, courseId])

    // Get course modules for detailed progress
    const course = await queryOne(`
      SELECT modules FROM courses WHERE id = $1
    `, [courseId])

    return NextResponse.json({
      success: true,
      progress: {
        overall: enrollment.progress || 0,
        completed_at: enrollment.completed_at,
        last_watched_lesson: enrollment.last_watched_lesson,
        last_watched_position: enrollment.last_watched_position,
        enrolled_at: enrollment.enrolled_at
      },
      lessonProgress,
      modules: course?.modules || []
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/progress - Update lesson progress
export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, courseId, lessonId, lessonModuleId, watchedSeconds, duration, completed } = body

    if (!userId || !courseId || !lessonId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const course = await queryOne(`
      SELECT modules FROM courses WHERE id = $1
    `, [courseId])

    const parseDurationToSeconds = (value) => {
      if (!value) return 0
      if (typeof value === 'number') return value
      const text = value.toString().trim()
      if (text.includes(':')) {
        const parts = text.split(':').map(Number)
        if (parts.length === 3) {
          return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
        }
        if (parts.length === 2) {
          return (parts[0] || 0) * 60 + (parts[1] || 0)
        }
      }
      const hourMatch = text.match(/(\d+)\s*jam/i)
      const minuteMatch = text.match(/(\d+)\s*menit/i)
      if (hourMatch || minuteMatch) {
        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0
        const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0
        return hours * 3600 + minutes * 60
      }
      const num = Number(text)
      return Number.isFinite(num) ? num * 60 : 0
    }

    const lessonDurations = {}
    let totalSeconds = 0
    let totalLessons = 0
    if (course?.modules) {
      course.modules.forEach((mod) => {
        mod.lessons?.forEach((lesson) => {
          const key = lesson.id || lesson.title
          const durationSeconds = parseDurationToSeconds(lesson.duration)
          if (key) {
            lessonDurations[key] = durationSeconds
            totalSeconds += durationSeconds
            totalLessons += 1
          }
        })
      })
    }

    // Update or insert lesson progress
    const normalizedDuration = duration || lessonDurations[lessonId] || 0
    const normalizedWatched = watchedSeconds || 0
    const normalizedCompleted = completed === true || (normalizedDuration > 0 && normalizedWatched >= normalizedDuration)

    await queryOne(`
      INSERT INTO lesson_progress (user_id, course_id, lesson_id, module_id, watched_seconds, duration, completed, last_watched_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id, course_id, lesson_id)
      DO UPDATE SET
        watched_seconds = EXCLUDED.watched_seconds,
        duration = EXCLUDED.duration,
        completed = EXCLUDED.completed,
        last_watched_at = NOW()
    `, [userId, courseId, lessonId, lessonModuleId || null, normalizedWatched, normalizedDuration, normalizedCompleted])

    const lessonRows = await queryAll(`
      SELECT lesson_id, watched_seconds, duration, completed
      FROM lesson_progress
      WHERE user_id = $1 AND course_id = $2
    `, [userId, courseId])

    let watchedTotal = 0
    let completedLessons = 0
    lessonRows.forEach((row) => {
      const dur = row.duration || lessonDurations[row.lesson_id] || 0
      if (row.completed) completedLessons += 1
      if (dur > 0) {
        watchedTotal += row.completed ? dur : Math.min(row.watched_seconds || 0, dur)
      }
    })

    const progressPercent = totalSeconds > 0 ? Math.round((watchedTotal / totalSeconds) * 100) : 0

    // Check if course is completed
    let completedAt = null
    let isCourseCompleted = false

    if (progressPercent >= 100 && totalSeconds > 0) {
      const currentEnrollment = await queryOne(`
        SELECT completed_at FROM enrollments
        WHERE user_id = $1 AND course_id = $2
      `, [userId, courseId])

      if (!currentEnrollment?.completed_at) {
        completedAt = new Date().toISOString()
        isCourseCompleted = true
      }
    }

    // Update enrollment
    await queryOne(`
      INSERT INTO enrollments (user_id, course_id, progress, last_watched_lesson, last_watched_position, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET
        progress = EXCLUDED.progress,
        last_watched_lesson = EXCLUDED.last_watched_lesson,
        last_watched_position = EXCLUDED.last_watched_position,
        completed_at = COALESCE(EXCLUDED.completed_at, enrollments.completed_at)
    `, [userId, courseId, progressPercent, lessonId, watchedSeconds || 0, completedAt])

    return NextResponse.json({
      success: true,
      progress: progressPercent,
      completedLessons,
      totalLessons,
      isCourseCompleted,
      completedAt
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/progress/reset - Reset progress (for re-watching)
export async function PUT(req) {
  try {
    const body = await req.json()
    const { userId, courseId, lessonId } = body

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'user_id and course_id are required' }, { status: 400 })
    }

    if (lessonId) {
      // Reset specific lesson
      await queryOne(`
        UPDATE lesson_progress
        SET completed = false, watched_seconds = 0
        WHERE user_id = $1 AND course_id = $2 AND lesson_id = $3
      `, [userId, courseId, lessonId])
    } else {
      // Reset entire course
      await queryOne(`
        DELETE FROM lesson_progress
        WHERE user_id = $1 AND course_id = $2
      `, [userId, courseId])

      await queryOne(`
        UPDATE enrollments
        SET progress = 0, last_watched_lesson = NULL, last_watched_position = 0, completed_at = NULL
        WHERE user_id = $1 AND course_id = $2
      `, [userId, courseId])
    }

    return NextResponse.json({ success: true, message: 'Progress reset successfully' })
  } catch (error) {
    console.error('Error resetting progress:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
