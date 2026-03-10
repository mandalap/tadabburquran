import { query } from '@/lib/db'

export async function POST() {
  try {
    // Add rating column if not exists
    try {
      await query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5)`)
    } catch (e) {
      console.log('Rating column might already exist:', e.message)
    }

    // Add is_approved column if not exists
    try {
      await query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE`)
    } catch (e) {
      console.log('is_approved column might already exist:', e.message)
    }

    return Response.json({ success: true, message: 'Testimonials table migrated successfully' })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
