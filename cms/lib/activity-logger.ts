/**
 * Activity Logger Utility
 *
 * Provides helper functions to log operations to ActivityLog
 */

import { KeystoneContext } from '@keystone-6/core/types'

/**
 * Log an operation to ActivityLog
 *
 * @param context - Keystone context
 * @param operation - Operation type (create/update/delete)
 * @param entity - Entity name (e.g., "Product", "Blog")
 * @param item - The item being operated on
 * @param changes - Specific fields to log (optional)
 * @param originalItem - The original item before update (for comparing changes)
 */
export async function logActivity(
  context: KeystoneContext,
  operation: 'create' | 'update' | 'delete',
  entity: string,
  item: any,
  changes?: Record<string, any>,
  originalItem?: any
) {
  // Skip if no session (system operations or public API)
  if (!context.session?.itemId) {
    return
  }

  try {
    // Determine what to log
    let changeData: Record<string, any>

    if (changes) {
      // If changes explicitly provided, use them
      changeData = changes
    } else if (operation === 'update' && originalItem) {
      // For updates, compare new vs old to find actual changes
      changeData = compareItems(item, originalItem)
    } else {
      // For create/delete or no originalItem, log essential fields
      changeData = extractEssentialFields(entity, item)
    }

    await context.query.ActivityLog.createOne({
      data: {
        user: { connect: { id: context.session.itemId } },
        action: operation,
        entity,
        entityId: String(item.id), // Convert to string to match schema
        changes: JSON.stringify(changeData),
        ipAddress: (context as any).req?.ip || 'unknown',
        userAgent: (context as any).req?.headers?.['user-agent'] || 'unknown',
      },
    })

    console.log(`✅ Logged ${operation} operation on ${entity} ${item.id}`)
  } catch (error) {
    // Don't throw error to prevent blocking the operation
    console.error(`❌ Failed to log ${entity} activity:`, error)
  }
}

/**
 * Compare two items and return only the changed fields
 */
function compareItems(newItem: any, oldItem: any): Record<string, any> {
  const changes: Record<string, any> = {}

  // Always include ID
  changes.id = newItem.id

  // Compare all fields
  for (const key in newItem) {
    if (key === 'updatedAt' || key === 'createdAt') {
      // Skip timestamp fields
      continue
    }

    const newValue = newItem[key]
    const oldValue = oldItem[key]

    // Check if value actually changed
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      changes[key] = {
        from: oldValue,
        to: newValue,
      }
    }
  }

  return changes
}

/**
 * Extract essential fields based on entity type
 *
 * This avoids logging sensitive or unnecessary data
 */
function extractEssentialFields(entity: string, item: any): Record<string, any> {
  const baseFields: Record<string, any> = {
    id: item.id,
  }

  // Entity-specific essential fields
  switch (entity) {
    case 'Product':
      return {
        ...baseFields,
        sku: item.sku,
        name: item.name,
        status: item.status,
        isFeatured: item.isFeatured,
      }

    case 'ProductSeries':
      return {
        ...baseFields,
        slug: item.slug,
        name: item.name,
        status: item.status,
      }

    case 'Blog':
      return {
        ...baseFields,
        slug: item.slug,
        title: item.title,
        status: item.status,
      }

    case 'Application':
      return {
        ...baseFields,
        slug: item.slug,
        name: item.name,
        status: item.status,
      }

    case 'Page':
      return {
        ...baseFields,
        slug: item.slug,
        title: item.title,
        status: item.status,
      }

    case 'Media':
      return {
        ...baseFields,
        filename: item.filename,
        filesize: item.filesize,
        mimeType: item.mimeType,
      }

    case 'SiteConfig':
      return {
        ...baseFields,
        siteName: item.siteName,
        // Don't log sensitive fields like SMTP passwords
      }

    case 'CustomScript':
      return {
        ...baseFields,
        name: item.name,
        enabled: item.enabled,
        scope: item.scope,
        // Don't log full script content (too large)
      }

    case 'SeoSetting':
      return {
        ...baseFields,
        pageType: item.pageType,
        title: item.title?.en,
      }

    case 'NavigationMenu':
      return {
        ...baseFields,
        label: item.label?.en,
        url: item.url,
        position: item.position,
        enabled: item.enabled,
      }

    case 'ContactForm':
      return {
        ...baseFields,
        name: item.name,
        email: item.email,
        status: item.status,
      }

    case 'Footer':
    case 'FormConfig':
      return {
        ...baseFields,
        // These are singletons, just log the ID
      }

    case 'Category':
      return {
        ...baseFields,
        slug: item.slug,
        name: item.name,
      }

    case 'FaqItem':
      return {
        ...baseFields,
        question: item.question?.en?.substring(0, 100), // First 100 chars
        published: item.published,
      }

    case 'User':
      return {
        ...baseFields,
        name: item.name,
        email: item.email,
        isAdmin: item.isAdmin,
        status: item.status,
        // Don't log password or sensitive fields
      }

    case 'Role':
      return {
        ...baseFields,
        name: item.name,
        code: item.code,
        isActive: item.isActive,
      }

    default:
      // For unknown entities, log minimal info
      return {
        ...baseFields,
        name: item.name,
        title: item.title,
        slug: item.slug,
      }
  }
}

/**
 * Convenience wrapper for create operations
 */
export async function logCreate(
  context: KeystoneContext,
  entity: string,
  item: any,
  changes?: Record<string, any>
) {
  return logActivity(context, 'create', entity, item, changes)
}

/**
 * Convenience wrapper for update operations
 */
export async function logUpdate(
  context: KeystoneContext,
  entity: string,
  item: any,
  changes?: Record<string, any>,
  originalItem?: any
) {
  return logActivity(context, 'update', entity, item, changes, originalItem)
}

/**
 * Convenience wrapper for delete operations
 */
export async function logDelete(
  context: KeystoneContext,
  entity: string,
  item: any,
  changes?: Record<string, any>
) {
  return logActivity(context, 'delete', entity, item, changes)
}
