/**
 * Prepare database for payload migrate command
 * 1. Delete dev mode migrations (batch = -1) to prevent interactive prompts
 * 2. Mark initial migration as complete if database already has tables
 *
 * Usage: node --import ./css-loader.mjs clear-dev-migrations.mjs
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'

const databaseUri = process.env.DATABASE_URI

if (!databaseUri) {
  console.error('DATABASE_URI environment variable is not set')
  process.exit(1)
}

async function prepareMigrations() {
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

    // Step 1: Delete dev migrations (batch = -1)
    const devMigrations = await client.query(
      'SELECT id, name FROM payload_migrations WHERE batch = -1'
    )

    if (devMigrations.rowCount > 0) {
      console.log(`Found ${devMigrations.rowCount} dev mode migration(s):`)
      devMigrations.rows.forEach(row => {
        console.log(`  - ${row.name}`)
      })

      const result = await client.query(
        'DELETE FROM payload_migrations WHERE batch = -1'
      )
      console.log(`Deleted ${result.rowCount} dev mode migration record(s)`)
    } else {
      console.log('No dev mode migrations found (batch = -1)')
    }

    // Step 2: Check if we need to mark initial migration as complete
    // If database has tables but no migration records, mark initial migration as done
    const usersTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      )
    `)

    if (usersTableCheck.rows[0].exists) {
      // Database has tables, check if initial migration is recorded
      const migrationsDir = path.join(process.cwd(), 'src', 'migrations')

      if (fs.existsSync(migrationsDir)) {
        const migrationFiles = fs.readdirSync(migrationsDir)
          .filter(f => f.endsWith('.ts') && !f.startsWith('index'))
          .map(f => f.replace('.ts', ''))
          .sort()

        for (const migrationName of migrationFiles) {
          const existingRecord = await client.query(
            'SELECT id FROM payload_migrations WHERE name = $1',
            [migrationName]
          )

          if (existingRecord.rowCount === 0) {
            console.log(`Marking migration as complete: ${migrationName}`)
            await client.query(
              `INSERT INTO payload_migrations (name, batch, created_at, updated_at)
               VALUES ($1, 1, NOW(), NOW())`,
              [migrationName]
            )
          }
        }
      }
    }

    console.log('Migration preparation complete')

  } catch (error) {
    console.error('Error preparing migrations:', error.message)
    // Don't exit with error - let migrate command handle it
  } finally {
    await client.end()
  }
}

prepareMigrations()
