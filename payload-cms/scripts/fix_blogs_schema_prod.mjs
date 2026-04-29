/**
 * fix_blogs_schema_prod.mjs
 * 
 * Emergency script to fix production RDS schema for Blogs collection after adding KB widget overrides.
 * Adds missing columns to 'blogs' and 'blogs_locales' and creates necessary array sub-tables.
 */

import pg from 'pg'

const { Client } = pg

// Production RDS Connection String
const DATABASE_URI = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload?sslmode=no-verify'

const client = new Client({ connectionString: DATABASE_URI })

async function columnExists(table, column) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`,
    [table, column]
  )
  return rows.length > 0
}

async function tableExists(table) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [table]
  )
  return rows.length > 0
}

async function addColumnIfMissing(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`  ⏩ ${table}.${column} already exists, skip`)
  } else {
    try {
      await client.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`)
      console.log(`  ✅ Added ${table}.${column}`)
    } catch (e) {
      console.error(`  ❌ Failed to add ${table}.${column}:`, e.message)
    }
  }
}

async function run() {
  console.log('🔌 Connecting to production RDS...')
  await client.connect()
  console.log('✅ Connected\n')

  // 1. Fix 'blogs' main table
  console.log('📋 Patching "blogs" table...')
  await addColumnIfMissing('blogs', 'use_custom_overrides', 'BOOLEAN DEFAULT FALSE')
  await addColumnIfMissing('blogs', 'template_type', 'VARCHAR DEFAULT \'template1\'')
  
  // Widget Modes
  const modes = [
    'kb_toc_mode', 'kb_share_mode', 'kb_search_box_mode', 'kb_category_list_mode',
    'kb_recommended_posts_mode', 'kb_follow_us_mode', 'kb_bottom_categories_mode',
    'kb_pagination_mode', 'kb_bottom_recommended_mode'
  ]
  for (const mode of modes) {
    await addColumnIfMissing('blogs', mode, 'VARCHAR DEFAULT \'inherit\'')
  }

  // Other Logic Fields
  await addColumnIfMissing('blogs', 'kb_recommended_posts_logic', 'VARCHAR DEFAULT \'category\'')
  await addColumnIfMissing('blogs', 'kb_bottom_recommended_logic', 'VARCHAR DEFAULT \'category\'')
  await addColumnIfMissing('blogs', 'kb_pagination_type', 'VARCHAR DEFAULT \'auto\'')
  await addColumnIfMissing('blogs', 'kb_pagination_prev_post_id', 'INTEGER REFERENCES blogs(id) ON DELETE SET NULL')
  await addColumnIfMissing('blogs', 'kb_pagination_next_post_id', 'INTEGER REFERENCES blogs(id) ON DELETE SET NULL')

  // 2. Fix 'blogs_locales' table
  console.log('\n📋 Patching "blogs_locales" table...')
  const localeFields = [
    'kb_toc_title', 'kb_share_title', 'kb_search_box_placeholder', 
    'kb_category_list_title', 'kb_recommended_posts_title', 
    'kb_follow_us_title', 'kb_bottom_recommended_title'
  ]
  for (const field of localeFields) {
    await addColumnIfMissing('blogs_locales', field, 'VARCHAR')
  }

  // 3. Create Array Sub-tables
  console.log('\n📦 Creating array sub-tables...')
  
  if (!(await tableExists('blogs_kb_share_networks'))) {
    await client.query(`
      CREATE TABLE "blogs_kb_share_networks" (
        "_order" INTEGER NOT NULL,
        "_parent_id" INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
        "icon" VARCHAR NOT NULL,
        "url" VARCHAR NOT NULL
      )
    `)
    await client.query('CREATE INDEX "blogs_kb_share_networks_order_idx" ON "blogs_kb_share_networks" ("_order")')
    await client.query('CREATE INDEX "blogs_kb_share_networks_parent_id_idx" ON "blogs_kb_share_networks" ("_parent_id")')
    console.log('  ✅ Created table: blogs_kb_share_networks')
  } else {
    console.log('  ⏩ Table blogs_kb_share_networks already exists')
  }

  if (!(await tableExists('blogs_kb_follow_us_socials'))) {
    await client.query(`
      CREATE TABLE "blogs_kb_follow_us_socials" (
        "_order" INTEGER NOT NULL,
        "_parent_id" INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
        "icon" VARCHAR NOT NULL,
        "url" VARCHAR NOT NULL
      )
    `)
    await client.query('CREATE INDEX "blogs_kb_follow_us_socials_order_idx" ON "blogs_kb_follow_us_socials" ("_order")')
    await client.query('CREATE INDEX "blogs_kb_follow_us_socials_parent_id_idx" ON "blogs_kb_follow_us_socials" ("_parent_id")')
    console.log('  ✅ Created table: blogs_kb_follow_us_socials')
  } else {
    console.log('  ⏩ Table blogs_kb_follow_us_socials already exists')
  }

  console.log('\n🎉 Database patch for Blogs collection completed!')
  await client.end()
}

run().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
