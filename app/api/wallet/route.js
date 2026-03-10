import { NextResponse } from 'next/server'
import { queryOne, queryAll, query } from '@/lib/db'

// GET /api/wallet - Get user wallet balance
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Get wallet balance
    const wallet = await queryOne(`
      SELECT balance, updated_at
      FROM wallets
      WHERE user_id = $1
    `, [userId])

    // Get recent transactions
    const transactions = await queryAll(`
      SELECT * FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId])

    return NextResponse.json({
      success: true,
      balance: wallet?.balance || 0,
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/wallet - Top up or deduct from wallet
export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, amount, type, description, reference_id } = body

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { error: 'userId, amount, and type are required' },
        { status: 400 }
      )
    }

    if (!['topup', 'purchase', 'refund', 'reward'].includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    // Get current balance
    const wallet = await queryOne(`
      SELECT balance FROM wallets WHERE user_id = $1
    `, [userId])

    const currentBalance = wallet?.balance || 0
    let newBalance = currentBalance

    // Calculate new balance based on type
    if (type === 'topup' || type === 'refund' || type === 'reward') {
      newBalance = currentBalance + amount
    } else if (type === 'purchase') {
      if (currentBalance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }
      newBalance = currentBalance - amount
    }

    // Create or update wallet
    await query(`
      INSERT INTO wallets (user_id, balance)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET balance = $2, updated_at = NOW()
    `, [userId, newBalance])

    // Create transaction record
    const transaction = await queryOne(`
      INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, description, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, type, amount, currentBalance, newBalance, description || null, reference_id || null])

    return NextResponse.json({
      success: true,
      balance: newBalance,
      transaction
    })
  } catch (error) {
    console.error('Error processing wallet transaction:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/wallet/transfer - Transfer between users
export async function PUT(req) {
  try {
    const body = await req.json()
    const { fromUserId, toUserId, amount, description } = body

    if (!fromUserId || !toUserId || !amount) {
      return NextResponse.json(
        { error: 'fromUserId, toUserId, and amount are required' },
        { status: 400 }
      )
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: 'Cannot transfer to same user' },
        { status: 400 }
      )
    }

    // Get both wallets
    const fromWallet = await queryOne(`
      SELECT balance FROM wallets WHERE user_id = $1
    `, [fromUserId])

    if (!fromWallet || fromWallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    const toWallet = await queryOne(`
      SELECT balance FROM wallets WHERE user_id = $1
    `, [toUserId])

    const fromBalance = fromWallet.balance
    const toBalance = toWallet?.balance || 0

    // Update balances
    await query(`
      INSERT INTO wallets (user_id, balance)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET balance = $2, updated_at = NOW()
    `, [fromUserId, fromBalance - amount])

    await query(`
      INSERT INTO wallets (user_id, balance)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET balance = $2, updated_at = NOW()
    `, [toUserId, toBalance + amount])

    // Create transaction records
    const referenceId = `TRF-${Date.now()}`

    await query(`
      INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, description, reference_id)
      VALUES ($1, 'transfer_out', $2, $3, $4, $5, $6)
    `, [fromUserId, amount, fromBalance, fromBalance - amount, description || 'Transfer keluar', referenceId])

    await query(`
      INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, description, reference_id)
      VALUES ($1, 'transfer_in', $2, $3, $4, $5, $6)
    `, [toUserId, amount, toBalance, toBalance + amount, description || 'Transfer masuk', referenceId])

    return NextResponse.json({
      success: true,
      message: 'Transfer successful'
    })
  } catch (error) {
    console.error('Error processing transfer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
