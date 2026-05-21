import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const doc = await payload.findGlobal({
      slug: slug as any,
      locale: 'all',
      depth: 0,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Global not found' }, { status: 404 })
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error('[custom-globals GET] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

/**
 * Clean internal Payload fields before updating
 */
function cleanInternalFields(data: any): any {
  if (data === null || data === undefined) return data

  if (Array.isArray(data)) {
    return data.map(item => cleanInternalFields(item))
  }

  if (typeof data === 'object') {
    const newObj: any = {}
    for (const key in data) {
      if (key.startsWith('_')) {
        continue
      }
      // Keep 'id' for array items - Payload needs it to match array items during updates
      newObj[key] = cleanInternalFields(data[key])
    }
    return newObj
  }

  return data
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')
    const body = await request.json()
    
    const payload = await getPayload({ config: configPromise })

    // Support bulk updates if 'localesData' is provided
    if (body.localesData && typeof body.localesData === 'object') {
      const locales = Object.keys(body.localesData)
      console.log(`[custom-globals PATCH] Bulk updating global "${slug}" for locales:`, locales)
      
      const results = []
      for (const loc of locales) {
        const data = body.localesData[loc]
        
        // Fetch existing data for the SPECIFIC locale being updated
        const existingLocaleDoc = await payload.findGlobal({
          slug: slug as any,
          locale: loc as any,
          depth: 0,
        })

        // Merge existing data with new localized data
        const mergedData = {
          ...existingLocaleDoc,
          ...data,
        }
        
        // Deep merge groups to preserve non-translatable fields
        for (const key in data) {
          if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
            mergedData[key] = {
              ...(existingLocaleDoc[key] || {}),
              ...data[key]
            }
          }
        }

        /**
         * Deduplicate arrays (especially relationship fields) to prevent validation errors
         */
        const deduplicateArrays = (obj: any): any => {
          if (Array.isArray(obj)) {
            // Deduplicate simple arrays (IDs, strings)
            const seen = new Set()
            return obj.filter(item => {
              const val = typeof item === 'object' && item !== null ? JSON.stringify(item) : item
              if (seen.has(val)) return false
              seen.add(val)
              return true
            })
          }
          if (typeof obj === 'object' && obj !== null) {
            const newObj: any = {}
            for (const key in obj) {
              newObj[key] = deduplicateArrays(obj[key])
            }
            return newObj
          }
          return obj
        }

        const cleanedData = cleanInternalFields(deduplicateArrays(mergedData))
        
        const result = await payload.updateGlobal({
          slug: slug as any,
          locale: loc as any,
          data: cleanedData,
          depth: 0,
          disableHooks: true,
          overrideAccess: true,
          context: {
            isTranslationSave: true,
            isSyncing: true
          }
        } as any)
        results.push(result)
      }

      return NextResponse.json({ success: true, message: 'Bulk update successful' })
    }

    // Fallback to single locale update
    const cleanedBody = cleanInternalFields(body)
    const result = await payload.updateGlobal({
      slug: slug as any,
      locale: (locale || 'en') as any,
      data: cleanedBody,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[custom-globals PATCH] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update' },
      { status: 500 }
    )
  }
}
