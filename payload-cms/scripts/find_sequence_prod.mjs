import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function findSequence() {
  await client.connect()
  console.log('Searching for sequence [2064, 1756]...')

  const tables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (data_type = 'jsonb' OR data_type = 'text')
  `)

  for (const row of tables.rows) {
    const { table_name, column_name } = row
    try {
      const result = await client.query(`
        SELECT id FROM "${table_name}" 
        WHERE CAST("${column_name}" AS TEXT) LIKE '%2064%' 
        AND CAST("${column_name}" AS TEXT) LIKE '%1756%'
      `)
      
      if (result.rows.length > 0) {
        console.log(`[FOUND SEQUENCE] Table: ${table_name}, Column: ${column_name}, Doc IDs:`, result.rows.map(r => r.id))
        const full = await client.query(`SELECT * FROM "${table_name}" WHERE id = ${result.rows[0].id}`)
        console.log(JSON.stringify(full.rows[0]))
      }
    } catch (e) {}
  }

  await client.end()
}

findSequence()
