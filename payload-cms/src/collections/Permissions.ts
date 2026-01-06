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

// All manageable resources in the system with i18n labels
const RESOURCES = [
  // Users & Access
  { value: 'USER', label: { en: 'Users', zh: '用户' } },
  { value: 'ROLE', label: { en: 'Roles', zh: '角色' } },
  { value: 'PERMISSION', label: { en: 'Permissions', zh: '权限' } },
  { value: 'AUDIT_LOG', label: { en: 'Audit Log', zh: '审计日志' } },
  // Content
  { value: 'PRODUCT', label: { en: 'Products', zh: '产品' } },
  { value: 'PRODUCT_SERIES', label: { en: 'Product Series', zh: '产品系列' } },
  { value: 'PAGE', label: { en: 'Pages', zh: '页面' } },
  { value: 'BLOG', label: { en: 'Blogs', zh: '博客' } },
  { value: 'APPLICATION', label: { en: 'Applications', zh: '应用案例' } },
  { value: 'CATEGORY', label: { en: 'Categories', zh: '分类' } },
  { value: 'FAQ_ITEM', label: { en: 'FAQ Items', zh: '常见问题' } },
  { value: 'REUSABLE_BLOCK', label: { en: 'Reusable Blocks', zh: '可复用内容块' } },
  { value: 'DOCUMENT_TEMPLATE', label: { en: 'Document Templates', zh: '文档模版' } },
  { value: 'NAVIGATION_MENU', label: { en: 'Navigation Menus', zh: '导航菜单' } },
  { value: 'HERO_BANNER_ITEM', label: { en: 'Hero Banner Items', zh: '轮播图' } },
  // Media Library
  { value: 'MEDIA', label: { en: 'Media', zh: '媒体' } },
  { value: 'MEDIA_CATEGORY', label: { en: 'Media Categories', zh: '媒体分类' } },
  { value: 'MEDIA_TAG', label: { en: 'Media Tags', zh: '媒体标签' } },
  // Forms
  { value: 'FORM_CONFIG', label: { en: 'Form Configs', zh: '表单配置' } },
  { value: 'FORM_SUBMISSION', label: { en: 'Form Submissions', zh: '表单提交' } },
  // Homepage
  { value: 'HOME_CONTENT', label: { en: 'Home Content', zh: '首页内容' } },
  { value: 'FOOTER', label: { en: 'Footer', zh: '页脚' } },
  { value: 'HOMEPAGE_GLOBAL', label: { en: 'Homepage Globals', zh: '首页组件' } },
  // System Settings
  { value: 'SITE_CONFIG', label: { en: 'Site Config', zh: '站点配置' } },
  { value: 'SEO_SETTING', label: { en: 'SEO Settings', zh: 'SEO 设置' } },
  { value: 'CUSTOM_SCRIPT', label: { en: 'Custom Scripts', zh: '自定义脚本' } },
  { value: 'EMAIL_CONFIG', label: { en: 'Email Config', zh: '邮件配置' } },
  { value: 'CONTACT_CONFIG', label: { en: 'Contact Config', zh: '联系配置' } },
  { value: 'SOCIAL_CONFIG', label: { en: 'Social Config', zh: '社交配置' } },
  { value: 'TRANSLATION_CONFIG', label: { en: 'Translation Config', zh: '翻译配置' } },
] as const

// Available actions with i18n labels
const ACTIONS = [
  { value: 'CREATE', label: { en: 'Create', zh: '创建' } },
  { value: 'READ', label: { en: 'Read', zh: '读取' } },
  { value: 'UPDATE', label: { en: 'Update', zh: '更新' } },
  { value: 'DELETE', label: { en: 'Delete', zh: '删除' } },
  { value: 'PUBLISH', label: { en: 'Publish', zh: '发布' } },
  { value: 'EXPORT', label: { en: 'Export', zh: '导出' } },
  { value: 'IMPORT', label: { en: 'Import', zh: '导入' } },
  { value: 'MANAGE', label: { en: 'Manage', zh: '管理' } },
] as const

// Permission categories for grouping with i18n labels
const CATEGORIES = [
  { value: 'USER', label: { en: 'User Management', zh: '用户与权限' } },
  { value: 'CONTENT', label: { en: 'Content Management', zh: '内容管理' } },
  { value: 'MEDIA', label: { en: 'Media Management', zh: '媒体库' } },
  { value: 'FORMS', label: { en: 'Form Management', zh: '表单管理' } },
  { value: 'HOMEPAGE', label: { en: 'Homepage Management', zh: '首页管理' } },
  { value: 'SYSTEM', label: { en: 'System Configuration', zh: '系统设置' } },
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
    description: {
      en: 'System permissions for role-based access control',
      zh: '基于角色的访问控制系统权限',
    },
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
  versions: {
    maxPerDoc: 10,
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
        description: {
          en: 'The resource this permission applies to',
          zh: '此权限适用的资源',
        },
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
        description: {
          en: 'The action allowed on the resource',
          zh: '资源上允许的操作',
        },
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
        description: {
          en: 'Auto-generated: RESOURCE_ACTION',
          zh: '自动生成: 资源_操作',
        },
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
        description: {
          en: 'Group permissions by category',
          zh: '按分类分组权限',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
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
