import pg from 'pg'
const { Client } = pg

const LOCAL_DB_URL = 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload'

async function checkSchema() {
  const client = new Client({ connectionString: LOCAL_DB_URL })

  try {
    await client.connect()

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'seo_settings'
      ORDER BY ordinal_position
    `)

    console.log('seo_settings table columns:')
    result.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type})`)
    })

  } finally {
    await client.end()
  }
}

checkSchema()
