import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

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

  // 1. Fix Products table missing columns
  console.log('Checking products columns...')
  if (!(await checkColumn('products', 'linked_form_id'))) {
    await client.query('ALTER TABLE "products" ADD COLUMN "linked_form_id" integer REFERENCES "form_configs"("id") ON DELETE SET NULL')
    console.log('✅ Added linked_form_id to products')
  }
  if (!(await checkColumn('products', 'shop_visibility'))) {
    await client.query('ALTER TABLE "products" ADD COLUMN "shop_visibility" boolean DEFAULT true')
    console.log('✅ Added shop_visibility to products')
  }
  if (!(await checkColumn('products', 'is_hot'))) {
    await client.query('ALTER TABLE "products" ADD COLUMN "is_hot" boolean DEFAULT false')
    console.log('✅ Added is_hot to products')
  }
  if (!(await checkColumn('products', 'is_new'))) {
    await client.query('ALTER TABLE "products" ADD COLUMN "is_new" boolean DEFAULT false')
    console.log('✅ Added is_new to products')
  }
  if (!(await checkColumn('products', 'shop_order'))) {
    await client.query('ALTER TABLE "products" ADD COLUMN "shop_order" numeric DEFAULT 0')
    console.log('✅ Added shop_order to products')
  }

  // 2. Fix ProductSeries missing columns
  console.log('Checking product_series columns...')
  if (!(await checkColumn('product_series', 'is_featured'))) {
    await client.query('ALTER TABLE "product_series" ADD COLUMN "is_featured" boolean DEFAULT false')
    console.log('✅ Added is_featured to product_series')
  }

  // 3. Check for main_image relationship table in products
  // Product has name: 'mainImage', type: 'relationship', relationTo: 'media', hasMany: true
  // This should create "products_rels" with "media_id"
  console.log('Checking products_rels table...')
  const tableExists = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products_rels')")
  if (!tableExists.rows[0].exists) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "products_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "media_id" integer
      )
    `)
    await client.query('ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "products"("id") ON DELETE CASCADE')
    await client.query('ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE')
    
    await client.query('CREATE INDEX IF NOT EXISTS "products_rels_order_idx" ON "products_rels" ("order")')
    await client.query('CREATE INDEX IF NOT EXISTS "products_rels_parent_idx" ON "products_rels" ("parent_id")')
    await client.query('CREATE INDEX IF NOT EXISTS "products_rels_path_idx" ON "products_rels" ("path")')
    await client.query('CREATE INDEX IF NOT EXISTS "products_rels_media_id_idx" ON "products_rels" ("media_id")')
    console.log('✅ Created products_rels table')
  }

  console.log('\n🎉 Production schema synchronization completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
