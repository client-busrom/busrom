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
    
    // Skip during translation-only saves (no relationship changes)
    if (context?.isTranslationSave) return doc

    // Prevent infinite recursion during sync
    if (context?.isSyncing) return doc

    // --- REFACTOR: Field-level trigger check ---
    // Only proceed if the sourceField is actually present in the data being updated.
    // This prevents title/excerpt updates from triggering relationship syncs.
    const isUpdate = operation === 'update'
    const data = (req as any).data || {}
    
    if (isUpdate && !(sourceField in data)) {
      return doc
    }

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

    // --- OPTIMIZATION: Early return if no changes in relationships ---
    if (added.length === 0 && removed.length === 0) {
      return doc
    }

    // Get the default locale to avoid validation errors on target collections that might lack translations
    const defaultLocale = (payload.config.localization && typeof payload.config.localization === 'object')
      ? payload.config.localization.defaultLocale
      : 'en'

    // Handle added targets
    for (const targetId of added) {
      try {
        if (!targetId) continue

        // --- PRODUCTION FIX: Check if collection exists in registry ---
        // This prevents the "operator 'in' ... '_rels' in undefined" error in Postgres adapter
        if (!(targetCollection in payload.collections)) {
          console.error(`[syncM2M] ❌ Target collection '${targetCollection}' not found in registry!`)
          continue
        }

        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
          locale: defaultLocale as any,
          req,
          disableErrors: true,
        })
        
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (!currentLinks.map(String).includes(sourceIdStr)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: [...currentLinks, sourceId],
              },
              context: { 
                isSyncing: true,
                isM2MSync: true 
              },
              depth: 0,
              overrideAccess: true,
              locale: defaultLocale as any,
              req,
              disableHooks: true,
            } as any)
            console.log(`[syncM2M] ✅ Successfully linked ${targetCollection}/${targetId}`)
          }
        } else {
          console.warn(`[syncM2M] ⚠️ Target document ${targetCollection}/${targetId} not found. Skipping link.`)
        }
      } catch (err: any) {
        console.error(`[syncM2M] ❌ Failed to add link for ${targetCollection}/${targetId}:`, err.message)
        // Check for the specific TypeError mentioned in production
        if (err.message?.includes("operator 'in'")) {
          console.error(`[syncM2M] Critical TypeError detected. This usually happens when a collection is missing from the DB adapter's registry. Target Collection: ${targetCollection}`)
        }
      }
    }

    // Handle removed targets
    for (const targetId of removed) {
      try {
        if (!targetId) continue

        // --- PRODUCTION FIX: Check if collection exists in registry ---
        if (!(targetCollection in payload.collections)) {
          console.error(`[syncM2M] ❌ Target collection '${targetCollection}' not found in registry!`)
          continue
        }

        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
          locale: defaultLocale as any,
          req,
          disableErrors: true,
        })
        if (target) {
          const currentLinks = sanitizeIds(target[targetField] || [])
          if (currentLinks.map(String).includes(sourceIdStr)) {
            await payload.update({
              collection: targetCollection as any,
              id: targetId,
              data: {
                [targetField]: currentLinks.filter((id: any) => String(id) !== sourceIdStr),
              },
              context: { 
                isSyncing: true,
                isM2MSync: true 
              },
              depth: 0,
              overrideAccess: true,
              locale: defaultLocale as any,
              req,
              disableHooks: true,
            } as any)
            console.log(`[syncM2M] ✅ Successfully unlinked ${targetCollection}/${targetId}`)
          }
        } else {
          console.warn(`[syncM2M] ⚠️ Target document ${targetCollection}/${targetId} not found. Skipping unlink.`)
        }
      } catch (err: any) {
        console.error(`[syncM2M] ❌ Failed to remove link for ${targetCollection}/${targetId}:`, err.message)
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
        if (!targetId) continue

        // --- PRODUCTION FIX: Check if collection exists in registry ---
        if (!(targetCollection in payload.collections)) {
          console.error(`[cleanupM2M] ❌ Target collection '${targetCollection}' not found in registry!`)
          continue
        }

        const target = await payload.findByID({
          collection: targetCollection as any,
          id: targetId,
          depth: 0,
          locale: defaultLocale as any,
          req,
          disableErrors: true,
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
              context: { 
                isSyncing: true,
                isM2MSync: true 
              },
              depth: 0,
              overrideAccess: true,
              locale: defaultLocale as any,
              req,
              disableHooks: true,
            } as any)
          }
        }
      } catch (e: any) {
        console.error(`[cleanupM2M] ❌ FAILED cleanup ${targetCollection}/${targetId}:`, e.message)
      }
    }
  }
}



