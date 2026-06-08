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
          await req.payload.update({
            collection: collectionSlug as any,
            id,
            data: { status },
            user: req.user,
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
