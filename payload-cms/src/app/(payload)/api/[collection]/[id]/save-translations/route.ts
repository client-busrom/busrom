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
        
        // Deep recursive cleaning to remove illegal fields from all levels
        const cleanPayload = (obj: any): any => {
          if (!obj || typeof obj !== 'object' || obj === null) return obj
          if (Array.isArray(obj)) return obj.map(cleanPayload)

          // Added more fields that might be injected by hooks: prevPost, nextPost, etc.
          const illegalFields = [
            'user', 'id', 'createdat', 'updatedat', '__v', 
            '_locale', '_parent_id', 'prevpost', 'nextpost', 
            'kb_recommended_posts_posts', 'kb_bottom_recommended_posts'
          ]
          const newObj: any = {}
          for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase()
            // Skip illegal fields (case-insensitive), internal payload fields starting with underscore, 
            // and any recommendation logic fields that are injected at runtime
            if (
              illegalFields.includes(lowerKey) || 
              (key.startsWith('_') && !['_id', 'id'].includes(key)) ||
              (lowerKey.startsWith('kb_') && (lowerKey.endsWith('_posts') || lowerKey.endsWith('_post')))
            ) {
              continue
            }
            newObj[key] = cleanPayload(value)
          }
          return newObj
        }

        const cleanData = cleanPayload(data)
        const preservedKeys = Object.keys(cleanData)
        console.log(`[save-translations] Locale=${localeCode}, Preserved keys: ${preservedKeys.join(', ')}`)
        
        // Final sanity check: explicitly ensure _locale is gone from top level
        if ('_locale' in cleanData) delete cleanData['_locale']
        if ('_parent_id' in cleanData) delete cleanData['_parent_id']
        if ('User' in cleanData) delete cleanData['User']
        if ('user' in cleanData) delete cleanData['user']

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
