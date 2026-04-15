import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Synchronizes a Many-to-Many relationship between two collections.
 * 
 * @param targetCollection The slug of the other collection to sync with
 * @param targetField The field name in the other collection that stores references to this collection
 * @param sourceField The field name in this collection that stores references to the other collection
 */
export const syncM2M = (
  targetCollection: string,
  targetField: string,
  sourceField: string
): CollectionAfterChangeHook => {
  return async ({ doc, previousDoc, req: { payload, context } }) => {
    // Prevent infinite loop - Use unique key for context
    if (context.isSyncing) return doc

    const sourceId = doc.id
    const prevTargets = (previousDoc?.[sourceField] || []).map((t: any) => typeof t === 'object' ? t.id : (t?.id || t))
    const nextTargets = (doc?.[sourceField] || []).map((t: any) => typeof t === 'object' ? t.id : (t?.id || t))

    const added = nextTargets.filter((id: any) => !prevTargets.includes(id))
    const removed = prevTargets.filter((id: any) => !nextTargets.includes(id))

    // Handle added targets: add this sourceId to their targetField
    for (const targetId of added) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
        })
        if (target) {
          const currentLinks = (target[targetField] || []).map((l: any) => typeof l === 'object' ? l.id : (l?.id || l))
          if (!currentLinks.includes(sourceId)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: [...currentLinks, sourceId],
              },
              context: { isSyncing: true },
            })
          }
        }
      } catch (e) {
        console.error(`Sync error (added) in ${targetCollection}/${targetId}:`, e)
      }
    }

    // Handle removed targets: remove this sourceId from their targetField
    for (const targetId of removed) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
        })
        if (target) {
          const currentLinks = (target[targetField] || []).map((l: any) => typeof l === 'object' ? l.id : (l?.id || l))
          if (currentLinks.includes(sourceId)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((l: any) => l !== sourceId),
              },
              context: { isSyncing: true },
            })
          }
        }
      } catch (e) {
        console.error(`Sync error (removed) in ${targetCollection}/${targetId}:`, e)
      }
    }

    return doc
  }
}

/**
 * Cleans up references in the target collection when a document is deleted
 */
export const cleanupM2M = (
  targetCollection: string,
  targetField: string,
  sourceField: string
): CollectionAfterDeleteHook => {
  return async ({ id: sourceId, doc, req: { payload, context } }) => {
    // If we're already syncing, don't trigger cleanup that might cause loops
    if (context.isSyncing) return

    const targets = (doc?.[sourceField] || []).map((t: any) => typeof t === 'object' ? t.id : (t?.id || t))

    for (const targetId of targets) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
        })
        if (target) {
          const currentLinks = (target[targetField] || []).map((l: any) => typeof l === 'object' ? l.id : (l?.id || l))
          if (currentLinks.includes(sourceId)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((l: any) => l !== sourceId),
              },
              context: { isSyncing: true },
            })
          }
        }
      } catch (e) {
        console.error(`Cleanup error in ${targetCollection}/${targetId}:`, e)
      }
    }
  }
}
