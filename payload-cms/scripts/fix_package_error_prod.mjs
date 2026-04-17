import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function fix() {
  await client.connect()
  console.log('Connected to Production RDS')

  console.log('Fixing media_categories table...')
  const result = await client.query(`
    UPDATE media_categories 
    SET icon = NULL 
    WHERE icon = 'package'
  `)
  
  console.log(`✅ Updated ${result.rowCount} records in media_categories.`)

  // Also check if any other tables had this issue just in case
  const blogsResult = await client.query(`
    SELECT table_name, column_name FROM information_schema.columns 
    WHERE table_name LIKE 'blogs%' AND (column_name LIKE '%image%' OR column_name LIKE '%icon%')
  `)
  
  for (const row of blogsResult.rows) {
      try {
          const update = await client.query(`UPDATE "${row.table_name}" SET "${row.column_name}" = NULL WHERE "${row.column_name}" = 'package'`)
          if (update.rowCount > 0) {
              console.log(`✅ Fixed ${update.rowCount} records in ${row.table_name}.${row.column_name}`)
          }
      } catch (e) {}
  }

  await client.end()
  console.log('Fix complete.')
}

fix()
