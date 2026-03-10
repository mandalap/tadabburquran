import { NextResponse } from 'next/server'
import { queryAll, queryOne } from '@/lib/db'
import { sendEmail } from '@/lib/email'

// GET /api/notifications - Get user notifications
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `
    const params = [userId]

    if (unreadOnly) {
      query += ' AND is_read = false'
    }

    query += ' ORDER BY created_at DESC LIMIT 50'

    const notifications = await queryAll(query, params)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/notifications - Create notification
export async function POST(req) {
  try {
    const body = await req.json()
    const { user_id, type, title, message, action_url, send_email = false, email_data = {} } = body

    if (!user_id || !type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user email for email notification
    let userEmail = null
    if (send_email) {
      const user = await queryOne('SELECT email, full_name FROM users WHERE id = $1', [user_id])
      userEmail = user?.email
      email_data.userName = user?.full_name || 'Sahabat Quran'
    }

    // Create notification in database
    const notification = await queryOne(`
      INSERT INTO notifications (user_id, type, title, message, action_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, type, title, message, action_url])

    // Send email if requested
    if (send_email && userEmail) {
      const emailType = type === 'enrollment' ? 'enrollment' :
                        type === 'payment_pending' ? 'paymentPending' :
                        type === 'welcome' ? 'welcome' : null

      if (emailType) {
        await sendEmail({
          to: userEmail,
          type: emailType,
          data: email_data
        })
      }
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(req) {
  try {
    const body = await req.json()
    const { notification_ids, user_id, mark_all = false } = body

    if (mark_all && user_id) {
      await queryOne(`
        UPDATE notifications
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = false
      `, [user_id])

      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (notification_ids && Array.isArray(notification_ids)) {
      await queryOne(`
        UPDATE notifications
        SET is_read = true, read_at = CURRENT_TIMESTAMP
        WHERE id = ANY($1)
      `, [notification_ids])

      return NextResponse.json({ success: true, message: 'Notifications marked as read' })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
