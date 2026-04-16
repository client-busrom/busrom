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
      // Aggressively remove EVERY field starting with underscores
      // ALSO remove 'id' from blocks as Payload might be picky about it in localized updates
      if (key.startsWith('_') || key === 'id') {
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
      
      const updatePromises = locales.map((loc, i) => {
        // Clean data for each locale before updating
        const cleanedData = cleanInternalFields(body.localesData[loc])
        
        // Log a sample for the first locale
        if (i === 0 && cleanedData.sections && cleanedData.sections[0]) {
          console.log(`[custom-globals PATCH] Sample cleaned block 0 keys for ${loc}:`, Object.keys(cleanedData.sections[0]))
        }
        
        return payload.updateGlobal({
          slug: slug as any,
          locale: loc as any,
          data: cleanedData,
        })
      })

      await Promise.all(updatePromises)
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
