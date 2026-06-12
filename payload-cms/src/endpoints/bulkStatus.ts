import type { Endpoint } from 'payload'

export const safeBulkStatusEndpoint: Endpoint = {
  path: '/safe-bulk-status',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await (typeof req.json === 'function' ? req.json() : req.body)
      const { collectionSlug, ids, status, selectAll, where } = body

      if (!collectionSlug || !status) {
        return Response.json(
          { error: 'Missing collectionSlug or status in request body' },
          { status: 400 }
        )
      }

      let targetIds: (string | number)[] = []

      // If "Select All" is active, we must fetch all matching IDs based on the current query
      if (selectAll) {
        let hasMore = true
        let page = 1
        
        while (hasMore) {
          const result = await req.payload.find({
            collection: collectionSlug as any,
            where: where || {},
            limit: 100,
            page,
            depth: 0,
          })
          
          targetIds.push(...result.docs.map((doc: any) => doc.id))
          hasMore = result.hasNextPage
          page++
        }
      } else {
        // Just the manually checked IDs
        targetIds = ids || []
      }

      // If user unselected some items while selectAll was active, 
      // the front-end will omit them from 'ids', but wait,
      // `useSelection` gives `unselected` object. We will handle that on client 
      // and just send the final `ids` array if selectAll is false.
      // Actually, if selectAll is true, the client will send `excludeIds`.
      const excludeIds = body.excludeIds || []
      targetIds = targetIds.filter((id) => !excludeIds.includes(id))

      let successCount = 0
      let errors: any[] = []

      // Perform individual updates to safely bypass Payload/Drizzle bulk overwrite bugs
      for (const id of targetIds) {
        try {
          const existingDoc = await req.payload.findByID({
            collection: collectionSlug as any,
            id,
            depth: 0,
          })

          // To prevent Payload/Drizzle from wiping out hasMany relationships (like categories and tags)
          // when only updating the status, we spread the existing document's data back into the update payload.
          // We must remove standard meta fields like id, createdAt, updatedAt to avoid errors.
          const { id: _id, createdAt, updatedAt, ...safeData } = existingDoc

          console.log(`[SafeBulkStatus] Fetched existing doc (ID: ${id}), fields present:`, Object.keys(existingDoc))
          if (safeData.categories || safeData.tags) {
            console.log(`[SafeBulkStatus] Preserving relations - Categories: ${safeData.categories?.length || 0}, Tags: ${safeData.tags?.length || 0}`)
          }

          await req.payload.update({
            collection: collectionSlug as any,
            id,
            data: {
              ...safeData,
              status,
            },
            user: req.user,
            req: req,
            context: {
              isSyncing: true, // Prevents autoIndexHook from firing 1000s of external API calls
            },
          })
          successCount++
        } catch (err: any) {
          errors.push({ id, error: err?.message || 'Unknown error' })
        }
      }

      return Response.json({
        success: true,
        message: `Successfully updated ${successCount} items`,
        successCount,
        errors,
      })
    } catch (err: any) {
      req.payload.logger.error({ err }, 'Error in safeBulkStatusEndpoint')
      return Response.json({ error: err?.message || 'Server Error' }, { status: 500 })
    }
  },
}
