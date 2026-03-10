import { queryOne } from '@/lib/db'
import { auth } from '@/lib/auth'

// PATCH - Update order status
export async function PATCH(request, { params }) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return Response.json({ error: 'Status is required' }, { status: 400 })
    }

    const order = await queryOne(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, id]
    )

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
