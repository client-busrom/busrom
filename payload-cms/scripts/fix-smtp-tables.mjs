import pg from 'pg'
const { Client } = pg

const connectionString = 'postgresql://busrom_admin:ADijIRcAHMHLHaZvH0eg@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_payload'

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

async function run() {
  await client.connect()
  console.log('Connected to production RDS')

  // 1. Create smtp_configs table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "smtp_configs" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "smtp_host" varchar NOT NULL,
      "smtp_port" numeric DEFAULT 587,
      "smtp_user" varchar NOT NULL,
      "smtp_password" varchar NOT NULL,
      "email_from_address" varchar,
      "notification_enabled" boolean DEFAULT true,
      "notification_emails" varchar,
      "auto_reply_enabled" boolean DEFAULT false,
      "status" varchar DEFAULT 'enabled',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)
  console.log('✅ smtp_configs table created')

  // 2. Create smtp_configs_locales table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "smtp_configs_locales" (
      "email_from_name" varchar DEFAULT 'Busrom',
      "notification_subject" varchar DEFAULT 'New Form Submission: {formName}',
      "auto_reply_subject" varchar DEFAULT 'Thank you for contacting Busrom',
      "auto_reply_template" jsonb,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    )
  `)
  await client.query(`
    ALTER TABLE "smtp_configs_locales"
      DROP CONSTRAINT IF EXISTS "smtp_configs_locales_parent_id_fk"
  `)
  await client.query(`
    ALTER TABLE "smtp_configs_locales"
      ADD CONSTRAINT "smtp_configs_locales_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "smtp_configs"("id") ON DELETE CASCADE
  `)
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "smtp_configs_locales_locale_parent_id_unique"
      ON "smtp_configs_locales" USING btree ("_locale", "_parent_id")
  `)
  console.log('✅ smtp_configs_locales table created')

  // 3. Create smtp_configs_rels table (for hasMany relationship to form-configs)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "smtp_configs_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "form_configs_id" integer
    )
  `)
  await client.query(`
    ALTER TABLE "smtp_configs_rels"
      DROP CONSTRAINT IF EXISTS "smtp_configs_rels_parent_fk"
  `)
  await client.query(`
    ALTER TABLE "smtp_configs_rels"
      ADD CONSTRAINT "smtp_configs_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "smtp_configs"("id") ON DELETE CASCADE
  `)
  await client.query(`
    ALTER TABLE "smtp_configs_rels"
      DROP CONSTRAINT IF EXISTS "smtp_configs_rels_form_configs_fk"
  `)
  await client.query(`
    ALTER TABLE "smtp_configs_rels"
      ADD CONSTRAINT "smtp_configs_rels_form_configs_fk"
      FOREIGN KEY ("form_configs_id") REFERENCES "form_configs"("id") ON DELETE CASCADE
  `)
  await client.query(`
    CREATE INDEX IF NOT EXISTS "smtp_configs_rels_order_idx" ON "smtp_configs_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "smtp_configs_rels_parent_idx" ON "smtp_configs_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "smtp_configs_rels_path_idx" ON "smtp_configs_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "smtp_configs_rels_form_configs_id_idx" ON "smtp_configs_rels" USING btree ("form_configs_id");
  `)
  console.log('✅ smtp_configs_rels table created')

  // 4. Create indexes on smtp_configs
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "smtp_configs_name_idx" ON "smtp_configs" USING btree ("name");
    CREATE INDEX IF NOT EXISTS "smtp_configs_updated_at_idx" ON "smtp_configs" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "smtp_configs_created_at_idx" ON "smtp_configs" USING btree ("created_at");
  `)
  console.log('✅ smtp_configs indexes created')

  // 5. Add smtp_configs_id to payload_locked_documents_rels
  await client.query(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "smtp_configs_id" integer
  `)
  await client.query(`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_smtp_configs_id_idx"
      ON "payload_locked_documents_rels" USING btree ("smtp_configs_id")
  `)
  await client.query(`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_smtp_configs_fk"
  `)
  await client.query(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_smtp_configs_fk"
      FOREIGN KEY ("smtp_configs_id") REFERENCES "smtp_configs"("id") ON DELETE CASCADE
  `)
  console.log('✅ payload_locked_documents_rels.smtp_configs_id added')

  // 6. Also add to payload_preferences_rels if it exists
  const prefRelsCheck = await client.query(`
    SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_preferences_rels'
  `)
  if (prefRelsCheck.rows.length > 0) {
    await client.query(`
      ALTER TABLE "payload_preferences_rels"
        ADD COLUMN IF NOT EXISTS "smtp_configs_id" integer
    `)
    console.log('✅ payload_preferences_rels.smtp_configs_id added')
  }

  // 7. Remove email_config global reference (cleanup, non-breaking)
  // The email_config data stays in DB, just no longer referenced

  console.log('\n🎉 All done! Production DB is fixed.')

  await client.end()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
