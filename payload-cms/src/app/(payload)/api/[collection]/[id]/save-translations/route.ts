import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Bulk translation save endpoint
 * 
 * Saves localized field data for multiple locales in one request,
 * using the Local API with context flags to skip heavy afterChange hooks
 * (syncM2M) that cause transaction timeouts and data loss.
 * 
 * POST /api/[collection]/[id]/save-translations
 * Body: {
 *   locales: {
 *     "zh": { "title": "...", "excerpt": "..." },
 *     "es": { "title": "...", "excerpt": "..." },
 *     ...
 *   }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { locales } = body

    if (!locales || typeof locales !== 'object') {
      return NextResponse.json(
        { error: 'Missing "locales" object in request body' },
        { status: 400 }
      )
    }

    // Authenticate: extract user from cookie/header
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results: Record<string, { success: boolean; error?: string }> = {}

    // Get the localized table name based on collection
    const tableName = `${collection}_locales`

    for (const [localeCode, data] of Object.entries(locales)) {
      try {
        console.log(`[save-translations] SQL Mode: Writing ${localeCode} to ${tableName}`)
        
        const updateData = data as Record<string, any>
        const fields = Object.keys(updateData)
        
        if (fields.length === 0) {
          results[localeCode] = { success: true }
          continue
        }

        // Build UPSERT query for *_locales table
        // We need to match _parent_id and _locale
        const columns = ['_parent_id', '_locale', ...fields]
        const values = [id, localeCode, ...fields.map(f => updateData[f])]
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
        const updates = fields.map((f, i) => `${f} = EXCLUDED.${f}`).join(', ')

        const query = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (_parent_id, _locale)
          DO UPDATE SET ${updates}
          RETURNING id;
        `

        // Execute via payload.db (Postgres adapter)
        // We use string replacement with careful escaping for the quick fix
        const escapedQuery = query.replace(/\$\d+/g, (match) => {
          const idx = parseInt(match.slice(1)) - 1
          const val = values[idx]
          
          if (val === null || val === undefined) return 'NULL'
          if (typeof val === 'number' || typeof val === 'boolean') return val.toString()
          
          // Handle objects (JSON fields)
          const stringVal = typeof val === 'object' ? JSON.stringify(val) : val.toString()
          return `'${stringVal.replace(/'/g, "''")}'`
        })

        await payload.db.drizzle.execute(
          require('drizzle-orm').sql.raw(escapedQuery)
        )
        
        console.log(`[save-translations] SQL SUCCESS for locale=${localeCode}`)
        results[localeCode] = { success: true }
      } catch (e: any) {
        console.error(`[save-translations] ❌ SQL FAILED for locale=${localeCode}:`, e.message)
        results[localeCode] = { success: false, error: e.message }
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length
    const failCount = Object.values(results).filter(r => !r.success).length

    return NextResponse.json({
      message: `Saved ${successCount} locale(s), ${failCount} failed`,
      results,
    })
  } catch (error) {
    console.error('[save-translations] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save translations' },
      { status: 500 }
    )
  }
}
