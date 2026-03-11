import { pool } from '../lib/db.js'

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Starting migration: Add show_on_homepage column to categories table...')

    // Cek apakah kolom show_on_homepage sudah ada
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'categories'
      AND column_name = 'show_on_homepage'
    `)

    if (checkColumn.rows.length > 0) {
      console.log('Column show_on_homepage already exists. Skipping migration.')
      return
    }

    // Tambah kolom show_on_homepage
    await client.query(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT true
    `)
    console.log('✓ Added column show_on_homepage to categories table')

    // Update existing rows
    await client.query(`
      UPDATE categories
      SET show_on_homepage = true
      WHERE show_on_homepage IS NULL
    `)
    console.log('✓ Updated existing categories with default value')

    // Tampilkan data kategori setelah migration
    const categories = await client.query(`
      SELECT id, name, slug, is_active, show_on_homepage
      FROM categories
      ORDER BY sort_order ASC
    `)

    console.log('\nCurrent categories:')
    console.table(categories.rows)

    console.log('\nMigration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
    pool.end()
  }
}

migrate().catch(console.error)
