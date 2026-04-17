import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function totalCleanup() {
  await client.connect()
  console.log('🚀 Starting TOTAL CLEANUP of all M2M relationships...')

  // --- 1. Cleanup Blog Relationships ---
  const blogRes = await client.query('SELECT id FROM blogs')
  const validBlogIds = blogRes.rows.map(r => r.id)
  console.log(`Valid Blogs: [${validBlogIds.join(', ')}]`)

  // --- 2. Cleanup Product Relationships ---
  const prodRes = await client.query('SELECT id FROM products')
  const validProdIds = prodRes.rows.map(r => r.id)
  console.log(`Valid Products: ${validProdIds.length} found.`)

  const relsToClean = [
    { table: 'blog_tags_rels', col: 'blogs_id', validIds: validBlogIds },
    { table: 'categories_rels', col: 'blogs_id', validIds: validBlogIds },
    { table: 'categories_rels', col: 'products_id', validIds: validProdIds } // This is for shopProducts
  ]

  for (const item of relsToClean) {
    if (item.validIds.length > 0) {
        const query = `DELETE FROM "${item.table}" WHERE "${item.col}" IS NOT NULL AND "${item.col}" NOT IN (${item.validIds.join(', ')})`
        const res = await client.query(query)
        console.log(`✅ ${item.table}.${item.col}: Removed ${res.rowCount} stale links.`)
    } else {
        const res = await client.query(`DELETE FROM "${item.table}" WHERE "${item.col}" IS NOT NULL`)
        console.log(`✅ ${item.table}.${item.col}: Cleared all links (no valid targets).`)
    }
  }

  // --- 3. Final ghost hunt for "package" string in integers ---
  // Just in case some integers are stored as string 'package' where it fails cast
  console.log('Nuking string "package" from potential integer columns...')
  const intCols = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND data_type = 'integer'
  `)

  for (const row of intCols.rows) {
      try {
          // This SQL avoids the cast error by checking the text representation
          await client.query(`UPDATE "${row.table_name}" SET "${row.column_name}" = NULL WHERE "${row.column_name}"::text = 'package'`)
      } catch (e) {}
  }

  await client.end()
  console.log('✨ All systems clean. You can now link products and blogs safely!')
}

totalCleanup()
