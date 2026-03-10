import { Snap } from 'midtrans-client'

// Initialize Midtrans Snap client
let snapClient = null

export function getMidtransClient() {
  if (!snapClient) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const isProduction = process.env.NODE_ENV === 'production'

    if (!serverKey) {
      console.warn('MIDTRANS_SERVER_KEY not configured')
      return null
    }

    snapClient = new Snap({
      serverKey: serverKey,
      isProduction: isProduction,
    })
  }

  return snapClient
}

export function getClientKey() {
  return process.env.MIDTRANS_CLIENT_KEY || ''
}

// Generate order ID
export function generateOrderId(userId = 'guest') {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const userPart = (userId || 'GUEST').toString().replace(/[^A-Z0-9]/gi, '').substring(0, 6).toUpperCase() || 'GUEST'
  return `ORD-${userPart}-${timestamp}-${random}`.substring(0, 30)
}
