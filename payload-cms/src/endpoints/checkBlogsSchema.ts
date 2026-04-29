import type { PayloadHandler } from 'payload'

/**
 * Emergency endpoint to check database schema for Blogs collection.
 */
export const checkBlogsSchemaHandler: PayloadHandler = async (req) => {
  const { searchParams } = new URL(req.url || '', `http://${req.headers.get('host')}`)
  const secret = searchParams.get('secret')
  const expectedSecret = process.env.REVALIDATE_SECRET || 'busrom_revalidate_2024'

  if (!req.user && secret !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { payload } = req
  const adapter = payload.db as any
  const drizzle = adapter.drizzle

  if (!drizzle) {
    return Response.json({ error: 'Drizzle adapter not found' }, { status: 500 })
  }

  try {
    // 1. Check columns in 'blogs'
    const blogsColumns = await drizzle.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'blogs' 
      ORDER BY column_name
    `)

    // 2. Check columns in 'blogs_locales'
    const localesColumns = await drizzle.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'blogs_locales' 
      ORDER BY column_name
    `)

    // 3. Check if sub-tables exist
    const subTables = await drizzle.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'blogs_kb_%'
    `)

    return Response.json({
      blogsColumns: blogsColumns.rows || blogsColumns,
      localesColumns: localesColumns.rows || localesColumns,
      subTables: subTables.rows || subTables
    })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
