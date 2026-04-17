import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function megaScan() {
  await client.connect()
  console.log('Mega Scan Started...')

  const tables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (data_type LIKE 'char%' OR data_type = 'text' OR data_type = 'jsonb')
  `)

  console.log(`Scanning ${tables.rows.length} columns for 'package'...`)

  for (const row of tables.rows) {
    const { table_name, column_name } = row
    try {
      const result = await client.query(`
        SELECT id FROM "${table_name}" 
        WHERE CAST("${column_name}" AS TEXT) LIKE '%package%'
        LIMIT 5
      `)
      
      if (result.rows.length > 0) {
        console.log(`[FOUND] Table: ${table_name}, Column: ${column_name}, IDs:`, result.rows.map(r => r.id))
        
        // Let's see the full row
        const fullRow = await client.query(`SELECT * FROM "${table_name}" WHERE id = ${result.rows[0].id}`)
        console.log('Sample Data:', fullRow.rows[0])
      }
    } catch (e) {
      // console.error(`Error in ${table_name}.${column_name}:`, e.message)
    }
  }

  await client.end()
  console.log('Mega Scan Finished.')
}

megaScan()
