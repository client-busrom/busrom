import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function checkGlobals() {
  await client.connect()
  console.log('Connected')

  console.log('--- Checking Globals Table ---')
  const result = await client.query('SELECT * FROM "globals"')
  
  for (const row of result.rows) {
      const dataStr = JSON.stringify(row)
      if (dataStr.includes('package')) {
          console.log(`[BINGO] Found 'package' in global: ${row.slug}`)
          console.log(JSON.stringify(row).substring(0, 2000))
      }
  }

  await client.end()
}

checkGlobals()
