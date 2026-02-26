/**
 * fix-missing-columns.mjs
 *
 * Adds missing columns to existing RDS PostgreSQL tables.
 *
 * Two issues found in production logs:
 * 1. payload_locked_documents_rels — missing FK columns for new collections:
 *    product_attributes_id, product_templates_id, product_reusable_blocks_id,
 *    series_templates_id, series_reusable_blocks_id
 *
 * 2. form_configs_fields_options — missing column: has_custom_input (boolean)
 *
 * Also creates the new collection tables themselves if they don't exist yet.
 *
 * Usage:
 *   DATABASE_URI="postgresql://user:pass@rds-host:5432/dbname" node payload-cms/scripts/create-missing-tables.mjs
 */

import pg from 'pg'

const { Client } = pg

const DATABASE_URI = process.env.DATABASE_URI
if (!DATABASE_URI) {
  console.error('❌ DATABASE_URI environment variable is required')
  process.exit(1)
}

const client = new Client({
  connectionString: DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

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
    await client.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    console.log(`  ✅ Added ${table}.${column}`)
  }
}

async function run() {
  console.log('🔌 Connecting to RDS PostgreSQL...')
  await client.connect()
  console.log('✅ Connected\n')

  // ══════════════════════════════════════════════════════════════
  // 1. Create new collection tables (if not already exist)
  // ══════════════════════════════════════════════════════════════
  console.log('📦 Creating new collection tables...')

  const newTables = {
    product_attributes: `
      CREATE TABLE IF NOT EXISTS product_attributes (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(255) NOT NULL,
        category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )`,
    product_templates: `
      CREATE TABLE IF NOT EXISTS product_templates (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(255) NOT NULL,
        category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )`,
    product_reusable_blocks: `
      CREATE TABLE IF NOT EXISTS product_reusable_blocks (
        id           SERIAL PRIMARY KEY,
        slug         VARCHAR(255) NOT NULL UNIQUE,
        category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        status       VARCHAR(50) DEFAULT 'draft',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )`,
    series_templates: `
      CREATE TABLE IF NOT EXISTS series_templates (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(255) NOT NULL,
        category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )`,
    series_reusable_blocks: `
      CREATE TABLE IF NOT EXISTS series_reusable_blocks (
        id           SERIAL PRIMARY KEY,
        slug         VARCHAR(255) NOT NULL UNIQUE,
        category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        status       VARCHAR(50) DEFAULT 'draft',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )`,
  }

  for (const [tableName, sql] of Object.entries(newTables)) {
    const exists = await tableExists(tableName)
    if (exists) {
      console.log(`  ⏩ Table ${tableName} already exists, skip`)
    } else {
      await client.query(sql)
      console.log(`  ✅ Created table: ${tableName}`)
    }
  }

  // ══════════════════════════════════════════════════════════════
  // 2. FIX: payload_locked_documents_rels — add missing FK columns
  // ══════════════════════════════════════════════════════════════
  console.log('\n📋 Fixing payload_locked_documents_rels columns...')
  await addColumnIfMissing('payload_locked_documents_rels', 'product_attributes_id',   'INTEGER REFERENCES product_attributes(id) ON DELETE SET NULL')
  await addColumnIfMissing('payload_locked_documents_rels', 'product_templates_id',    'INTEGER REFERENCES product_templates(id) ON DELETE SET NULL')
  await addColumnIfMissing('payload_locked_documents_rels', 'product_reusable_blocks_id', 'INTEGER REFERENCES product_reusable_blocks(id) ON DELETE SET NULL')
  await addColumnIfMissing('payload_locked_documents_rels', 'series_templates_id',     'INTEGER REFERENCES series_templates(id) ON DELETE SET NULL')
  await addColumnIfMissing('payload_locked_documents_rels', 'series_reusable_blocks_id', 'INTEGER REFERENCES series_reusable_blocks(id) ON DELETE SET NULL')

  // ══════════════════════════════════════════════════════════════
  // 3. FIX: form_configs_fields_options — add has_custom_input
  // ══════════════════════════════════════════════════════════════
  console.log('\n📋 Fixing form_configs_fields_options columns...')
  await addColumnIfMissing('form_configs_fields_options', 'has_custom_input', 'BOOLEAN DEFAULT FALSE')

  // ══════════════════════════════════════════════════════════════
  // 4. Verify
  // ══════════════════════════════════════════════════════════════
  console.log('\n🔍 Verifying all required columns...')

  const checks = [
    ['payload_locked_documents_rels', 'product_attributes_id'],
    ['payload_locked_documents_rels', 'product_templates_id'],
    ['payload_locked_documents_rels', 'product_reusable_blocks_id'],
    ['payload_locked_documents_rels', 'series_templates_id'],
    ['payload_locked_documents_rels', 'series_reusable_blocks_id'],
    ['form_configs_fields_options', 'has_custom_input'],
  ]

  let allGood = true
  for (const [table, column] of checks) {
    const ok = await columnExists(table, column)
    console.log(`  ${ok ? '✅' : '❌'} ${table}.${column}`)
    if (!ok) allGood = false
  }

  console.log(allGood ? '\n🎉 All columns present! CMS should work now.' : '\n❌ Some columns still missing!')

  await client.end()
}

run().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
