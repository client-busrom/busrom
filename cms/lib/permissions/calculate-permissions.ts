/**
 * Permission Calculation Functions
 *
 * This module provides functions to calculate and check user permissions
 * based on their assigned roles and direct permissions.
 */

import type { Context } from '.keystone/types'

/**
 * Calculate the complete list of permissions for a user
 *
 * This function:
 * 1. Checks if user is a super admin (returns all permissions)
 * 2. Collects permissions from all assigned roles
 * 3. Includes permissions from parent roles (inheritance)
 * 4. Adds directly assigned permissions
 * 5. Returns a unique set of permission identifiers
 *
 * @param userId - The ID of the user
 * @param context - Keystone context for database queries
 * @returns Array of permission identifiers (e.g., ["Product:create", "Blog:read"])
 */
export async function calculateUserPermissions(
  userId: string,
  context: Context
): Promise<string[]> {
  try {
    // Query user with all related data
    const user = await context.sudo().query.User.findOne({
      where: { id: userId },
      query: `
        id
        isAdmin
        status
        roles(where: { isActive: { equals: true } }) {
          id
          permissions {
            identifier
          }
          parentRole {
            permissions {
              identifier
            }
          }
        }
        directPermissions {
          identifier
        }
      `,
    })

    // User not found or inactive
    if (!user || user.status !== 'ACTIVE') {
      return []
    }

    // Super admins have all permissions
    if (user.isAdmin) {
      return ['*'] // Special wildcard indicating all permissions
    }

    const permissions = new Set<string>()

    // Collect permissions from roles
    if (user.roles) {
      for (const role of user.roles) {
        // Add role's direct permissions
        if (role.permissions) {
          for (const perm of role.permissions) {
            if (perm.identifier) {
              permissions.add(perm.identifier)
            }
          }
        }

        // Add parent role's permissions (inheritance)
        if (role.parentRole?.permissions) {
          for (const perm of role.parentRole.permissions) {
            if (perm.identifier) {
              permissions.add(perm.identifier)
            }
          }
        }
      }
    }

    // Add direct permissions
    if (user.directPermissions) {
      for (const perm of user.directPermissions) {
        if (perm.identifier) {
          permissions.add(perm.identifier)
        }
      }
    }

    return Array.from(permissions)
  } catch (error) {
    console.error(`Failed to calculate permissions for user ${userId}:`, error)
    return []
  }
}

/**
 * Check if a user has a specific permission
 *
 * @param userId - The ID of the user
 * @param resource - The resource type (e.g., "Product", "Blog")
 * @param action - The action (e.g., "create", "read", "update", "delete")
 * @param context - Keystone context
 * @returns True if user has the permission
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string,
  context: Context
): Promise<boolean> {
  const permissions = await calculateUserPermissions(userId, context)

  // Super admin check
  if (permissions.includes('*')) {
    return true
  }

  // Check for specific permission
  const requiredPermission = `${resource}:${action}`
  return permissions.includes(requiredPermission)
}

/**
 * Check if user has ANY of the specified permissions (OR logic)
 *
 * @param userId - The ID of the user
 * @param permissionsList - Array of {resource, action} pairs
 * @param context - Keystone context
 * @returns True if user has at least one of the permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissionsList: Array<{ resource: string; action: string }>,
  context: Context
): Promise<boolean> {
  for (const { resource, action } of permissionsList) {
    if (await hasPermission(userId, resource, action, context)) {
      return true
    }
  }
  return false
}

/**
 * Check if user has ALL of the specified permissions (AND logic)
 *
 * @param userId - The ID of the user
 * @param permissionsList - Array of {resource, action} pairs
 * @param context - Keystone context
 * @returns True if user has all of the permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissionsList: Array<{ resource: string; action: string }>,
  context: Context
): Promise<boolean> {
  for (const { resource, action } of permissionsList) {
    if (!(await hasPermission(userId, resource, action, context))) {
      return false
    }
  }
  return true
}

/**
 * Get all resources a user can access with a specific action
 *
 * @param userId - The ID of the user
 * @param action - The action (e.g., "create", "read")
 * @param context - Keystone context
 * @returns Array of resource names
 */
export async function getAccessibleResources(
  userId: string,
  action: string,
  context: Context
): Promise<string[]> {
  const permissions = await calculateUserPermissions(userId, context)

  // Super admin can access all resources
  if (permissions.includes('*')) {
    return ['*']
  }

  // Filter permissions by action
  const resources: string[] = []
  for (const perm of permissions) {
    const [resource, permAction] = perm.split(':')
    if (permAction === action) {
      resources.push(resource)
    }
  }

  return resources
}
