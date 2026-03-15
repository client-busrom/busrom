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

  // 1. Create System Notifications tables
  console.log('Checking system_notifications tables...')
  if (!(await checkTable('system_notifications'))) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "system_notifications" (
        "id" serial PRIMARY KEY NOT NULL,
        "subject" varchar NOT NULL,
        "type" varchar DEFAULT 'info',
        "status" varchar DEFAULT 'PUBLISHED',
        "is_global_banner" boolean DEFAULT false,
        "expires_at" timestamp with time zone,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `)
    console.log('✅ Created system_notifications table')
  }

  if (!(await checkTable('system_notifications_locales'))) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "system_notifications_locales" (
        "content" jsonb NOT NULL,
        "id" serial PRIMARY KEY NOT NULL,
        "_locale" varchar NOT NULL,
        "_parent_id" integer NOT NULL
      )
    `)
    await client.query('ALTER TABLE "system_notifications_locales" ADD CONSTRAINT "system_notifications_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "system_notifications"("id") ON DELETE CASCADE')
    console.log('✅ Created system_notifications_locales table')
  }

  // 2. Ensuring System Notifications in payload_locked_documents_rels
  console.log('Checking payload_locked_documents_rels for system_notifications...')
  if (!(await checkColumn('payload_locked_documents_rels', 'system_notifications_id'))) {
    await client.query('ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "system_notifications_id" integer REFERENCES "system_notifications"("id") ON DELETE CASCADE')
    await client.query('CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_system_notifications_id_idx" ON "payload_locked_documents_rels" ("system_notifications_id")')
    console.log('✅ Added system_notifications_id to payload_locked_documents_rels')
  }

  // 3. Ensuring category_id in Blogs
  console.log('Checking blogs_rels for categories_id...')
  if (!(await checkColumn('blogs_rels', 'categories_id'))) {
    await client.query('ALTER TABLE "blogs_rels" ADD COLUMN "categories_id" integer REFERENCES "categories"("id") ON DELETE CASCADE')
    await client.query('CREATE INDEX IF NOT EXISTS "blogs_rels_categories_id_idx" ON "blogs_rels" ("categories_id")')
    console.log('✅ Added categories_id to blogs_rels')
  }

  console.log('\n🎉 Final production schema synchronization completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
