import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function columnExists(tableName, columnName) {
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
  console.log('🚀 Starting production database fix for "blogs" collection...')
  await client.connect()
  console.log('✅ Connected to production RDS')

  const tableName = 'blogs'

  // 1. Check and add admin_label
  console.log(`Checking column "admin_label" in table "${tableName}"...`)
  if (!(await columnExists(tableName, 'admin_label'))) {
    console.log('adding column "admin_label" to "blogs" table...')
    await client.query(`ALTER TABLE "${tableName}" ADD COLUMN "admin_label" text;`)
    console.log('✅ Successfully added "admin_label"')
  } else {
    console.log('ℹ️ Column "admin_label" already exists.')
  }

  // 2. Check and add template_type (often added together with admin_label for blogs)
  console.log(`Checking column "template_type" in table "${tableName}"...`)
  if (!(await columnExists(tableName, 'template_type'))) {
    console.log('adding column "template_type" to "blogs" table...')
    // Based on Blogs.ts, templateType is a radio with default 'template1'
    await client.query(`ALTER TABLE "${tableName}" ADD COLUMN "template_type" varchar DEFAULT 'template1';`)
    console.log('✅ Successfully added "template_type"')
  } else {
    console.log('ℹ️ Column "template_type" already exists.')
  }

  console.log('\n🎉 Production database fix completed!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error executing fix:', err.message)
  if (err.stack) console.error(err.stack)
  process.exit(1)
})
