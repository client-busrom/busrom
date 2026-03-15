import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function checkTable(tableName) {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName])
  return res.rows[0].exists
}

async function run() {
  await client.connect()
  console.log('Connected to production RDS')

  // 1. Create product_series_rels
  console.log('Checking product_series_rels table...')
  if (!(await checkTable('product_series_rels'))) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "product_series_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "applications_id" integer
      )
    `)
    await client.query('ALTER TABLE "product_series_rels" ADD CONSTRAINT "product_series_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "product_series"("id") ON DELETE CASCADE')
    await client.query('ALTER TABLE "product_series_rels" ADD CONSTRAINT "product_series_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "applications"("id") ON DELETE CASCADE')
    
    await client.query('CREATE INDEX IF NOT EXISTS "product_series_rels_order_idx" ON "product_series_rels" ("order")')
    await client.query('CREATE INDEX IF NOT EXISTS "product_series_rels_parent_idx" ON "product_series_rels" ("parent_id")')
    await client.query('CREATE INDEX IF NOT EXISTS "product_series_rels_path_idx" ON "product_series_rels" ("path")')
    await client.query('CREATE INDEX IF NOT EXISTS "product_series_rels_applications_id_idx" ON "product_series_rels" ("applications_id")')
    console.log('✅ Created product_series_rels table')
  }

  console.log('\n🎉 Production schema synchronization v6 completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
