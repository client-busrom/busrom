/**
 * Media Search API Endpoint
 *
 * Supports JSONB specs field querying that Payload's built-in REST API doesn't support.
 * GET /api/media-search?specsKey=color&specsValue=black&...other standard filters
 */

import type { PayloadHandler } from 'payload'
import { sql } from 'drizzle-orm'

export const mediaSearchHandler: PayloadHandler = async (req) => {
  const { payload } = req
  const url = new URL(req.url || '', `http://${req.headers.get('host') || 'localhost'}`)
  const params = url.searchParams

  const specsKey = params.get('specsKey') || ''
  const specsValue = params.get('specsValue') || ''
  const search = params.get('search') || ''
  const categoryId = params.get('category') || ''
  const tagId = params.get('tag') || ''
  const mimeType = params.get('mimeType') || ''
  const group = params.get('group') || ''
  const sceneNumber = params.get('sceneNumber') || ''
  const imageNumber = params.get('imageNumber') || ''
  const page = parseInt(params.get('page') || '1', 10)
  const limit = parseInt(params.get('limit') || '24', 10)
  const sort = params.get('sort') || '-createdAt'

  try {
    // Build Payload where conditions for standard fields
    const where: any = {
      status: { equals: 'active' },
    }

    if (search) {
      where.filename = { contains: search }
    }
    if (categoryId) {
      where.primaryCategory = { equals: parseInt(categoryId, 10) }
    }
    if (tagId) {
      where.tags = { in: [parseInt(tagId, 10)] }
    }
    if (mimeType) {
      where.mimeType = { contains: mimeType }
    }
    if (group) {
      where['metadata.group'] = { equals: parseInt(group, 10) }
    }
    if (sceneNumber) {
      where['metadata.sceneNumber'] = { equals: parseInt(sceneNumber, 10) }
    }
    if (imageNumber) {
      where['metadata.imageNumber'] = { equals: parseInt(imageNumber, 10) }
    }

    // If specs filter is provided, we need raw SQL for JSONB query
    if (specsKey) {
      const db = (payload.db as any)
      if (!db?.drizzle) {
        return Response.json({ error: 'Database not available' }, { status: 500 })
      }

      // Use parameterized query to prevent SQL injection
      // If specsValue is provided, filter by key + value (ILIKE); otherwise just check key exists
      const specsResult = specsValue
        ? await db.drizzle.execute(
            sql`SELECT id FROM media WHERE specs IS NOT NULL AND specs->>${specsKey} ILIKE ${`%${specsValue}%`}`
          )
        : await db.drizzle.execute(
            sql`SELECT id FROM media WHERE specs IS NOT NULL AND specs ? ${specsKey}`
          )

      const matchingIds = (specsResult.rows || specsResult).map((row: any) => row.id)

      if (matchingIds.length === 0) {
        return Response.json({
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page,
          limit,
          hasNextPage: false,
          hasPrevPage: false,
        })
      }

      // Add ID filter to where conditions
      where.id = { in: matchingIds }
    }

    const result = await payload.find({
      collection: 'media',
      where,
      page,
      limit,
      sort,
      depth: 1,
    })

    // Normalize thumbnailURL
    const normalizedDocs = result.docs.map((doc: any) => ({
      ...doc,
      thumbnailURL: doc.sizes?.thumbnail?.url || doc.sizes?.card?.url || doc.url,
    }))

    return Response.json({
      ...result,
      docs: normalizedDocs,
    })
  } catch (error) {
    payload.logger.error(`[media-search] Error: ${error instanceof Error ? error.message : String(error)}`)
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
