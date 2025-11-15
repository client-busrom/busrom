/**
 * Access Control Helper Functions
 *
 * This module provides utility functions to integrate RBAC permissions
 * with Keystone's access control system.
 */

import type { ListAccessControl, FieldAccessControl } from '@keystone-6/core/types'
import { hasPermission, getCachedUserPermissions } from './index'

/**
 * Create access control rules for a Keystone List
 *
 * This generates the complete access control configuration
 * based on RBAC permissions.
 *
 * @param resourceName - The name of the resource (must match Permission.resource)
 * @returns Keystone access control configuration
 *
 * @example
 * export const Product = list({
 *   access: createAccessControl('Product'),
 *   fields: { ... }
 * })
 */
export function createAccessControl(resourceName: string): ListAccessControl<any> {
  return {
    operation: {
      /**
       * Read/Query Access
       *
       * Controls whether the menu item is visible and query operation is allowed
       */
      query: async ({ session, context }: any) => {
        console.log(`🔍 [${resourceName}] Query access check:`)
        console.log(`  - Session exists: ${!!session}`)
        console.log(`  - User ID: ${session?.itemId}`)
        console.log(`  - User email: ${session?.data?.email}`)
        console.log(`  - Is admin: ${session?.data?.isAdmin}`)

        if (!session) {
          console.log(`  ❌ No session, denying access`)
          return false
        }

        const hasAccess = await hasPermission(session.itemId, resourceName, 'read', context)
        console.log(`  - Has ${resourceName}:read permission: ${hasAccess}`)
        return hasAccess
      },

      /**
       * Create Access
       */
      create: async ({ session, context }: any) => {
        console.log(`🔍 [${resourceName}] Create access check for user ${session?.data?.email}`)
        if (!session) return false

        const hasAccess = await hasPermission(session.itemId, resourceName, 'create', context)
        console.log(`  - Has ${resourceName}:create permission: ${hasAccess}`)
        return hasAccess
      },

      /**
       * Update Access
       */
      update: async ({ session, context }: any) => {
        if (!session) return false
        return await hasPermission(session.itemId, resourceName, 'update', context)
      },

      /**
       * Delete Access
       */
      delete: async ({ session, context }: any) => {
        if (!session) return false
        return await hasPermission(session.itemId, resourceName, 'delete', context)
      },
    },

    /**
     * Filter Access
     *
     * Controls which records are returned by queries.
     * If the user has read permission, return all records (no filter).
     * If the user doesn't have read permission, return no records (filter all out).
     */
    filter: {
      query: async ({ session, context }: any) => {
        if (!session) {
          return false // No records visible
        }

        const hasAccess = await hasPermission(session.itemId, resourceName, 'read', context)

        // If user has permission, return true (show all records)
        // If user doesn't have permission, return false (show no records)
        return hasAccess
      },
    },
  }
}

/**
 * Create field-level access control
 *
 * This allows fine-grained control over individual fields based on permissions.
 *
 * @param resourceName - The name of the resource
 * @param requiredPermissions - Array of permission identifiers required to access this field
 * @returns Keystone field access control configuration
 *
 * @example
 * // Field requires either Product:update or Product:create permission
 * featured: checkbox({
 *   access: createFieldAccess('Product', ['Product:update', 'Product:create'])
 * })
 *
 * @example
 * // Field requires special permission
 * seoSetting: relationship({
 *   access: createFieldAccess('Product', ['SeoSetting:update'])
 * })
 */
export function createFieldAccess(
  resourceName: string,
  requiredPermissions: string[] = []
): FieldAccessControl<any> {
  return {
    /**
     * Read access
     */
    read: async ({ session, context }: any) => {
      if (!session) return false

      // If no special permissions specified, use resource's read permission
      if (requiredPermissions.length === 0) {
        return await hasPermission(session.itemId, resourceName, 'read', context)
      }

      // Check if user has any of the required permissions
      const userPermissions = await getCachedUserPermissions(session.itemId, context)

      // Super admin
      if (userPermissions.includes('*')) {
        return true
      }

      // Check for specific permissions
      return requiredPermissions.some((perm) => userPermissions.includes(perm))
    },

    /**
     * Create access
     */
    create: async ({ session, context }: any) => {
      if (!session) return false

      // If no special permissions specified, use resource's create permission
      if (requiredPermissions.length === 0) {
        return await hasPermission(session.itemId, resourceName, 'create', context)
      }

      // Check for specific permissions
      const userPermissions = await getCachedUserPermissions(session.itemId, context)

      if (userPermissions.includes('*')) {
        return true
      }

      return requiredPermissions.some((perm) => userPermissions.includes(perm))
    },

    /**
     * Update access
     */
    update: async ({ session, context }: any) => {
      if (!session) return false

      // If no special permissions specified, use resource's update permission
      if (requiredPermissions.length === 0) {
        return await hasPermission(session.itemId, resourceName, 'update', context)
      }

      // Check for specific permissions
      const userPermissions = await getCachedUserPermissions(session.itemId, context)

      if (userPermissions.includes('*')) {
        return true
      }

      return requiredPermissions.some((perm) => userPermissions.includes(perm))
    },
  }
}

