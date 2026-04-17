import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function checkAllPossibleMediaIds() {
  await client.connect()
  console.log('Deep cleaning relationship IDs...')

  const tables = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (column_name LIKE '%image%' OR column_name LIKE '%media%' OR column_name LIKE '%icon%' OR column_name LIKE '%id%')
  `)

  for (const row of tables.rows) {
    const { table_name, column_name, data_type } = row
    
    // We only care about columns that can hold strings but are meant to be IDs
    if (data_type === 'text' || data_type === 'character varying') {
        try {
            const bingo = await client.query(`SELECT id, "${column_name}" FROM "${table_name}" WHERE "${column_name}" = 'package'`)
            if (bingo.rows.length > 0) {
                console.log(`[FOUND IT!!!] Table: ${table_name}, Column: ${column_name}, Row IDs:`, bingo.rows.map(r => r.id))
            }
        } catch (e) {}
    }
  }

  await client.end()
}

checkAllPossibleMediaIds()
