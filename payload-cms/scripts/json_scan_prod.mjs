import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function jsonScan() {
  await client.connect()
  console.log('JSONB Scan Started...')

  const columns = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE data_type = 'jsonb'
  `)

  for (const row of columns.rows) {
    const { table_name, column_name } = row
    try {
      // Search for the word "package" as a value in the JSONB
      // This is a bit complex in SQL, so we'll just check if the string representation contains it
      const result = await client.query(`
        SELECT id, "${column_name}" FROM "${table_name}" 
        WHERE CAST("${column_name}" AS TEXT) LIKE '%"package"%'
        OR CAST("${column_name}" AS TEXT) LIKE '%: "package"%'
        LIMIT 5
      `)
      
      if (result.rows.length > 0) {
        console.log(`[FOUND IN JSONB] Table: ${table_name}, Column: ${column_name}`)
        for (const r of result.rows) {
            console.log(`ID: ${r.id}`)
            // console.log(JSON.stringify(r[column_name]).substring(0, 500))
        }
      }
    } catch (e) {}
  }

  await client.end()
  console.log('JSONB Scan Finished.')
}

jsonScan()
