import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function findIdList() {
  await client.connect()
  console.log('Searching for ID list [1406, 1239, 1197]...')

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
        WHERE CAST("${column_name}" AS TEXT) LIKE '%1406%' 
        AND CAST("${column_name}" AS TEXT) LIKE '%1239%'
        LIMIT 1
      `)
      
      if (result.rows.length > 0) {
        console.log(`[FOUND] Table: ${table_name}, Column: ${column_name}, Doc ID: ${result.rows[0].id}`)
        const full = await client.query(`SELECT * FROM "${table_name}" WHERE id = ${result.rows[0].id}`)
        console.log(JSON.stringify(full.rows[0]).substring(0, 1000))
      }
    } catch (e) {}
  }

  await client.end()
}

findIdList()
