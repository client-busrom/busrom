import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function ultimatePackageHunt() {
  await client.connect()
  console.log('🧐 ULTIMATE SCAN for "package" in the WHOLE DATABASE...')

  // Get all user tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `)
  
  for (const tableRow of tablesRes.rows) {
    const table = tableRow.table_name
    
    // Get all columns for this table
    const colsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${table}'
    `)
    
    for (const colRow of colsRes.rows) {
      const col = colRow.column_name
      
      try {
        const countRes = await client.query(`SELECT count(*) FROM "${table}" WHERE "${col}"::text = 'package'`)
        const count = parseInt(countRes.rows[0].count)
        
        if (count > 0) {
          console.log(`📡 FOUND! Table: ${table}, Column: ${col}, Count: ${count}`)
          
          // NUKE IT
          const nukeRes = await client.query(`UPDATE "${table}" SET "${col}" = NULL WHERE "${col}"::text = 'package'`)
          console.log(`💥 NUKED ${nukeRes.rowCount} rows in ${table}.${col}`)
        }
      } catch (e) {
        // Skip incompatible types
      }
    }
  }

  await client.end()
  process.exit(0)
}

ultimatePackageHunt()
