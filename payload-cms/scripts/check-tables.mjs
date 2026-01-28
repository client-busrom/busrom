import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'
})

await client.connect()

const result = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE '%seo%'
  ORDER BY table_name
`)

console.log('SEO-related tables:')
result.rows.forEach(row => console.log(' ', row.table_name))

const allTables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`)

console.log('\nAll tables:')
allTables.rows.forEach(row => console.log(' ', row.table_name))

await client.end()