/**
 * Create custom access control with a permission check callback
 *
 * This is for more complex scenarios where you need custom logic.
 *
 * @param checkPermission - Async function that returns true if access should be granted
 * @returns Keystone access control configuration
 *
 * @example
 * export const Blog = list({
 *   access: createCustomAccessControl(async ({ session, context, operation, item }) => {
 *     // Custom logic: users can only edit their own blog posts
 *     if (operation === 'update') {
 *       if (item.authorId === session.itemId) return true
 *       return await hasPermission(session.itemId, 'Blog', 'update', context)
 *     }
 *     return true
 *   }),
 *   fields: { ... }
 * })
 */
export function createCustomAccessControl(
  checkPermission: (args: {
    session: any
    context: any
    operation: 'query' | 'create' | 'update' | 'delete'
    item?: any
  }) => Promise<boolean>
): ListAccessControl<any> {
  return {
    operation: {
      query: async ({ session, context }: any) => {
        return await checkPermission({ session, context, operation: 'query' })
      },

      create: async ({ session, context }: any) => {
        return await checkPermission({ session, context, operation: 'create' })
      },

      update: async ({ session, context, item }: any) => {
        return await checkPermission({ session, context, operation: 'update', item })
      },

      delete: async ({ session, context, item }: any) => {
        return await checkPermission({ session, context, operation: 'delete', item })
      },
    },
  }
}

/**
 * Simple admin-only access control
 *
 * Shorthand for resources that should only be accessible by super admins
 *
 * @example
 * export const Permission = list({
 *   access: adminOnlyAccess(),
 *   fields: { ... }
 * })
 */
export function adminOnlyAccess(): ListAccessControl<any> {
  return {
    operation: {
      query: ({ session }: any) => !!session?.data?.isAdmin,
      create: ({ session }: any) => !!session?.data?.isAdmin,
      update: ({ session }: any) => !!session?.data?.isAdmin,
      delete: ({ session }: any) => !!session?.data?.isAdmin,
    },
  }
}

/**
 * Authenticated users only (no permission check)
 *
 * Shorthand for resources that any logged-in user can access
 *
 * @example
 * export const Media = list({
 *   access: authenticatedAccess(),
 *   fields: { ... }
 * })
 */
export function authenticatedAccess(): ListAccessControl<any> {
  return {
    operation: {
      query: ({ session }: any) => !!session,
      create: ({ session }: any) => !!session,
      update: ({ session }: any) => !!session,
      delete: ({ session }: any) => !!session,
    },
  }
}

/**
 * Public read access with authenticated write
 *
 * Allows anonymous users to query (read) content,
 * but requires authentication and permissions for create/update/delete.
 *
 * This is ideal for public-facing content like products, blogs, etc.
 *
 * @param resourceName - The name of the resource
 * @returns Keystone access control configuration
 *
 * @example
 * export const Product = list({
 *   access: publicReadAccess('Product'),
 *   fields: { ... }
 * })
 */
export function publicReadAccess(resourceName: string): ListAccessControl<any> {
  return {
    operation: {
      // Anyone can query (read) - for public website
      query: () => true,

      // Only authenticated users with permissions can create/update/delete
      create: async ({ session, context }: any) => {
        if (!session) return false
        return await hasPermission(session.itemId, resourceName, 'create', context)
      },

      update: async ({ session, context }: any) => {
        if (!session) return false
        return await hasPermission(session.itemId, resourceName, 'update', context)
      },

      delete: async ({ session, context }: any) => {
        if (!session) return false
        return await hasPermission(session.itemId, resourceName, 'delete', context)
      },
    },
  }
}
