import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function run() {
  await client.connect()
  console.log('Connected to AWS Production RDS')

  // Search in all _rels tables for any value that equals 'package'
  const tablesResult = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%_rels'
  `)

  console.log(`Searching through ${tablesResult.rows.length} relationship tables...`)

  for (const row of tablesResult.rows) {
    const tableName = row.table_name
    try {
      // Many-to-Many relationships usually have parent_id and then fields for the target
      // We check all columns for 'package'
      const columnsResult = await client.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}'
      `)
      
      for (const col of columnsResult.rows) {
        const colName = col.column_name
        const checkResult = await client.query(`SELECT * FROM "${tableName}" WHERE CAST("${colName}" AS TEXT) = 'package'`)
        if (checkResult.rows.length > 0) {
          console.log(`[ALERT] Found 'package' in table: ${tableName}, column: ${colName}`)
          console.log(checkResult.rows)
        }
      }
    } catch (e) {
      // Ignore errors (like type mismatches)
    }
  }

  // Also check main collection tables for single relationships
  // We look for columns that might be uploads or single relationships
  const allTables = await client.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT LIKE 'pg_%'
  `)

  for (const row of allTables.rows) {
      const tableName = row.table_name
      try {
        const checkResult = await client.query(`
            SELECT * FROM "${tableName}" 
            WHERE status = 'active' OR status = 'published' -- just a guess to filter data 
            LIMIT 1 -- just checking if query works
        `)
        // Actually, scan all columns for 'package'
         const columnsResult = await client.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}'
        `)
        for (const col of columnsResult.rows) {
            const colName = col.column_name
            const searchResult = await client.query(`SELECT id FROM "${tableName}" WHERE CAST("${colName}" AS TEXT) = 'package'`)
            if (searchResult.rows.length > 0) {
                console.log(`[ALERT] Found 'package' in main table: ${tableName}, column: ${colName}, IDs:`, searchResult.rows.map(r => r.id))
            }
        }
      } catch (e) {}
  }

  await client.end()
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
