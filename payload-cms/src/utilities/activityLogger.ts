/**
 * Activity Logger Utility
 *
 * Helper functions for logging user activities in the system.
 * Used by collection hooks to automatically track changes.
 */

import type { Payload, PayloadRequest } from 'payload'

export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'EXPORT'
  | 'IMPORT'
  | 'RESTORE'
  | 'DUPLICATE'
  | 'BULK_UPDATE'
  | 'BULK_DELETE'

export type EntityType =
  | 'USER'
  | 'ROLE'
  | 'PERMISSION'
  | 'MEDIA'
  | 'PRODUCT'
  | 'PRODUCT_SERIES'
  | 'PAGE'
  | 'BLOG'
  | 'APPLICATION'
  | 'CATEGORY'
  | 'FAQ_ITEM'
  | 'REUSABLE_BLOCK'
  | 'NAVIGATION_MENU'
  | 'HERO_BANNER_ITEM'
  | 'SITE_CONFIG'
  | 'SEO_SETTING'
  | 'CUSTOM_SCRIPT'
  | 'FORM_CONFIG'
  | 'FORM_SUBMISSION'
  | 'FOOTER'
  | 'HOME_CONTENT'
  | 'EMAIL_CONFIG'
  | 'SYSTEM'

interface LogActivityParams {
  payload: Payload
  req?: PayloadRequest
  action: ActionType
  entity: EntityType
  entityId?: string
  entityTitle?: string
  changes?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Log an activity to the activity-logs collection
 */
export async function logActivity({
  payload,
  req,
  action,
  entity,
  entityId,
  entityTitle,
  changes,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    const user = req?.user

    // Extract IP address from request
    let ipAddress: string | undefined
    if (req?.headers) {
      const headers = req.headers as unknown as Record<string, string | string[] | undefined>
      const forwarded = headers['x-forwarded-for']
      if (typeof forwarded === 'string') {
        ipAddress = forwarded.split(',')[0]?.trim()
      } else if (Array.isArray(forwarded)) {
        ipAddress = forwarded[0]?.split(',')[0]?.trim()
      }
      if (!ipAddress) {
        ipAddress = headers['x-real-ip'] as string | undefined
      }
    }

    // Extract user agent
    const userAgent = req?.headers
      ? (req.headers as unknown as Record<string, string | undefined>)['user-agent']
      : undefined

    // Generate summary
    const summary = generateSummary(action, entity, entityTitle)

    await payload.create({
      collection: 'activity-logs',
      data: {
        user: user?.id,
        userName: user?.name || user?.email || 'System',
        userEmail: user?.email,
        action,
        entity,
        entityId,
        entityTitle,
        summary,
        changes: changes || null,
        metadata: metadata || null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error: any) {
    // Don't throw - logging failures shouldn't break the main operation
    payload.logger.error('Failed to log activity:', error)
  }
}

/**
 * Generate a human-readable summary of the action
 */
function generateSummary(
  action: ActionType,
  entity: EntityType,
  entityTitle?: string
): string {
  const actionVerbs: Record<ActionType, string> = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    LOGIN: 'logged in',
    LOGOUT: 'logged out',
    PUBLISH: 'published',
    UNPUBLISH: 'unpublished',
    EXPORT: 'exported',
    IMPORT: 'imported',
    RESTORE: 'restored',
    DUPLICATE: 'duplicated',
    BULK_UPDATE: 'bulk updated',
    BULK_DELETE: 'bulk deleted',
  }

  const entityNames: Record<EntityType, string> = {
    USER: 'user',
    ROLE: 'role',
    PERMISSION: 'permission',
    MEDIA: 'media',
    PRODUCT: 'product',
    PRODUCT_SERIES: 'product series',
    PAGE: 'page',
    BLOG: 'blog post',
    APPLICATION: 'application',
    CATEGORY: 'category',
    FAQ_ITEM: 'FAQ',
    REUSABLE_BLOCK: 'reusable block',
    NAVIGATION_MENU: 'navigation menu',
    HERO_BANNER_ITEM: 'hero banner',
    SITE_CONFIG: 'site config',
    SEO_SETTING: 'SEO setting',
    CUSTOM_SCRIPT: 'custom script',
    FORM_CONFIG: 'form config',
    FORM_SUBMISSION: 'form submission',
    FOOTER: 'footer',
    HOME_CONTENT: 'home content',
    EMAIL_CONFIG: 'email config',
    SYSTEM: 'system',
  }

  const verb = actionVerbs[action] || action.toLowerCase()
  const entityName = entityNames[entity] || entity.toLowerCase()

  if (entityTitle) {
    return `${verb} ${entityName}: "${entityTitle}"`
  }

  return `${verb} ${entityName}`
}

/**
 * Calculate changes between two objects
 */
export function calculateChanges(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>
): Record<string, { before: unknown; after: unknown }> {
  const changes: Record<string, { before: unknown; after: unknown }> = {}

  // Fields to exclude from change tracking
  const excludeFields = ['updatedAt', 'createdAt', '_status', 'salt', 'hash']

  for (const key of Object.keys(after)) {
    if (excludeFields.includes(key)) continue

    const beforeValue = before?.[key]
    const afterValue = after[key]

    // Simple comparison - could be enhanced for deep object comparison
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes[key] = {
        before: beforeValue,
        after: afterValue,
      }
    }
  }

  return changes
}

/**
 * Map collection slug to entity type
 */
export function collectionToEntityType(slug: string): EntityType {
  const mapping: Record<string, EntityType> = {
    users: 'USER',
    roles: 'ROLE',
    permissions: 'PERMISSION',
    media: 'MEDIA',
    products: 'PRODUCT',
    'product-series': 'PRODUCT_SERIES',
    pages: 'PAGE',
    blogs: 'BLOG',
    applications: 'APPLICATION',
    categories: 'CATEGORY',
    'faq-items': 'FAQ_ITEM',
    'reusable-blocks': 'REUSABLE_BLOCK',
    'navigation-menus': 'NAVIGATION_MENU',
    'hero-banner-items': 'HERO_BANNER_ITEM',
    'seo-settings': 'SEO_SETTING',
    'custom-scripts': 'CUSTOM_SCRIPT',
    'form-configs': 'FORM_CONFIG',
    'form-submissions': 'FORM_SUBMISSION',
  }

  return mapping[slug] || 'SYSTEM'
}
