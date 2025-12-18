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
    description: 'Manage tracking scripts and custom code injection',
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
        description: 'e.g., "Google Analytics", "TikTok Pixel"',
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
        { label: 'Header (before </head>)', value: 'header' },
        { label: 'Footer (before </body>)', value: 'footer' },
        { label: 'Body Start (after <body>)', value: 'body_start' },
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
        description: 'Enter complete <script> tag or other code',
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
        { label: 'Global (All Pages) | 全局', value: 'global' },
        { label: 'Page Type | 页面类型', value: 'page_type' },
        { label: 'Exact Path | 精确路径', value: 'exact_path' },
        { label: 'Path Pattern (Wildcard) | 路径规则', value: 'path_pattern' },
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
        { label: 'Home | 首页', value: 'home' },
        { label: 'Product Series List', value: 'product_series_list' },
        { label: 'Product Series Detail', value: 'product_series_detail' },
        { label: 'Shop List', value: 'shop_list' },
        { label: 'Shop Product Detail', value: 'shop_detail' },
        { label: 'Blog List', value: 'blog_list' },
        { label: 'Blog Detail', value: 'blog_detail' },
        { label: 'Application List', value: 'application_list' },
        { label: 'Application Detail', value: 'application_detail' },
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
        description: 'e.g., /about-us/contact',
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
        description: 'e.g., /product/* or /blog/**',
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
        description: 'Higher number = loads first',
      },
    },
  ],
  timestamps: true,
}
