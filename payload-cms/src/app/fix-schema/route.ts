import { NextResponse } from 'next/server'
import payload from 'payload'
import config from '@payload-config'

export const GET = async () => {
  await payload.init({ config })

  try {
    const queries = [
      // Users table missing columns
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" timestamp with time zone;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_secret" varchar;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "backup_codes" jsonb;`,

      // Users_rels for roles and directPermissions
      `CREATE TABLE IF NOT EXISTS "users_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "roles_id" integer,
        "permissions_id" integer
      );`,
      `CREATE INDEX IF NOT EXISTS "users_rels_order_idx" ON "users_rels" ("order");`,
      `CREATE INDEX IF NOT EXISTS "users_rels_parent_id_idx" ON "users_rels" ("parent_id");`,
      `CREATE INDEX IF NOT EXISTS "users_rels_path_idx" ON "users_rels" ("path");`
    ]

    for (const q of queries) {
      await payload.db.drizzle.execute(q)
    }

    return NextResponse.json({ success: true, message: "Schema patched successfully" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
