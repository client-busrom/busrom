import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

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
        // console.log(`[cleanInternalFields] Stripping: ${key}`)
        continue
      }
      if (key === 'id') {
        // Keep IDs for array items/blocks ONLY if they are strings or numbers
        // Payload sometimes needs them for reconciliation, but let's try stripping them too
        // since the error mentioned _locale and _parent_id specifically
        continue
      }
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

        const cleanedData = cleanInternalFields(mergedData)
        
        const result = await payload.updateGlobal({
          slug: slug as any,
          locale: loc as any,
          data: cleanedData,
        })
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
