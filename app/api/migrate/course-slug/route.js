import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// POST /api/migrate/course-slug - Run migration for course slug and indexes
export async function POST() {
  try {
    const logs = []

    // 1. Add slug column if not exists
    logs.push('Adding slug column...')
    try {
      await query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'courses' AND column_name = 'slug'
            ) THEN
                ALTER TABLE courses ADD COLUMN slug VARCHAR(255);
            END IF;
        END $$;
      `)
      logs.push('✓ Slug column added (or already exists)')
    } catch (e) {
      logs.push(`Slug check: ${e.message}`)
    }

    // 2. Generate slugs from titles
    logs.push('Generating slugs from titles...')
    const slugResult = await query(`
      UPDATE courses
      SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '\s+', '-', 'g'), '[^a-zA-Z0-9-]', '', 'g'))
      WHERE slug IS NULL OR slug = ''
      RETURNING id, title
    `)
    logs.push(`✓ Generated ${slugResult.rowCount} slugs`)

    // 3. Fix duplicate slugs
    logs.push('Fixing duplicate slugs...')
    const duplicateCheck = await query(`
      SELECT slug, COUNT(*) as count
      FROM courses
      WHERE slug IS NOT NULL AND slug != ''
      GROUP BY slug
      HAVING COUNT(*) > 1
    `)

    for (const row of duplicateCheck.rows) {
      const duplicates = await query(`
        SELECT id, slug
        FROM courses
        WHERE slug = $1
        ORDER BY created_at
      `, [row.slug])

      // Keep first one, update others
      for (let i = 1; i < duplicates.rows.length; i++) {
        const newSlug = `${row.slug}-${duplicates.rows[i].id.toString().substring(0, 8)}`
        await query(`
          UPDATE courses
          SET slug = $1
          WHERE id = $2
        `, [newSlug, duplicates.rows[i].id])
      }
    }
    logs.push(`✓ Fixed ${duplicateCheck.rowCount} duplicate slugs`)

    // 4. Add unique constraint
    logs.push('Adding unique constraint...')
    try {
      await query(`
        ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS courses_slug_key UNIQUE (slug)
      `)
      logs.push('✓ Unique constraint added')
    } catch (e) {
      logs.push(`Unique constraint: ${e.message}`)
    }

    // 5. Create indexes
    logs.push('Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug)',
      'CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category)',
      'CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published)',
      'CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC)'
    ]

    for (const indexSql of indexes) {
      try {
        await query(indexSql)
        logs.push(`✓ Index created`)
      } catch (e) {
        logs.push(`Index: ${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
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
