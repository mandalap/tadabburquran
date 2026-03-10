import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// POST /api/migrate/fix-constraint - Fix unique constraint for slug
export async function POST() {
  try {
    const logs = []

    // Check if constraint exists first
    const constraintCheck = await query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'courses' AND constraint_type = 'UNIQUE'
    `)

    const hasSlugConstraint = constraintCheck.rows.some(
      row => row.constraint_name === 'courses_slug_key'
    )

    if (!hasSlugConstraint) {
      logs.push('Adding unique constraint on slug...')

      // Remove any duplicates first
      const duplicates = await query(`
        SELECT slug, COUNT(*) as count
        FROM courses
        WHERE slug IS NOT NULL AND slug != ''
        GROUP BY slug
        HAVING COUNT(*) > 1
      `)

      for (const row of duplicates.rows) {
        const dupRows = await query(`
          SELECT id, slug
          FROM courses
          WHERE slug = $1
          ORDER BY created_at ASC
        `, [row.slug])

        for (let i = 1; i < dupRows.rows.length; i++) {
          const newSlug = `${row.slug}-${dupRows.rows[i].id.toString().substring(0, 8)}`
          await query(`UPDATE courses SET slug = $1 WHERE id = $2`, [newSlug, dupRows.rows[i].id])
          logs.push(`Fixed duplicate: ${row.slug} -> ${newSlug}`)
        }
      }

      // Add constraint
      await query(`ALTER TABLE courses ADD CONSTRAINT courses_slug_key UNIQUE (slug)`)
      logs.push('✓ Unique constraint added')
    } else {
      logs.push('✓ Unique constraint already exists')
    }

    return NextResponse.json({
      success: true,
      message: 'Constraint migration completed',
      logs
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
