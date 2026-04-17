import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Adding new values to the enum type for blog templates
  // Note: ALTER TYPE ... ADD VALUE cannot be rolled back easily in some Postgres versions
  // but it is necessary for the application to function.
  await db.execute(sql`
    ALTER TYPE "enum_blogs_template_type" ADD VALUE IF NOT EXISTS 'template1';
    ALTER TYPE "enum_blogs_template_type" ADD VALUE IF NOT EXISTS 'template2';
    ALTER TYPE "enum_blogs_template_type" ADD VALUE IF NOT EXISTS 'template3';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Removing values from an enum is not supported by Postgres ALTER TYPE
  // Usually requires recreating the type, which is destructive.
}
