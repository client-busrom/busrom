import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { collection, id } = await params
    const body = await req.json()
    const { locales, user } = body

    if (!locales || typeof locales !== 'object') {
      return NextResponse.json({ error: 'Invalid locales data' }, { status: 400 })
    }

    const results: Record<string, { success: boolean; error?: string }> = {}

    // Process each locale sequentially using Payload Local API
    for (const [localeCode, data] of Object.entries(locales)) {
      try {
        console.log(`[save-translations] Updating locale=${localeCode} for ${collection}/${id}`)
        
        // Defensive cleaning: remove system fields or injected fields that would fail validation
        // Especially 'User' which seems to be injected by plugins/hooks
        const cleanData = { ...(data as any) }
        const illegalFields = ['User', 'user', 'id', 'createdAt', 'updatedAt', '__v']
        illegalFields.forEach(f => {
          if (f in cleanData) delete cleanData[f]
        })

        await payload.update({
          collection: collection as any,
          id,
          data: cleanData,
          locale: localeCode as any,
          user, 
          context: { 
            isTranslationSave: true,
            isSyncing: true
          }
        })
        results[localeCode] = { success: true }
      } catch (err: any) {
        console.error(`[save-translations] ❌ Failed locale=${localeCode}:`, err.message)
        results[localeCode] = { success: false, error: err.message }
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('[save-translations] Global error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
