import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function findStaleReferences() {
  await client.connect()
  console.log('Searching for stale references to Blogs ID 4 (and 3)...')

  // Find all columns in rels tables that point to blogs
  const relsTables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%_rels'
    AND (column_name = 'blogs_id' OR column_name = 'parent_id')
  `)

  for (const row of relsTables.rows) {
    const { table_name, column_name } = row
    try {
      // We look for ID 4 specifically, but also check for other potential ghosts
      const result = await client.query(`SELECT * FROM "${table_name}" WHERE "${column_name}" IN (3, 4)`)
      if (result.rows.length > 0) {
        console.log(`[STALE] Found references in table: ${table_name}, column: ${column_name}`)
        console.log(result.rows)
      }
    } catch (e) {}
  }

  // Also check if any main table has blog_id or similar
  const allTables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (column_name LIKE '%blog%' OR column_name = 'author_id')
    AND data_type = 'integer'
  `)

  for (const row of allTables.rows) {
      try {
          const res = await client.query(`SELECT id FROM "${row.table_name}" WHERE "${row.column_name}" IN (3, 4)`)
          if (res.rows.length > 0) {
              console.log(`[STALE] Found in main table: ${row.table_name}, column: ${row.column_name}, IDs:`, res.rows)
          }
      } catch (e) {}
  }

  await client.end()
}

findStaleReferences()
