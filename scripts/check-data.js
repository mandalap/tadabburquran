import { pool } from '../lib/db.js'

async function checkData() {
  const client = await pool.connect()
  try {
    console.log('=== CHECKING COURSES ===')
    const courses = await client.query(`
      SELECT id, title, category, is_published
      FROM courses
      ORDER BY created_at DESC
      LIMIT 10
    `)
    console.log('Total courses:', courses.rows.length)
    console.table(courses.rows)

    console.log('\n=== CHECKING CATEGORIES ===')
    const categories = await client.query(`
      SELECT id, name, slug, is_active, show_on_homepage
      FROM categories
      ORDER BY sort_order ASC
    `)
    console.log('Total categories:', categories.rows.length)
    console.table(categories.rows)

    console.log('\n=== CHECKING COURSES WITH CATEGORY JOIN ===')
    const coursesWithCategory = await client.query(`
      SELECT c.id, c.title, c.category, c.is_published, cat.name as category_name, cat.slug as category_slug
      FROM courses c
      LEFT JOIN categories cat ON c.category = cat.name
      ORDER BY c.created_at DESC
      LIMIT 10
    `)
    console.log('Courses with category info:')
    console.table(coursesWithCategory.rows)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    client.release()
    pool.end()
  }
}

checkData().catch(console.error)
