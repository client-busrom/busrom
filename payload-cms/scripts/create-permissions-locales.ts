import { Pool } from 'pg'

async function createPermissionsLocalesTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Connecting to database...')
    const client = await pool.connect()

    console.log('Creating permissions_locales table...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions_locales (
        description varchar,
        id serial PRIMARY KEY NOT NULL,
        _locale "_locales" NOT NULL,
        _parent_id integer NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
      );
    `)

    console.log('Creating indexes...')

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS permissions_locales_locale_parent_id_unique
      ON permissions_locales (_locale, _parent_id);
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS permissions_locales_parent_id_idx
      ON permissions_locales (_parent_id);
    `)

    console.log('Successfully created permissions_locales table and indexes!')

    // Verify the tables exist
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('permissions_locales', 'roles_locales', 'users_locales')
      ORDER BY table_name
    `)
    console.log('Existing locales tables:', result.rows.map(r => r.table_name))

    client.release()
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await pool.end()
  }
}

createPermissionsLocalesTable()
