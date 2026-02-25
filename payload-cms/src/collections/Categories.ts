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
    useAsTitle: 'fullTitle',
    defaultColumns: ['fullTitle', 'type', 'order', 'status'],
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
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Helper to get a readable name from the category data
        const getName = (doc: any) => {
          if (!doc) return ''
          // If name is localized object
          if (doc.name && typeof doc.name === 'object') {
            return doc.name.en || doc.name.zh || doc.slug || 'Untitled'
          }
          return doc.name || doc.slug || 'Untitled'
        }

        const currentName = getName(data)
        let fullTitle = currentName

        if (data.parent) {
          try {
            const parent = await req.payload.findByID({
              collection: 'categories',
              id: typeof data.parent === 'object' ? data.parent.id : data.parent,
              depth: 0,
            })
            if (parent) {
              const parentTitle = (parent as any).fullTitle || getName(parent)
              fullTitle = `${parentTitle} > ${currentName}`
            }
          } catch (e) {
            console.error('Error fetching parent category for fullTitle:', e)
          }
        }
        data.fullTitle = fullTitle
        return data
      },
    ],
  },
  fields: [
    {
      name: 'fullTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      index: true,
    },
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
        description: {
          en: 'Bilingual category name',
          zh: '双语分类名称',
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
        { label: { en: 'Page', zh: '页面' }, value: 'PAGE' },
        { label: { en: 'Product', zh: '产品' }, value: 'PRODUCT' },
        { label: { en: 'Blog', zh: '博客' }, value: 'BLOG' },
        { label: { en: 'Application', zh: '应用' }, value: 'APPLICATION' },
        { label: { en: 'FAQ', zh: '常见问题' }, value: 'FAQ' },
      ],
    },

    // ==================================================================
    // Hierarchy
    // ==================================================================
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      filterOptions: ({ data, id }) => {
        const filter: any = {}
        if (data?.type) {
          filter.type = { equals: data.type }
        }
        if (id) {
          filter.id = { not_equals: id }
        }
        return filter
      },
      admin: {
        description: {
          en: 'Parent category for hierarchical structure (filtered by same type)',
          zh: '用于层级结构的父分类（仅显示相同类型的分类）',
        },
      },
    },
    {
      name: 'children',
      type: 'join',
      collection: 'categories',
      on: 'parent',
      label: {
        en: 'Sub-categories',
        zh: '子分类',
      },
      admin: {
        description: {
          en: 'Direct sub-categories belonging to this category',
          zh: '该分类下的直接子分类',
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
        description: {
          en: 'Localized description of this category',
          zh: '此分类的多语言描述',
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
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
        { label: { en: 'Archived', zh: '归档' }, value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
  ],
  timestamps: true,
}
