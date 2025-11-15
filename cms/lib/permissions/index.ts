/**
 * Permission System - Public API
 *
 * This module exports all permission-related functions for use
 * throughout the application.
 */

// Permission calculation
export {
  calculateUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAccessibleResources,
} from './calculate-permissions'

// Permission caching
export {
  getCachedUserPermissions,
  clearUserPermissionsCache,
  clearRolePermissionsCache,
  clearAllPermissionsCache,
  getCacheStats,
  cleanupExpiredCache,
} from './cache'

// Access control helpers
export {
  createAccessControl,
  createFieldAccess,
  createCustomAccessControl,
  adminOnlyAccess,
  authenticatedAccess,
  publicReadAccess,
} from './access-control'
