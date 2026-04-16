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
  { value: 'PRODUCT', label: { en: 'Product Links', zh: '产品链接整合页' } },
  { value: 'PRODUCT_SERIES', label: { en: 'Product Details', zh: '产品详解整合页' } },
  { value: 'PRODUCT_ATTRIBUTE', label: { en: 'Product Attributes', zh: '产品链接页属性' } },
  { value: 'PRODUCT_TEMPLATE', label: { en: 'Product Templates', zh: '产品链接模版页' } },
  { value: 'PRODUCT_REUSABLE_BLOCK', label: { en: 'Product Reusable Blocks', zh: '产品链接复用块' } },
  { value: 'SERIES_TEMPLATE', label: { en: 'Series Templates', zh: '产品详解模版页' } },
  { value: 'SERIES_REUSABLE_BLOCK', label: { en: 'Series Reusable Blocks', zh: '产品详解复用块' } },
  { value: 'SERIES_INTRO_ITEM', label: { en: 'Series Intro Items', zh: '系列介绍' } },
  { value: 'PAGE', label: { en: 'Pages', zh: '页面' } },
  { value: 'BLOG', label: { en: 'Knowledge Base', zh: '知识库' } },
  { value: 'BLOG_TAG', label: { en: 'KB Tags', zh: '知识库标签管理' } },
  { value: 'KNOWLEDGE_BASE_SETTINGS', label: { en: 'KB Settings', zh: '知识库全局管理' } },
  { value: 'AUTHOR', label: { en: 'Authors', zh: '作者管理' } },
  { value: 'APPLICATION', label: { en: 'Apps & Cases', zh: '案例图集' } },
  { value: 'CATEGORY', label: { en: 'Category Structure', zh: '分类结构管理' } },
  { value: 'FAQ_ITEM', label: { en: 'FAQ Items', zh: '常见问题' } },
  { value: 'REUSABLE_BLOCK', label: { en: 'Reusable Blocks', zh: '可复用块' } },
  { value: 'DOCUMENT_TEMPLATE', label: { en: 'Section Templates', zh: '页面板块模板库' } },
  { value: 'TEMPLATE_CATEGORY', label: { en: 'Template Categories', zh: '组件模版库分类集合' } },
  { value: 'NAVIGATION_MENU', label: { en: 'Nav Menus', zh: '导航菜单' } },
  { value: 'HERO_BANNER_ITEM', label: { en: 'Hero Items', zh: '首页首屏轮播图' } },
  // Media Library
  { value: 'MEDIA', label: { en: 'Media', zh: '媒体' } },
  { value: 'MEDIA_CATEGORY', label: { en: 'Media Categories', zh: '媒体分类' } },
  { value: 'MEDIA_TAG', label: { en: 'Media Tags', zh: '媒体标签' } },
  // Forms
  { value: 'FORM_CONFIG', label: { en: 'Form Configs', zh: '表单配置' } },
  { value: 'FORM_SUBMISSION', label: { en: 'Form Submissions', zh: '表单提交记录' } },
  // Homepage
  { value: 'HOME_CONTENT', label: { en: 'Homepage Sections', zh: '首页内容配置' } },
  { value: 'FOOTER', label: { en: 'Global Footer', zh: '页脚' } },
  { value: 'HOMEPAGE_GLOBAL', label: { en: 'Homepage Global', zh: '首页全局设置' } },
  // System Settings
  { value: 'SITE_CONFIG', label: { en: 'Site Config', zh: '站点配置' } },
  { value: 'SEO_SETTING', label: { en: 'SEO Settings', zh: 'SEO设置' } },
  { value: 'CUSTOM_SCRIPT', label: { en: 'Custom Scripts', zh: '自定义脚本' } },
  { value: 'EMAIL_CONFIG', label: { en: 'Email Config', zh: '邮件配置' } },
  { value: 'CONTACT_CONFIG', label: { en: 'Contact Config', zh: '联系配置' } },
  { value: 'SOCIAL_CONFIG', label: { en: 'Social Links', zh: '社交配置' } },
  { value: 'TRANSLATION_CONFIG', label: { en: 'Translation Settings', zh: '翻译配置（全局）' } },
  { value: 'SHOP_PAGE_CONFIG', label: { en: 'Shop Preview', zh: 'Shop 列表页管理' } },
  { value: 'PRELOADER_CONFIG', label: { en: 'Preloader Config', zh: '加载动画配置' } },
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
  { value: 'USER', label: { en: 'Users & Access', zh: '用户与权限' } },
  { value: 'NAVIGATION', label: { en: 'Navigation', zh: '导航管理' } },
  { value: 'WEBSITE_PAGES', label: { en: 'Website Pages', zh: '网站页面管理' } },
  { value: 'PRODUCTS', label: { en: 'Products', zh: '产品管理' } },
  { value: 'CONTENT', label: { en: 'Content Management', zh: '内容管理' } },
  { value: 'MEDIA', label: { en: 'Media Library', zh: '媒体库' } },
  { value: 'FORMS', label: { en: 'Forms', zh: '表单管理' } },
  { value: 'ADVANCED', label: { en: 'Advanced', zh: '高级设置' } },
  { value: 'WEBSITE_SETTINGS', label: { en: 'Website Settings', zh: '网站设置' } },
  { value: 'CMS_SETTINGS', label: { en: 'CMS Settings', zh: 'CMS 配置' } },
  // Legacy categories to prevent migration errors
  { value: 'HOMEPAGE', label: { en: 'Homepage (Legacy)', zh: '首页管理 (旧)' } },
  { value: 'SYSTEM', label: { en: 'System (Legacy)', zh: '系统设置 (旧)' } },
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

  // // versions: {

 // // maxPerDoc: 10,

 // // },

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
