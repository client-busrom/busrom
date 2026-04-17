import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function checkRecentChanges() {
  await client.connect()
  console.log('Connected')

  const collections = ['blogs', 'products', 'categories']
  
  for (const collection of collections) {
    console.log(`--- Recent changes in ${collection} ---`)
    const result = await client.query(`SELECT id, updated_at FROM "${collection}" ORDER BY updated_at DESC LIMIT 5`)
    console.log(result.rows)
  }

  await client.end()
}

checkRecentChanges()
