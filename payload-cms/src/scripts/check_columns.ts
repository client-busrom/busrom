import { getPayload } from 'payload'
import configPromise from '../../payload.config'

async function checkColumns() {
  const payload = await getPayload({ config: configPromise })
  try {
    const db = (payload.db as any).drizzle
    if (db) {
      const { sql } = await import('drizzle-orm')
      const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'blogs'
        ORDER BY column_name;
      `)
      console.log('✅ Columns for "blogs":', result.rows.map((r: any) => r.column_name).join(', '))
      
      // Check for versions table
      const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'blogs_v%' OR table_name = '_blogs_v';
      `)
      console.log('✅ Version tables found:', tables.rows.map((r: any) => r.table_name).join(', '))
    }
  } catch (e: any) {
    console.error('❌ Error checking columns:', e.message)
  }
  process.exit(0)
}

checkColumns()
