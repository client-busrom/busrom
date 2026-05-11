import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Bulk translation save endpoint
 * 
 * Saves localized field data for multiple locales in one request.
 * Uses the Payload Local API with context flags to skip heavy hooks (syncM2M)
 * and bypasses the dangerous raw SQL that fails on complex schema structures.
 * 
 * POST /api/[collection]/[id]/save-translations
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

    // Authenticate
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results: Record<string, { success: boolean; error?: string }> = {}

    // Process each locale sequentially using Payload Local API
    for (const [localeCode, data] of Object.entries(locales)) {
      try {
        console.log(`[save-translations] Updating locale=${localeCode} for ${collection}/${id}`)
        
        // Defensive cleaning: remove internal Payload fields that might crash relationship mapping
        const cleanData = JSON.parse(JSON.stringify(data))
        const stripInternalFields = (obj: any) => {
          if (!obj || typeof obj !== 'object') return
          if (Array.isArray(obj)) {
            obj.forEach(stripInternalFields)
            return
          }
          Object.keys(obj).forEach(key => {
            if (key.startsWith('_') && key !== '_order') delete obj[key]
            else stripInternalFields(obj[key])
          })
        }
        stripInternalFields(cleanData)

        await payload.update({
          collection: collection as any,
          id,
          data: cleanData,
          locale: localeCode as any,
          user, 
          context: { 
            isTranslationSave: true,
            isSyncing: true
          },
          overrideAccess: true,
          depth: 0,
        } as any)
        
        results[localeCode] = { success: true }
      } catch (e: any) {
        console.error(`[save-translations] ❌ Failed to update locale=${localeCode}:`, e.message)
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
    console.error('[save-translations] Critical Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save translations' },
      { status: 500 }
    )
  }
}
