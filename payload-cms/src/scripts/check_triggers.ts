import { getPayload } from 'payload'
import configPromise from '../../payload.config'

async function checkTriggers() {
  const payload = await getPayload({ config: configPromise })
  try {
    const db = (payload.db as any).drizzle
    if (db) {
      const { sql } = await import('drizzle-orm')
      const result = await db.execute(sql`
        SELECT trigger_name, event_manipulation, event_object_table, action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'blogs';
      `)
      console.log('✅ Triggers for "blogs":', JSON.stringify(result.rows, null, 2))
    }
  } catch (e: any) {
    console.error('❌ Error checking triggers:', e.message)
  }
  process.exit(0)
}

checkTriggers()
