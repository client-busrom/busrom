import pg from 'pg'
const { Client } = pg

// Using the production RDS connection string from your existing working scripts
const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function run() {
  await client.connect()
  console.log('Connected to AWS Production RDS')

  console.log('Updating enum_blogs_template_type with safe DO block...')
  
  // Adding the missing enum values directly via SQL
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_blogs_template_type' AND e.enumlabel = 'template1') THEN
        ALTER TYPE "enum_blogs_template_type" ADD VALUE 'template1';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_blogs_template_type' AND e.enumlabel = 'template2') THEN
        ALTER TYPE "enum_blogs_template_type" ADD VALUE 'template2';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_blogs_template_type' AND e.enumlabel = 'template3') THEN
        ALTER TYPE "enum_blogs_template_type" ADD VALUE 'template3';
      END IF;
    END
    $$;
  `)

  console.log('✅ Successfully synced Blog Template Enums for Production!')
  await client.end()
}

run().catch(err => {
  console.error('❌ Error executing production fix:', err.message)
  process.exit(1)
})
