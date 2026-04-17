import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function ghostHunterCats() {
  await client.connect()
  console.log('Searching for stale references to CATEGORY ID 4...')

  const relsTables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%_rels'
    AND (column_name = 'categories_id' OR column_name = 'parent_id')
  `)

  for (const row of relsTables.rows) {
    const { table_name, column_name } = row
    try {
      const result = await client.query(`SELECT * FROM "${table_name}" WHERE "${column_name}" = 4`)
      if (result.rows.length > 0) {
        console.log(`[BINGO] Found stale Category reference in ${table_name}.${column_name}:`)
        console.log(result.rows)
      }
    } catch (e) {}
  }

  await client.end()
}

ghostHunterCats()
