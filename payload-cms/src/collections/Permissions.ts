/**
 * Permissions Collection - RBAC Permission Management
 *
 * Features:
 * - Resource-based permission control
 * - Action types (CRUD + special operations)
 * - Category grouping for admin UI
 * - Auto-generated identifier
 */

import type { CollectionConfig } from 'payload'

// All manageable resources in the system
const RESOURCES = [
  // ==================== 用户与权限 (Users & Access) ====================
  { label: 'Users | 用户', value: 'USER' },
  { label: 'Roles | 角色', value: 'ROLE' },
  { label: 'Permissions | 权限', value: 'PERMISSION' },
  { label: 'Activity Logs | 操作日志', value: 'ACTIVITY_LOG' },

  // ==================== 内容管理 (Content) ====================
  { label: 'Products | 产品', value: 'PRODUCT' },
  { label: 'Product Series | 产品系列', value: 'PRODUCT_SERIES' },
  { label: 'Pages | 页面', value: 'PAGE' },
  { label: 'Blogs | 博客', value: 'BLOG' },
  { label: 'Applications | 应用案例', value: 'APPLICATION' },
  { label: 'Categories | 分类', value: 'CATEGORY' },
  { label: 'FAQ Items | 常见问题', value: 'FAQ_ITEM' },
  { label: 'Reusable Blocks | 可复用内容块', value: 'REUSABLE_BLOCK' },
  { label: 'Document Templates | 文档模版', value: 'DOCUMENT_TEMPLATE' },
  { label: 'Navigation Menus | 导航菜单', value: 'NAVIGATION_MENU' },
  { label: 'Hero Banner Items | 轮播图', value: 'HERO_BANNER_ITEM' },

  // ==================== 媒体库 (Media Library) ====================
  { label: 'Media | 媒体', value: 'MEDIA' },
  { label: 'Media Categories | 媒体分类', value: 'MEDIA_CATEGORY' },
  { label: 'Media Tags | 媒体标签', value: 'MEDIA_TAG' },

  // ==================== 表单管理 (Forms) ====================
  { label: 'Form Configs | 表单配置', value: 'FORM_CONFIG' },
  { label: 'Form Submissions | 表单提交', value: 'FORM_SUBMISSION' },

  // ==================== 首页管理 (Homepage) ====================
  { label: 'Home Content | 首页内容', value: 'HOME_CONTENT' },
  { label: 'Footer | 页脚', value: 'FOOTER' },
  { label: 'Homepage Globals | 首页组件', value: 'HOMEPAGE_GLOBAL' },

  // ==================== 系统设置 (System Settings) ====================
  { label: 'Site Config | 站点配置', value: 'SITE_CONFIG' },
  { label: 'SEO Settings | SEO 设置', value: 'SEO_SETTING' },
  { label: 'Custom Scripts | 自定义脚本', value: 'CUSTOM_SCRIPT' },
  { label: 'Email Config | 邮件配置', value: 'EMAIL_CONFIG' },
  { label: 'Contact Config | 联系配置', value: 'CONTACT_CONFIG' },
  { label: 'Social Config | 社交配置', value: 'SOCIAL_CONFIG' },
  { label: 'Translation Config | 翻译配置', value: 'TRANSLATION_CONFIG' },
] as const

// Available actions
const ACTIONS = [
  { label: 'Create | 创建', value: 'CREATE' },
  { label: 'Read | 读取', value: 'READ' },
  { label: 'Update | 更新', value: 'UPDATE' },
  { label: 'Delete | 删除', value: 'DELETE' },
  { label: 'Publish | 发布', value: 'PUBLISH' },
  { label: 'Export | 导出', value: 'EXPORT' },
  { label: 'Import | 导入', value: 'IMPORT' },
  { label: 'Manage | 管理', value: 'MANAGE' },
] as const

// Permission categories for grouping
const CATEGORIES = [
  { label: 'User Management | 用户与权限', value: 'USER' },
  { label: 'Content Management | 内容管理', value: 'CONTENT' },
  { label: 'Media Management | 媒体库', value: 'MEDIA' },
  { label: 'Form Management | 表单管理', value: 'FORMS' },
  { label: 'Homepage Management | 首页管理', value: 'HOMEPAGE' },
  { label: 'System Configuration | 系统设置', value: 'SYSTEM' },
] as const

export const Permissions: CollectionConfig = {
  slug: 'permissions',
  labels: {
    singular: {
      en: 'Permission',
      zh: '权限',
    },
    plural: {
      en: 'Permissions',
      zh: '权限',
    },
  },
  admin: {
    useAsTitle: 'identifier',
    defaultColumns: ['identifier', 'resource', 'action', 'category'],
    group: {
      en: 'Users & Access',
      zh: '用户与权限',
    },
    description: 'System permissions for role-based access control',
  },
  access: {
    read: ({ req }) => {
      // Only admins can read permissions
      if (!req.user) return false
      return req.user.isAdmin === true
    },
    create: ({ req }) => req.user?.isAdmin === true,
    update: ({ req }) => req.user?.isAdmin === true,
    delete: ({ req }) => req.user?.isAdmin === true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate identifier from resource and action
        if (data?.resource && data?.action) {
          data.identifier = `${data.resource}_${data.action}`
        }
        return data
      },
    ],
  },
  fields: [
    // ==================================================================
    // Permission Definition
    // ==================================================================
    {
      name: 'resource',
      type: 'select',
      label: {
        en: 'Resource',
        zh: '资源',
      },
      required: true,
      options: RESOURCES.map(r => ({ label: r.label, value: r.value })),
      admin: {
        description: 'The resource this permission applies to',
      },
    },
    {
      name: 'action',
      type: 'select',
      label: {
        en: 'Action',
        zh: '操作',
      },
      required: true,
      options: ACTIONS.map(a => ({ label: a.label, value: a.value })),
      admin: {
        description: 'The action allowed on the resource',
      },
    },
    {
      name: 'identifier',
      type: 'text',
      label: {
        en: 'Identifier',
        zh: '标识符',
      },
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated: RESOURCE_ACTION',
      },
    },

    // ==================================================================
    // Categorization
    // ==================================================================
    {
      name: 'category',
      type: 'select',
      label: {
        en: 'Category',
        zh: '分类',
      },
      options: CATEGORIES.map(c => ({ label: c.label, value: c.value })),
      admin: {
        position: 'sidebar',
        description: 'Group permissions by category',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      admin: {
        description: {
          en: 'Optional description of what this permission allows',
          zh: '可选的权限描述',
        },
      },
    },

    // ==================================================================
    // Reverse Relationships
    // ==================================================================
    {
      name: 'roles',
      type: 'join',
      collection: 'roles',
      on: 'permissions',
      label: {
        en: 'Roles',
        zh: '角色',
      },
      admin: {
        description: {
          en: 'Roles that have this permission',
          zh: '拥有此权限的角色',
        },
      },
    },
    {
      name: 'users',
      type: 'join',
      collection: 'users',
      on: 'directPermissions',
      label: {
        en: 'Users',
        zh: '用户',
      },
      admin: {
        description: {
          en: 'Users with this permission directly assigned',
          zh: '直接拥有此权限的用户',
        },
      },
    },

    // ==================================================================
    // System Flag
    // ==================================================================
    {
      name: 'isSystem',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'System Permission',
        zh: '系统权限',
      },
      admin: {
        description: {
          en: 'System permissions are pre-defined and protected',
          zh: '系统权限是预定义的且受保护',
        },
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
