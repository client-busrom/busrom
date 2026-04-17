import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function relsScan() {
  await client.connect()
  console.log('Rels Scan Started...')

  const relsTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%_rels'
  `)

  for (const table of relsTables.rows) {
    const tableName = table.table_name
    const columns = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}'
    `)
    
    for (const col of columns.rows) {
        const colName = col.column_name
        try {
            const result = await client.query(`SELECT * FROM "${tableName}" WHERE CAST("${colName}" AS TEXT) = 'package'`)
            if (result.rows.length > 0) {
                console.log(`[BINGO] Found 'package' in table ${tableName}, column ${colName}`)
                console.log(result.rows)
            }
        } catch(e) {}
    }
  }

  // Also check product/blog/page tables for any column containing 'package' that should be a number
  console.log('Finished Rels. End.')
  await client.end()
}

relsScan()
