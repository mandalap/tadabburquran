import { pool } from '../lib/db.js'

async function fixCategories() {
  const client = await pool.connect()
  try {
    console.log('=== FIXING CATEGORY MISMATCH ===\n')

    // Update courses with category 'Ecourse' to 'E-Course'
    const result1 = await client.query(`
      UPDATE courses
      SET category = 'E-Course'
      WHERE category = 'Ecourse'
    `)
    console.log(`✓ Updated ${result1.rowCount} courses from 'Ecourse' to 'E-Course'`)

    // Update courses with category 'Webinar' to 'Webinara' (if exists)
    const result2 = await client.query(`
      UPDATE courses
      SET category = 'Webinara'
      WHERE category = 'Webinar'
    `)
    console.log(`✓ Updated ${result2.rowCount} courses from 'Webinar' to 'Webinara'`)

    console.log('\n=== VERIFYING THE FIX ===')
    const coursesWithCategory = await client.query(`
      SELECT c.id, c.title, c.category, c.is_published, cat.name as category_name, cat.slug as category_slug
      FROM courses c
      LEFT JOIN categories cat ON c.category = cat.name
      ORDER BY c.created_at DESC
    `)
    console.log('\nCourses with category info:')
    console.table(coursesWithCategory.rows)

    console.log('\nFix completed!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    client.release()
    pool.end()
  }
}

fixCategories().catch(console.error)
