import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Helper to sanitize IDs and ensure they are valid for the database
 */
const sanitizeIds = (ids: any[]): (string | number)[] => {
  return Array.from(new Set(
    ids
      .map((t: any) => (typeof t === 'object' ? (t?.id || t) : t))
      .filter((id: any) => id !== null && id !== undefined && id !== '')
  ))
}

/**
 * Synchronizes a Many-to-Many relationship between two collections.
 */
export const syncM2M = (
  targetCollection: string,
  targetField: string,
  sourceField: string
): CollectionAfterChangeHook => {
  return async ({ doc, previousDoc, req: { payload, context } }) => {
    if (context.isSyncing) return doc

    const sourceId = doc.id
    const prevTargets = sanitizeIds(previousDoc?.[sourceField] || [])
    const nextTargets = sanitizeIds(doc?.[sourceField] || [])

    const added = nextTargets.filter((id: any) => !prevTargets.includes(id))
    const removed = prevTargets.filter((id: any) => !nextTargets.includes(id))

    // Handle added targets
    for (const targetId of added) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
        })
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (!currentLinks.includes(sourceId)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: [...currentLinks, sourceId],
              },
              context: { isSyncing: true },
              depth: 0,
              validate: false,
              overrideAccess: true,
            })
          }
        }
      } catch (e: any) {
        console.error(`[syncM2M] ❌ FAILED to link ${targetCollection}/${targetId}:`, e.message)
        if (e.data?.errors) console.error('Validation errors:', JSON.stringify(e.data.errors, null, 2))
      }
    }

    // Handle removed targets
    for (const targetId of removed) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
        })
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (currentLinks.includes(sourceId)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((l: any) => l !== sourceId),
              },
              context: { isSyncing: true },
              depth: 0,
              validate: false,
              overrideAccess: true,
            })
          }
        }
      } catch (e: any) {
        console.error(`[syncM2M] ❌ FAILED to unlink ${targetCollection}/${targetId}:`, e.message)
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
    if (context.isSyncing) return

    const sourceIdVal = sourceId
    const targets = sanitizeIds(doc?.[sourceField] || [])

    for (const targetId of targets) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
        })
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (currentLinks.includes(sourceIdVal)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((l: any) => l !== sourceIdVal),
              },
              context: { isSyncing: true },
              depth: 0,
              validate: false,
              overrideAccess: true,
            })
          }
        }
      } catch (e: any) {
        console.error(`[cleanupM2M] ❌ FAILED cleanup ${targetCollection}/${targetId}:`, e.message)
      }
    }
  }
}

