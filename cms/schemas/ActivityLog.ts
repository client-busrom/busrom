/**
 * ActivityLog Model - Activity Audit Log (操作日志)
 *
 * Features:
 * - Audit all backend operations
 * - Track content modifications, deletions, and logins
 * - Store operation details and metadata
 * - Read-only records (cannot be modified after creation)
 * - Admin-only access
 */

import { list } from '@keystone-6/core'
import {
  text,
  select,
  timestamp,
  relationship,
} from '@keystone-6/core/fields'

export const ActivityLog = list({
  fields: {
    // ==================================================================
    // 👤 User Information (用户信息)
    // ==================================================================

    /**
     * User (用户)
     *
     * The user who performed this action
     */
    user: relationship({
      ref: 'User',
      label: 'User (用户)',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        itemView: { fieldMode: 'read' },
        description: 'User who performed this action | 执行此操作的用户',
      },
    }),

    // ==================================================================
    // 📝 Action Details (操作详情)
    // ==================================================================

    /**
     * Action Type (操作类型)
     */
    action: select({
      type: 'string',
      options: [
        { label: 'Create | 创建', value: 'create' },
        { label: 'Update | 更新', value: 'update' },
        { label: 'Delete | 删除', value: 'delete' },
        { label: 'Login | 登录', value: 'login' },
        { label: 'Logout | 登出', value: 'logout' },
      ],
      validation: { isRequired: true },
      label: 'Action (操作)',
      ui: {
        displayMode: 'segmented-control',
        itemView: { fieldMode: 'read' },
      },
    }),

    /**
     * Entity Type (实体类型)
     *
     * The type of object being acted upon
     */
    entity: text({
      label: 'Entity (实体类型)',
      ui: {
        itemView: { fieldMode: 'read' },
        description: 'Type of object (e.g., "Product", "Blog") | 对象类型(如: "Product", "Blog")',
      },
    }),

    /**
     * Entity ID (实体ID)
     *
     * The ID of the object being acted upon
     */
    entityId: text({
      label: 'Entity ID (实体ID)',
      ui: {
        itemView: { fieldMode: 'read' },
        description: 'ID of the object | 对象ID',
      },
    }),

    /**
     * Changes (变更内容)
     *
     * JSON-formatted details of what changed
     */
    changes: text({
      label: 'Changes (变更内容)',
      ui: {
        displayMode: 'textarea',
        itemView: { fieldMode: 'read' },
        description: 'JSON-formatted change details | JSON格式的变更详情',
      },
    }),

    // ==================================================================
    // 🌐 Request Metadata (请求元数据)
    // ==================================================================

    /**
     * IP Address (IP地址)
     */
    ipAddress: text({
      label: 'IP Address (IP地址)',
      ui: {
        itemView: { fieldMode: 'read' },
        description: 'IP address of the request | 请求的IP地址',
      },
    }),

    /**
     * User Agent (浏览器信息)
     */
    userAgent: text({
      label: 'User Agent (浏览器信息)',
      ui: {
        itemView: { fieldMode: 'read' },
        description: 'Browser/device information | 浏览器/设备信息',
      },
    }),

    // ==================================================================
    // 🕐 Timestamp (时间戳)
    // ==================================================================

    /**
     * Timestamp (时间戳)
     */
    timestamp: timestamp({
      defaultValue: { kind: 'now' },
      label: 'Timestamp (时间戳)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      // Only admins can view logs (for UI menu visibility)
      query: ({ session }) => !!session?.data?.isAdmin,
      // System can create logs
      create: () => true,
      // Logs are read-only (cannot be updated)
      update: () => false,
      // Only admins can delete logs (for cleanup)
      delete: ({ session }) => !!session?.data?.isAdmin,
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['user', 'action', 'entity', 'timestamp'],
      initialSort: { field: 'timestamp', direction: 'DESC' },
      pageSize: 100,
    },
    itemView: {
      // All fields are read-only in item view
      defaultFieldMode: 'read',
    },
    labelField: 'action',
    // Hide create form in UI (logs are created by the system)
    hideCreate: true,
    // Hide delete button (logs should not be deleted manually)
    hideDelete: true,
    // Hide from non-admin users
    isHidden: ({ session }: any) => !session?.data?.isAdmin,
  },
})
