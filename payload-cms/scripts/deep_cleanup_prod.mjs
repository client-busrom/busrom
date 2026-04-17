import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function deepCleanup() {
  await client.connect()
  console.log('Starting DEEP CLEANUP of stale blog relationships...')

  // 1. Get all valid blog IDs
  const blogRes = await client.query('SELECT id FROM blogs')
  const validBlogIds = blogRes.rows.map(r => r.id)
  console.log(`Current valid blog IDs: [${validBlogIds.join(', ')}]`)

  // 2. Identify tables that reference blogs
  const relsTables = [
    { table: 'blog_tags_rels', col: 'blogs_id' },
    { table: 'categories_rels', col: 'blogs_id' },
    { table: 'blogs_rels', col: 'parent_id' } // Self references would have been cleaned by Payload, but just in case
  ]

  for (const item of relsTables) {
    console.log(`Cleaning ${item.table}...`)
    
    // Delete records where the blog ID is not in the valid list
    // If valid list is not empty, use NOT IN. If empty, delete all? 
    // In our case we have ID 1 (and maybe 5 now).
    
    let query;
    if (validBlogIds.length > 0) {
        query = `DELETE FROM "${item.table}" WHERE "${item.col}" IS NOT NULL AND "${item.col}" NOT IN (${validBlogIds.join(', ')})`
    } else {
        query = `DELETE FROM "${item.table}" WHERE "${item.col}" IS NOT NULL`
    }
    
    const delRes = await client.query(query)
    console.log(`✅ Removed ${delRes.rowCount} stale references from ${item.table}`)
  }

  // 3. Special Case: Clear the "package" ghost once more from any column named 'icon' or 'image'
  const allCols = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (column_name LIKE '%icon%' OR column_name LIKE '%image%' OR column_name LIKE '%logo%')
    AND (data_type = 'text' OR data_type = 'character varying' OR data_type = 'integer')
  `)

  for (const row of allCols.rows) {
      try {
          const res = await client.query(`UPDATE "${row.table_name}" SET "${row.column_name}" = NULL WHERE "${row.column_name}"::text = 'package'`)
          if (res.rowCount > 0) {
              console.log(`✅ Nuked "package" from ${row.table_name}.${row.column_name} (${res.rowCount} rows)`)
          }
      } catch (e) {}
  }

  await client.end()
  console.log('Deep cleanup complete. Your relationships are now fresh!')
}

deepCleanup()
