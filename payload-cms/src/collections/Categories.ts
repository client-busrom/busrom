/**
 * Categories Collection - Reusable Categorization System
 *
 * General-purpose category system for:
 * - Product categories
 * - Application categories
 * - Blog categories
 * - FAQ categories
 *
 * Supports:
 * - Hierarchical categories (parent-child relationships)
 * - 24-language translations
 * - Soft delete
 */

import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      zh: '分类',
    },
    plural: {
      en: 'Categories',
      zh: '分类',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'type', 'order', 'status'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },

  // 版本控制 - 保留修改历史
  versions: {
    maxPerDoc: 10,
  },
  fields: [
    // ==================================================================
    // Multi-language Name
    // ==================================================================
    {
      name: 'name',
      type: 'textarea',
      label: {
        en: 'Category Name',
        zh: '分类名称',
      },
      required: true,
      localized: true,
      admin: {
        components: {
          Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug (URL ID)',
        zh: 'Slug (URL标识)',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'URL-friendly identifier (e.g., "door-hardware")',
          zh: 'URL友好标识符（例如："door-hardware"）',
        },
      },
    },

    // ==================================================================
    // Category Type
    // ==================================================================
    {
      name: 'type',
      type: 'select',
      label: {
        en: 'Category Type',
        zh: '分类类型',
      },
      required: true,
      options: [
        { label: 'Page | 页面', value: 'PAGE' },
        { label: 'Product | 产品', value: 'PRODUCT' },
        { label: 'Blog | 博客', value: 'BLOG' },
        { label: 'Application | 应用', value: 'APPLICATION' },
        { label: 'FAQ | 常见问题', value: 'FAQ' },
      ],
    },

    // ==================================================================
    // Hierarchy
    // ==================================================================
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: {
        en: 'Parent Category',
        zh: '父分类',
      },
      admin: {
        description: {
          en: 'Parent category for hierarchical structure',
          zh: '用于层级结构的父分类',
        },
      },
    },

    // ==================================================================
    // Description
    // ==================================================================
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
      admin: {
        components: {
          Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
        },
      },
    },

    // ==================================================================
    // System Fields
    // ==================================================================
    {
      name: 'order',
      type: 'number',
      label: {
        en: 'Display Order',
        zh: '显示顺序',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Lower number = higher priority',
          zh: '数字越小优先级越高',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      defaultValue: 'draft',
      options: [
        { label: 'Published | 已发布', value: 'published' },
        { label: 'Draft | 草稿', value: 'draft' },
        { label: 'Archived | 归档', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
