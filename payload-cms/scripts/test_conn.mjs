import pg from 'pg'
const { Client } = pg

const DATABASE_URI = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

async function test() {
  console.log('Testing with ssl: { rejectUnauthorized: false }')
  const client1 = new Client({
    connectionString: DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  })
  try {
    await client1.connect()
    console.log('✅ Success with rejectUnauthorized: false')
    await client1.end()
    return
  } catch (e) {
    console.log('❌ Failed:', e.message)
  }

  console.log('\nTesting with ssl: true')
  const client2 = new Client({
    connectionString: DATABASE_URI,
    ssl: true
  })
  try {
    await client2.connect()
    console.log('✅ Success with ssl: true')
    await client2.end()
    return
  } catch (e) {
    console.log('❌ Failed:', e.message)
  }

  console.log('\nTesting with connection string param sslmode=require')
  const client3 = new Client({
    connectionString: DATABASE_URI + '?sslmode=require'
  })
  try {
    await client3.connect()
    console.log('✅ Success with sslmode=require')
    await client3.end()
    return
  } catch (e) {
    console.log('❌ Failed:', e.message)
  }
}

test()
