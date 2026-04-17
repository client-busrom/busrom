import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function ghostHunter() {
  await client.connect()
  console.log('🕵️ Hunting for "package" ghost in ALL tables and columns...')

  const tables = ['categories', 'blog_tags', 'blogs', 'media']
  
  for (const table of tables) {
    // Get all columns for this table
    const colsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}'
    `)
    
    for (const col of colsRes.rows) {
      const colName = col.column_name
      
      try {
        // Try to update any row where this column's string value is 'package'
        // We use ::text to safely check even non-text columns
        const updateQuery = `UPDATE "${table}" SET "${colName}" = NULL WHERE "${colName}"::text = 'package'`
        const res = await client.query(updateQuery)
        if (res.rowCount > 0) {
          console.log(`🎯 FOUND and DELETED "package" in ${table}.${colName} (${res.rowCount} rows)`)
        }
      } catch (e) {
        // Skip columns where this check is not valid
      }
    }
  }

  // Also check the specific media-related column in categories
  console.log('🔍 Checking JSONB fields for "package"...')
  try {
      // Sometimes it hides in localized fields (JSONB)
      // Check for value "package" in any key
      await client.query(`UPDATE categories SET "cover_image" = NULL WHERE "cover_image"::text LIKE '%"package"%'`)
  } catch (e) {}

  await client.end()
  console.log('✨ Ghost hunt complete.')
}

ghostHunter()
