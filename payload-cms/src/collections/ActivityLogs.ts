/**
 * ActivityLogs Collection - Audit Trail System
 *
 * Features:
 * - Track all user actions in the system
 * - Record changes with before/after values
 * - IP address and user agent logging
 * - Filterable by user, action, entity, date
 * - Read-only (no manual creation/editing)
 */

import type { CollectionConfig } from 'payload'

// Action types for activity logging
const ACTION_TYPES = [
  { label: 'Create | 创建', value: 'CREATE' },
  { label: 'Update | 更新', value: 'UPDATE' },
  { label: 'Delete | 删除', value: 'DELETE' },
  { label: 'Login | 登录', value: 'LOGIN' },
  { label: 'Logout | 登出', value: 'LOGOUT' },
  { label: 'Publish | 发布', value: 'PUBLISH' },
  { label: 'Unpublish | 取消发布', value: 'UNPUBLISH' },
  { label: 'Export | 导出', value: 'EXPORT' },
  { label: 'Import | 导入', value: 'IMPORT' },
  { label: 'Restore | 恢复', value: 'RESTORE' },
  { label: 'Duplicate | 复制', value: 'DUPLICATE' },
  { label: 'Bulk Update | 批量更新', value: 'BULK_UPDATE' },
  { label: 'Bulk Delete | 批量删除', value: 'BULK_DELETE' },
] as const

// Entity types that can be logged
const ENTITY_TYPES = [
  // Core
  { label: 'User', value: 'USER' },
  { label: 'Role', value: 'ROLE' },
  { label: 'Permission', value: 'PERMISSION' },
  { label: 'Media', value: 'MEDIA' },
  // Products
  { label: 'Product', value: 'PRODUCT' },
  { label: 'Product Series', value: 'PRODUCT_SERIES' },
  // Content
  { label: 'Page', value: 'PAGE' },
  { label: 'Blog', value: 'BLOG' },
  { label: 'Application', value: 'APPLICATION' },
  { label: 'Category', value: 'CATEGORY' },
  { label: 'FAQ Item', value: 'FAQ_ITEM' },
  { label: 'Reusable Block', value: 'REUSABLE_BLOCK' },
  // Site Structure
  { label: 'Navigation Menu', value: 'NAVIGATION_MENU' },
  { label: 'Hero Banner', value: 'HERO_BANNER_ITEM' },
  // Config
  { label: 'Site Config', value: 'SITE_CONFIG' },
  { label: 'SEO Setting', value: 'SEO_SETTING' },
  { label: 'Custom Script', value: 'CUSTOM_SCRIPT' },
  { label: 'Form Config', value: 'FORM_CONFIG' },
  { label: 'Form Submission', value: 'FORM_SUBMISSION' },
  // Globals
  { label: 'Footer', value: 'FOOTER' },
  { label: 'Home Content', value: 'HOME_CONTENT' },
  { label: 'Email Config', value: 'EMAIL_CONFIG' },
  // System
  { label: 'System', value: 'SYSTEM' },
] as const

export const ActivityLogs: CollectionConfig = {
  slug: 'activity-logs',
  labels: {
    singular: {
      en: 'Activity Log',
      zh: '操作日志',
    },
    plural: {
      en: 'Activity Logs',
      zh: '操作日志',
    },
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['user', 'action', 'entity', 'entityId', 'createdAt'],
    group: {
      en: 'Users & Access',
      zh: '用户与权限',
    },
    description: 'System activity audit trail',
    pagination: {
      defaultLimit: 50,
    },
  },
  access: {
    // Only admins can view logs
    read: ({ req }) => {
      if (!req.user) return false
      return req.user.isAdmin === true
    },
    // Logs are created programmatically only
    create: () => false,
    update: () => false,
    delete: ({ req }) => req.user?.isAdmin === true,
  },
  fields: [
    // ==================================================================
    // User Information
    // ==================================================================
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: {
        en: 'User',
        zh: '用户',
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userName',
      type: 'text',
      label: {
        en: 'User Name',
        zh: '用户名称',
      },
      admin: {
        readOnly: true,
        description: 'Stored for reference even if user is deleted',
      },
    },
    {
      name: 'userEmail',
      type: 'text',
      label: {
        en: 'User Email',
        zh: '用户邮箱',
      },
      admin: {
        readOnly: true,
      },
    },

    // ==================================================================
    // Action Details
    // ==================================================================
    {
      name: 'action',
      type: 'select',
      label: {
        en: 'Action',
        zh: '操作类型',
      },
      required: true,
      options: ACTION_TYPES.map(a => ({ label: a.label, value: a.value })),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'entity',
      type: 'select',
      label: {
        en: 'Entity Type',
        zh: '实体类型',
      },
      required: true,
      options: ENTITY_TYPES.map(e => ({ label: e.label, value: e.value })),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'entityId',
      type: 'text',
      label: {
        en: 'Entity ID',
        zh: '实体 ID',
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'entityTitle',
      type: 'text',
      label: {
        en: 'Entity Title',
        zh: '实体名称',
      },
      admin: {
        readOnly: true,
        description: 'Human-readable title of the affected entity',
      },
    },

    // ==================================================================
    // Change Details
    // ==================================================================
    {
      name: 'summary',
      type: 'text',
      label: {
        en: 'Summary',
        zh: '摘要',
      },
      admin: {
        readOnly: true,
        description: 'Human-readable summary of the action',
      },
    },
    {
      name: 'changes',
      type: 'json',
      label: {
        en: 'Changes',
        zh: '变更内容',
      },
      admin: {
        readOnly: true,
        description: 'JSON object containing before/after values',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: {
        en: 'Metadata',
        zh: '元数据',
      },
      admin: {
        readOnly: true,
        description: 'Additional context about the action',
      },
    },

    // ==================================================================
    // Request Information
    // ==================================================================
    {
      name: 'ipAddress',
      type: 'text',
      label: {
        en: 'IP Address',
        zh: 'IP 地址',
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      label: {
        en: 'User Agent',
        zh: '浏览器信息',
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
