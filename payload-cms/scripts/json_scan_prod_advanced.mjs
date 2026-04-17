import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function jsonScan() {
  await client.connect()
  console.log('Scanning all JSONB columns for "package"...')

  const tables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (data_type = 'jsonb' OR data_type = 'json')
  `)

  for (const row of tables.rows) {
    const { table_name, column_name } = row
    try {
      // Search for the word package inside the JSONB structure
      const result = await client.query(`
        SELECT id FROM "${table_name}" 
        WHERE "${column_name}"::text LIKE '%"package"%'
      `)
      if (result.rows.length > 0) {
        console.log(`[BINGO] Table: ${table_name}, Column: ${column_name}, Parent IDs:`, result.rows.map(r => r.id))
      }
    } catch (e) {}
  }

  await client.end()
}

jsonScan()
