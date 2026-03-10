import { NextResponse } from 'next/server'
import { queryAll, queryOne } from '@/lib/db'

// GET /api/debug/user-orders - Debug user orders and enrollments
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Get user by email
    const user = await queryOne(
      `SELECT id, email, full_name, username FROM users WHERE email ILIKE $1`,
      [`%${email}%`]
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found', email })
    }

    // Get all orders for this user
    const orders = await queryAll(
      `SELECT id, user_id, course_id, course_name, price, payment_method, payment_status, transaction_id, paid_at, created_at
       FROM orders WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    )

    // Get all enrollments for this user
    const enrollments = await queryAll(
      `SELECT id, user_id, course_id, enrolled_at, completed_at, progress
       FROM enrollments WHERE user_id = $1
       ORDER BY enrolled_at DESC`,
      [user.id]
    )

    return NextResponse.json({
      user,
      ordersCount: orders.length,
      orders,
      enrollmentsCount: enrollments.length,
      enrollments
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
