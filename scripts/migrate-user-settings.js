const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'tadabburquran',
  password: process.env.DB_PASSWORD || 'tadabburquran123',
  database: process.env.DB_NAME || 'tadabburquran_db',
})

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Running migration: add_user_settings_columns')

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS promo_notifications BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS hide_purchase_history BOOLEAN DEFAULT FALSE
    `)

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
