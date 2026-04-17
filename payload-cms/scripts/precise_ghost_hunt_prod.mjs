import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function preciseGhostHunt() {
  await client.connect()
  console.log('Precise Ghost Hunt for Blogs ID 3 and 4...')

  const relsTables = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%_rels'
    AND column_name = 'blogs_id'
  `)

  for (const row of relsTables.rows) {
    const { table_name, column_name } = row
    const result = await client.query(`SELECT * FROM "${table_name}" WHERE "${column_name}" IN (3, 4)`)
    if (result.rows.length > 0) {
      console.log(`[BINGO] Found stale Blog reference in ${table_name}:`)
      console.log(result.rows)
    }
  }

  // Also check main collection tables that might have relationship fields to blogs
  // In your schema, Categories.blogPosts is a relationship to blogs.
  // It should be in categories_rels.blogs_id.
  
  await client.end()
}

preciseGhostHunt()
