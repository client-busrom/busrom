import type { PayloadHandler } from 'payload'

/**
 * Emergency endpoint to fix database schema for Blogs collection.
 * Adds missing columns and creates necessary array sub-tables.
 */
export const fixBlogsSchemaHandler: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { payload } = req
  const adapter = payload.db as any
  const drizzle = adapter.drizzle

  if (!drizzle) {
    return Response.json({ error: 'Drizzle adapter not found' }, { status: 500 })
  }

  const results: string[] = []

  const execute = async (sql: string, description: string) => {
    try {
      await drizzle.execute(sql)
      results.push(`✅ SUCCESS: ${description}`)
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        results.push(`⏩ SKIP: ${description} (Already exists)`)
      } else {
        results.push(`❌ FAILED: ${description} - ${e.message}`)
      }
    }
  }

  // 1. Patch 'blogs' main table
  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "use_custom_overrides" BOOLEAN DEFAULT FALSE', 'Add use_custom_overrides to blogs')
  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "template_type" VARCHAR DEFAULT \'template1\'', 'Add template_type to blogs')

  const modes = [
    'kb_toc_mode', 'kb_share_mode', 'kb_search_box_mode', 'kb_category_list_mode',
    'kb_recommended_posts_mode', 'kb_follow_us_mode', 'kb_bottom_categories_mode',
    'kb_pagination_mode', 'kb_bottom_recommended_mode'
  ]
  for (const mode of modes) {
    await execute(`ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "${mode}" VARCHAR DEFAULT 'inherit'`, `Add ${mode} to blogs`)
  }

  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "kb_recommended_posts_logic" VARCHAR DEFAULT \'category\'', 'Add kb_recommended_posts_logic')
  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "kb_bottom_recommended_logic" VARCHAR DEFAULT \'category\'', 'Add kb_bottom_recommended_logic')
  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "kb_pagination_type" VARCHAR DEFAULT \'auto\'', 'Add kb_pagination_type')
  
  // Note: These might fail if 'blogs' table doesn't have the PK yet (unlikely) or if self-reference is tricky
  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "kb_pagination_prev_post_id" INTEGER REFERENCES blogs(id) ON DELETE SET NULL', 'Add kb_pagination_prev_post_id')
  await execute('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "kb_pagination_next_post_id" INTEGER REFERENCES blogs(id) ON DELETE SET NULL', 'Add kb_pagination_next_post_id')

  // 2. Patch 'blogs_locales' table
  const localeFields = [
    'kb_toc_title', 'kb_share_title', 'kb_search_box_placeholder', 
    'kb_category_list_title', 'kb_recommended_posts_title', 
    'kb_follow_us_title', 'kb_bottom_recommended_title'
  ]
  for (const field of localeFields) {
    await execute(`ALTER TABLE "blogs_locales" ADD COLUMN IF NOT EXISTS "${field}" VARCHAR`, `Add ${field} to blogs_locales`)
  }

  // 3. Create Array Sub-tables
  await execute(`
    CREATE TABLE IF NOT EXISTS "blogs_kb_share_networks" (
      "_order" INTEGER NOT NULL,
      "_parent_id" INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
      "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
      "icon" VARCHAR NOT NULL,
      "url" VARCHAR NOT NULL
    )
  `, 'Create blogs_kb_share_networks')
  
  await execute('CREATE INDEX IF NOT EXISTS "blogs_kb_share_networks_order_idx" ON "blogs_kb_share_networks" ("_order")', 'Index share_networks_order')
  await execute('CREATE INDEX IF NOT EXISTS "blogs_kb_share_networks_parent_id_idx" ON "blogs_kb_share_networks" ("_parent_id")', 'Index share_networks_parent')

  await execute(`
    CREATE TABLE IF NOT EXISTS "blogs_kb_follow_us_socials" (
      "_order" INTEGER NOT NULL,
      "_parent_id" INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
      "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
      "icon" VARCHAR NOT NULL,
      "url" VARCHAR NOT NULL
    )
  `, 'Create blogs_kb_follow_us_socials')

  await execute('CREATE INDEX IF NOT EXISTS "blogs_kb_follow_us_socials_order_idx" ON "blogs_kb_follow_us_socials" ("_order")', 'Index socials_order')
  await execute('CREATE INDEX IF NOT EXISTS "blogs_kb_follow_us_socials_parent_id_idx" ON "blogs_kb_follow_us_socials" ("_parent_id")', 'Index socials_parent')

  return Response.json({
    message: 'Database schema patch completed',
    results
  })
}
