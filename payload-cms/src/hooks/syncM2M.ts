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
  return async ({ doc, previousDoc, req, operation, context }) => {
    const { payload } = req
    
    // Prevent infinite recursion during sync
    if (context?.isSyncing) return doc

    const isCreate = operation === 'create'
    
    // If there are no relationships to sync (both previous and current are empty), skip processing.
    const prevTargets = isCreate ? [] : sanitizeIds(previousDoc?.[sourceField] || [])
    const nextTargets = sanitizeIds(doc?.[sourceField] || [])
    
    if (prevTargets.length === 0 && nextTargets.length === 0) {
      return doc
    }

    const sourceId = doc.id
    if (sourceId === undefined || sourceId === null) return doc

    // Convert to string for safer comparison
    const sourceIdStr = String(sourceId)

    const added = nextTargets.filter((id: any) => !prevTargets.map(String).includes(String(id)))
    const removed = prevTargets.filter((id: any) => !nextTargets.map(String).includes(String(id)))

    // Get the default locale to avoid validation errors on target collections that might lack translations
    const defaultLocale = (payload.config.localization && typeof payload.config.localization === 'object')
      ? payload.config.localization.defaultLocale
      : 'en'

    // Handle added targets
    for (const targetId of added) {
      try {
        console.log(`[syncM2M] Linking ${targetCollection}/${targetId} to ${sourceField}/${sourceIdStr}`)
        
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
          locale: defaultLocale as any, // Force default locale to bypass target translation validation
          req, // Crucial for transaction visibility
        })
        
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (!currentLinks.map(String).includes(sourceIdStr)) {
            console.log(`[syncM2M] Updating ${targetCollection}/${targetId} with new link to ${sourceIdStr}`)
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: [...currentLinks, sourceId],
              },
              context: { isSyncing: true },
              depth: 0,
              overrideAccess: true,
              locale: defaultLocale as any, // Force default locale to bypass target translation validation
              req,
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
          locale: defaultLocale as any, // Force default locale
          req, // Crucial for transaction visibility
        })
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (currentLinks.map(String).includes(sourceIdStr)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((l: any) => String(l) !== sourceIdStr),
              },
              context: { isSyncing: true },
              depth: 0,
              overrideAccess: true,
              locale: defaultLocale as any, // Force default locale
              req,
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
  return async ({ id: sourceId, doc, req, context }) => {
    const { payload } = req
    
    // Prevent infinite recursion during sync
    if (context?.isSyncing) return

    const sourceIdStr = String(sourceId)
    const targets = sanitizeIds(doc?.[sourceField] || [])

    const defaultLocale = (payload.config.localization && typeof payload.config.localization === 'object')
      ? payload.config.localization.defaultLocale
      : 'en'

    for (const targetId of targets) {
      try {
        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
          locale: defaultLocale as any,
          req,
        })
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (currentLinks.map(String).includes(sourceIdStr)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((l: any) => String(l) !== sourceIdStr),
              },
              context: { isSyncing: true },
              depth: 0,
              overrideAccess: true,
              locale: defaultLocale as any,
              req,
            })
          }
        }
      } catch (e: any) {
        console.error(`[cleanupM2M] ❌ FAILED cleanup ${targetCollection}/${targetId}:`, e.message)
      }
    }
  }
}



