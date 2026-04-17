import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function localesScan() {
  await client.connect()
  console.log('Scanning all LOCALES tables for "package"...')

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%_locales'
  `)

  for (const tableRow of tables.rows) {
    const tableName = tableRow.table_name
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 
      AND (data_type = 'text' OR data_type = 'character varying')
    `, [tableName])

    for (const colRow of columns.rows) {
      const colName = colRow.column_name
      try {
        const result = await client.query(`SELECT _parent_id FROM "${tableName}" WHERE "${colName}" = 'package'`)
        if (result.rows.length > 0) {
          console.log(`[BINGO] Table: ${tableName}, Column: ${colName}, Parent IDs:`, result.rows.map(r => r._parent_id))
        }
      } catch (e) {}
    }
  }

  await client.end()
}

localesScan()
