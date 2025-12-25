/**
 * CustomScripts Collection - Custom Code Management
 *
 * Features:
 * - Store tracking scripts (Google Analytics, TikTok Pixel, etc.)
 * - Flexible scope configuration (global, page type, exact path, etc.)
 * - Priority-based loading order
 * - Enable/disable toggle for easy testing
 */

import type { CollectionConfig } from 'payload'

export const CustomScripts: CollectionConfig = {
  slug: 'custom-scripts',
  labels: {
    singular: {
      en: 'Custom Script',
      zh: '自定义脚本',
    },
    plural: {
      en: 'Custom Scripts',
      zh: '自定义脚本',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'scriptPosition', 'scope', 'isEnabled', 'priority'],
    group: {
      en: 'Settings',
      zh: '系统设置',
    },
    description: {
      en: 'Manage tracking scripts and custom code injection',
      zh: '管理跟踪脚本和自定义代码注入',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    // ==================================================================
    // Basic Information
    // ==================================================================
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Script Name',
        zh: '脚本名称',
      },
      required: true,
      admin: {
        description: {
          en: 'e.g., "Google Analytics", "TikTok Pixel"',
          zh: '例如："Google Analytics"、"TikTok Pixel"',
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
    },

    // ==================================================================
    // Script Content
    // ==================================================================
    {
      name: 'scriptPosition',
      type: 'select',
      label: {
        en: 'Injection Position',
        zh: '注入位置',
      },
      required: true,
      defaultValue: 'header',
      options: [
        { label: { en: 'Header (before </head>)', zh: '头部 (</head> 之前)' }, value: 'header' },
        { label: { en: 'Footer (before </body>)', zh: '底部 (</body> 之前)' }, value: 'footer' },
        { label: { en: 'Body Start (after <body>)', zh: '主体开始 (<body> 之后)' }, value: 'body_start' },
      ],
    },
    {
      name: 'content',
      type: 'code',
      label: {
        en: 'Script Content',
        zh: '脚本内容',
      },
      required: true,
      admin: {
        language: 'html',
        description: {
          en: 'Enter complete <script> tag or other code',
          zh: '输入完整的 <script> 标签或其他代码',
        },
      },
    },

    // ==================================================================
    // Scope Configuration
    // ==================================================================
    {
      name: 'scope',
      type: 'select',
      label: {
        en: 'Application Scope',
        zh: '应用范围',
      },
      required: true,
      defaultValue: 'global',
      options: [
        { label: { en: 'Global (All Pages)', zh: '全局（所有页面）' }, value: 'global' },
        { label: { en: 'Page Type', zh: '页面类型' }, value: 'page_type' },
        { label: { en: 'Exact Path', zh: '精确路径' }, value: 'exact_path' },
        { label: { en: 'Path Pattern (Wildcard)', zh: '路径规则（通配符）' }, value: 'path_pattern' },
      ],
    },
    {
      name: 'pageType',
      type: 'select',
      label: {
        en: 'Page Type',
        zh: '页面类型',
      },
      options: [
        { label: { en: 'Home', zh: '首页' }, value: 'home' },
        { label: { en: 'Product Series List', zh: '产品系列列表' }, value: 'product_series_list' },
        { label: { en: 'Product Series Detail', zh: '产品系列详情' }, value: 'product_series_detail' },
        { label: { en: 'Shop List', zh: '商城列表' }, value: 'shop_list' },
        { label: { en: 'Shop Product Detail', zh: '商品详情' }, value: 'shop_detail' },
        { label: { en: 'Blog List', zh: '博客列表' }, value: 'blog_list' },
        { label: { en: 'Blog Detail', zh: '博客详情' }, value: 'blog_detail' },
        { label: { en: 'Application List', zh: '应用列表' }, value: 'application_list' },
        { label: { en: 'Application Detail', zh: '应用详情' }, value: 'application_detail' },
      ],
      admin: {
        condition: (data) => data.scope === 'page_type',
      },
    },
    {
      name: 'exactPath',
      type: 'text',
      label: {
        en: 'Exact Path',
        zh: '精确路径',
      },
      admin: {
        condition: (data) => data.scope === 'exact_path',
        description: {
          en: 'e.g., /about-us/contact',
          zh: '例如：/about-us/contact',
        },
      },
    },
    {
      name: 'pathPattern',
      type: 'text',
      label: {
        en: 'Path Pattern',
        zh: '路径规则',
      },
      admin: {
        condition: (data) => data.scope === 'path_pattern',
        description: {
          en: 'e.g., /product/* or /blog/**',
          zh: '例如：/product/* 或 /blog/**',
        },
      },
    },

    // ==================================================================
    // Control
    // ==================================================================
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: {
        en: 'Enabled',
        zh: '启用',
      },
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'number',
      label: {
        en: 'Priority',
        zh: '优先级',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Higher number = loads first',
          zh: '数字越大越先加载',
        },
      },
    },
  ],
  timestamps: true,
}
