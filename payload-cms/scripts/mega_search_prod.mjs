import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function megaSearch() {
  await client.connect()
  console.log('Mega Search for "package" string...')

  const res = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (data_type = 'text' OR data_type = 'character varying' OR data_type = 'jsonb')
  `)

  for (const row of res.rows) {
    const { table_name, column_name } = row
    try {
      const bingo = await client.query(`
        SELECT count(*) FROM "${table_name}" 
        WHERE "${column_name}"::text LIKE '%package%'
      `)
      if (parseInt(bingo.rows[0].count) > 0) {
        console.log(`[FOUND] ${table_name}.${column_name}: ${bingo.rows[0].count} occurrences`)
        // Log a sample
        const sample = await client.query(`SELECT id, "${column_name}"::text FROM "${table_name}" WHERE "${column_name}"::text LIKE '%package%' LIMIT 1`)
        console.log('Sample:', sample.rows[0])
      }
    } catch (e) {}
  }

  await client.end()
}

megaSearch()
