/**
 * Migration script to add email_sent column to orders table
 * Run with: node scripts/run-migration-email-sent.js
 */

const { query } = require('../lib/db')

async function runMigration() {
  try {
    console.log('Starting migration: Add email_sent column to orders table...')

    // Check if column exists
    const checkResult = await query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'email_sent'
      )
    `)

    const columnExists = checkResult.rows[0].exists

    if (columnExists) {
      console.log('✅ Column email_sent already exists in orders table')
    } else {
      // Add the column
      await query(`ALTER TABLE orders ADD COLUMN email_sent BOOLEAN DEFAULT FALSE`)
      console.log('✅ Added email_sent column to orders table')

      // Add index
      await query(`CREATE INDEX IF NOT EXISTS idx_orders_email_sent ON orders(email_sent)`)
      console.log('✅ Added index idx_orders_email_sent')
    }

    // Verify the column was added
    const verifyResult = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'email_sent'
    `)

    if (verifyResult.rows.length > 0) {
      console.log('✅ Migration completed successfully!')
      console.log('Column details:', verifyResult.rows[0])
    } else {
      console.log('⚠️ Migration may have failed - column not found')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
