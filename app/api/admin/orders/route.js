import { queryAll, queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET - Fetch all orders
export async function GET(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    let query = `
      SELECT
        o.id,
        u.full_name as user_name,
        u.email as user_email,
        o.price as total,
        o.payment_method,
        o.payment_status,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    const params = []

    if (status && status !== 'all') {
      if (status === 'completed') {
        query += ' WHERE o.payment_status = $1'
        params.push('paid')
      } else if (status === 'pending') {
        query += ' WHERE o.payment_status = $1'
        params.push('pending')
      } else if (status === 'cancelled') {
        query += ' WHERE o.payment_status IN ($1, $2)'
        params.push('failed', 'expired')
      }
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)

    const orders = await queryAll(query, params)

    const normalizedOrders = orders.map(order => ({
      ...order,
      status: order.payment_status === 'paid'
        ? 'completed'
        : order.payment_status === 'pending'
          ? 'pending'
          : 'cancelled'
    }))

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM orders o'
    const countParams = []

    if (status && status !== 'all') {
      if (status === 'completed') {
        countQuery += ' WHERE o.payment_status = $1'
        countParams.push('paid')
      } else if (status === 'pending') {
        countQuery += ' WHERE o.payment_status = $1'
        countParams.push('pending')
      } else if (status === 'cancelled') {
        countQuery += ' WHERE o.payment_status IN ($1, $2)'
        countParams.push('failed', 'expired')
      }
    }

    const countResult = await queryOne(countQuery, countParams)
    const total = parseInt(countResult.count) || 0

    return Response.json({
      orders: normalizedOrders,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Internal server error', orders: [], total: 0 }, { status: 500 })
  }
}
