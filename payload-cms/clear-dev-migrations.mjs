/**
 * Clear dev mode migrations (batch = -1) before running payload migrate
 * This prevents the interactive prompt asking about data loss
 *
 * Usage: node --import ./css-loader.mjs clear-dev-migrations.mjs
 */

import pg from 'pg'

const databaseUri = process.env.DATABASE_URI

if (!databaseUri) {
  console.error('DATABASE_URI environment variable is not set')
  process.exit(1)
}

async function clearDevMigrations() {
  // Enable SSL for production database connections (AWS RDS requires SSL)
  const client = new pg.Client({
    connectionString: databaseUri,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  try {
    await client.connect()

    // Check if payload_migrations table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'payload_migrations'
      )
    `)

    if (!tableCheck.rows[0].exists) {
      console.log('payload_migrations table does not exist yet, skipping')
      return
    }

    // Check for dev migrations (batch = -1)
    const devMigrations = await client.query(
      'SELECT id, name FROM payload_migrations WHERE batch = -1'
    )

    if (devMigrations.rowCount === 0) {
      console.log('No dev mode migrations found (batch = -1)')
      return
    }

    console.log(`Found ${devMigrations.rowCount} dev mode migration(s):`)
    devMigrations.rows.forEach(row => {
      console.log(`  - ${row.name}`)
    })

    // Delete dev migrations
    const result = await client.query(
      'DELETE FROM payload_migrations WHERE batch = -1'
    )

    console.log(`Deleted ${result.rowCount} dev mode migration record(s)`)

  } catch (error) {
    console.error('Error clearing dev migrations:', error.message)
    // Don't exit with error - let migrate command handle it
  } finally {
    await client.end()
  }
}

clearDevMigrations()
