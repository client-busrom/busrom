import { getPayload } from 'payload'
import config from '@payload-config'
import { regenerateImageSizesTask } from '../../../../jobs/regenerateImageSizes'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const payload = await getPayload({ config })
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const systemSecret = process.env.FIX_IMAGES_SECRET || 'busrom-fix-2026'

  if (secret !== systemSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid secret' }, { status: 401 })
  }
  
  try {
    // Find a super-admin user to satisfy hooks/plugins (like auditor) that require a user
    const adminUserRes = await payload.find({
      collection: 'users',
      where: {
        isAdmin: { equals: true },
      },
      limit: 1,
      depth: 0,
    })
    const adminUser = adminUserRes.docs[0]

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'No admin user found to perform this action' }, { status: 500 })
    }
    
    // Find all media items (total 2796 as of checking)
    const mediaItems = await payload.find({
      collection: 'media',
      limit: 5000,
      depth: 0,
    })

    let results = []

    for (const doc of mediaItems.docs) {
      if (!doc.mimeType?.startsWith('image/')) continue
      
      try {
        const result = await regenerateImageSizesTask.handler({
          input: {
            mediaId: doc.id as number,
            filename: doc.filename as string,
            focalX: (doc.focalX as number) || 50,
            focalY: (doc.focalY as number) || 50,
          },
          req: { 
            payload,
            user: adminUser, // Inject admin user to satisfy Auditor Plugin
          },
        })

        results.push({ filename: doc.filename, success: result?.output?.success, error: result?.output?.error })
      } catch (err: any) {
        results.push({ filename: doc.filename, success: false, error: err.message })
      }
    }

    return NextResponse.json({ success: true, count: mediaItems.docs.length, results })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
