import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/migrate/add-email-sent
 * Add email_sent column to orders table
 */
export async function POST() {
  try {
    // Add email_sent column to orders table
    await query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false
    `)

    return NextResponse.json({
      success: true,
      message: 'Successfully added email_sent column to orders table'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
