/**
 * 手动应用 audit_logs 表的迁移。
 *
 * 由于本地数据库已经包含 traffic_summary 的若干列（与 0000 快照不一致），
 * 直接使用 drizzle-kit migrate 会因为基线问题失败。此脚本仅创建 audit_logs
 * 表及索引，并对已存在的列进行跳过，保证幂等。
 */
require('dotenv').config()
const { Client } = require('pg')

const sql = `
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(255),
  "user_email" varchar(255),
  "action" varchar(100) NOT NULL,
  "resource_type" varchar(100) NOT NULL,
  "resource_id" varchar(255),
  "details" jsonb DEFAULT '{}'::jsonb,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_type_idx" ON "audit_logs" USING btree ("resource_type");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
`

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    await client.query(sql)
    console.log('[apply-audit-migration] audit_logs table and indexes created/verified.')

    // 标记 Drizzle 迁移已应用（如果 drizzle_migrations 表存在）
    const check = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='drizzle_migrations'"
    )
    if (check.rows.length > 0) {
      await client.query(
        `INSERT INTO "drizzle_migrations" ("hash", "created_at") VALUES ($1, NOW()) ON CONFLICT DO NOTHING`,
        ['0001_crazy_microchip']
      )
      console.log('[apply-audit-migration] Migration marker inserted.')
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
