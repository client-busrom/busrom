import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function inspectBlog1() {
  await client.connect()
  console.log('Connected')

  console.log('--- Inspecting Blog 1 ---')
  const blogResult = await client.query('SELECT * FROM "blogs" WHERE id = 1')
  console.log(blogResult.rows[0])

  console.log('--- Inspecting localized content for Blog 1 ---')
  const contentResult = await client.query('SELECT * FROM "blogs_locales" WHERE _parent_id = 1')
  for (const row of contentResult.rows) {
      console.log(`Locale: ${row._locale}`)
      console.log('Content JSON snippet:', JSON.stringify(row.content_translation).substring(0, 500))
  }

  await client.end()
}

inspectBlog1()
