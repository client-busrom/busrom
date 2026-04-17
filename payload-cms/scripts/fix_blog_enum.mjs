import { getPayload } from 'payload'
import config from '../payload.config.ts'
import { sql } from '@payloadcms/db-postgres'

async function fixEnum() {
  console.log('--- Rescuing Blog Template Enum ---')
  
  const payload = await getPayload({ config })
  const db = payload.db

  try {
    console.log('Updating enum_blogs_template_type...')
    
    // In Payload 3.0 with Postgres, the drizzle instance is usually under db.drizzle
    const connection = payload.db.drizzle;
    
    await connection.execute(sql`
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

    console.log('✅ Successfully added template1, template2, and template3 to the enum.')
  } catch (err) {
    console.error('❌ Failed to update enum:', err.message)
  }

  process.exit(0)
}

fixEnum()
