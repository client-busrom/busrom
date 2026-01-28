import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'
})

await client.connect()

const result = await client.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'seo_settings'
  ORDER BY ordinal_position
`)

console.log('Columns in seo_settings table:')
result.rows.forEach(row => console.log(`  ${row.column_name} (${row.data_type})`))

await client.end()
