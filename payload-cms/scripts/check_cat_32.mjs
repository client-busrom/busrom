import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function checkCategory32() {
  await client.connect()
  console.log('Connected')

  console.log('--- Checking Category 32 ---')
  const cat = await client.query('SELECT * FROM "categories" WHERE id = 32')
  console.log(cat.rows[0])

  console.log('--- Checking category_rels for category 32 ---')
  const catRels = await client.query('SELECT * FROM "categories_rels" WHERE parent_id = 32')
  console.log(catRels.rows)

  console.log('--- Checking blog_tags_rels for any string value ---')
  const tagRels = await client.query('SELECT * FROM "blog_tags_rels" LIMIT 100')
  console.log(tagRels.rows.filter(r => isNaN(r.blogs_id) || isNaN(r.parent_id)))

  await client.end()
}

checkCategory32()
