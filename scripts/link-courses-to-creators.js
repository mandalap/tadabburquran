const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'tadabburquran',
  password: process.env.DB_PASSWORD || 'tadabburquran123',
  database: process.env.DB_NAME || 'tadabburquran_db',
})

async function linkCoursesToCreators() {
  const client = await pool.connect()
  try {
    console.log('Linking courses to creators...')

    // Get all creators
    const creatorsResult = await client.query('SELECT id, name FROM creators')
    const creators = creatorsResult.rows

    console.log(`Found ${creators.length} creators`)

    // Get all courses
    const coursesResult = await client.query('SELECT id, title, instructor, instructors FROM courses')
    const courses = coursesResult.rows

    console.log(`Found ${courses.length} courses`)

    let updated = 0

    for (const course of courses) {
      if (!course.instructor) continue

      // Find creator by name (case-insensitive partial match)
      const matchedCreator = creators.find(c =>
        course.instructor.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(course.instructor.toLowerCase())
      )

      if (matchedCreator) {
        // Update instructors array with creator_id
        const instructorsData = [
          {
            creator_id: matchedCreator.id,
            name: course.instructor,
            role: 'instructor'
          }
        ]

        await client.query(
          'UPDATE courses SET instructors = $1 WHERE id = $2',
          [JSON.stringify(instructorsData), course.id]
        )

        console.log(`✓ Updated "${course.title}" -> ${matchedCreator.name}`)
        updated++
      } else {
        console.log(`✗ No match for "${course.instructor}" in "${course.title}"`)
      }
    }

    console.log(`\n✅ Updated ${updated} courses`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

linkCoursesToCreators()
