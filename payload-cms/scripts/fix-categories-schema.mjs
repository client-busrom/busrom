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

async function checkColumn(tableName, columnName) {
  const res = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = $1 
      AND column_name = $2
    );
  `, [tableName, columnName])
  return res.rows[0].exists
}

async function run() {
  await client.connect()
  console.log('Connected to production RDS')

  // 1. Add missing columns to categories table
  console.log('Checking categories columns...')
  if (!(await checkColumn('categories', 'show_in_shop'))) {
    await client.query('ALTER TABLE "categories" ADD COLUMN "show_in_shop" boolean DEFAULT true')
    console.log('✅ Added show_in_shop to categories')
  }
  if (!(await checkColumn('categories', 'shop_tab_order'))) {
    await client.query('ALTER TABLE "categories" ADD COLUMN "shop_tab_order" numeric DEFAULT 0')
    console.log('✅ Added shop_tab_order to categories')
  }

  // 2. Create categories_rels table
  console.log('Checking categories_rels table...')
  if (!(await checkTable('categories_rels'))) {
    await client.query(`
      CREATE TABLE "categories_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "categories_id" integer,
        "products_id" integer
      )
    `)
    await client.query('ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE')
    await client.query('ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE CASCADE')
    await client.query('ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE CASCADE')
    
    await client.query('CREATE INDEX "categories_rels_order_idx" ON "categories_rels" ("order")')
    await client.query('CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" ("parent_id")')
    await client.query('CREATE INDEX "categories_rels_path_idx" ON "categories_rels" ("path")')
    await client.query('CREATE INDEX "categories_rels_categories_id_idx" ON "categories_rels" ("categories_id")')
    await client.query('CREATE INDEX "categories_rels_products_id_idx" ON "categories_rels" ("products_id")')
    
    console.log('✅ Created categories_rels table and indexes')
  }

  // 3. Add category_id to payload_locked_documents_rels if missing
  console.log('Checking payload_locked_documents_rels category link...')
  if (!(await checkColumn('payload_locked_documents_rels', 'categories_id'))) {
    await client.query('ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer REFERENCES "categories"("id") ON DELETE CASCADE')
    await client.query('CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" ("categories_id")')
    console.log('✅ Added categories_id to payload_locked_documents_rels')
  }

  console.log('\n🎉 Category collection schema fixes completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
