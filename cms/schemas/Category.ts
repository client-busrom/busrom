/**
 * Category Model - Reusable Categorization System
 *
 * This is a general-purpose category system that can be used for:
 * - Product categories (e.g., "Door Hardware", "Window Hardware")
 * - Application categories (e.g., "Residential", "Commercial")
 * - Material categories (e.g., "Stainless Steel", "Brass")
 *
 * Supports:
 * - Hierarchical categories (parent-child relationships)
 * - 24-language translations
 * - Soft delete
 */

import { list } from '@keystone-6/core'
import { text, json, select, relationship, timestamp, integer } from '@keystone-6/core/fields'

export const Category = list({
  fields: {
    // ==================================================================
    // 🌐 Multi-language Name (JSON format with custom editor)
    // ==================================================================
    name: json({
      label: 'Category Name (分类名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Category name in all 24 languages with auto-translation | 分类名称（支持24种语言自动翻译）',
      },
    }),

    /**
     * Slug (URL-friendly identifier)
     */
    slug: text({
      label: 'Slug (URL标识)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'URL-friendly version | URL友好标识 (e.g., "door-hardware")',
      },
    }),

    /**
     * Category Type
     *
     * Different types of categories for different purposes
     */
    type: select({
      label: 'Category Type (分类类型)',
      options: [
        { label: 'Page (页面)', value: 'PAGE' },
        { label: 'Product (产品)', value: 'PRODUCT' },
        { label: 'Blog (博客)', value: 'BLOG' },
        { label: 'Application (应用)', value: 'APPLICATION' },
        { label: 'FAQ (常见问题)', value: 'FAQ' },
      ],
      validation: { isRequired: true },
      ui: {
        displayMode: 'select',
        description: 'Category usage type | 分类用途类型',
      },
    }),

    /**
     * Parent Category
     *
     * Supports hierarchical categories (e.g., "Hardware" > "Door Hardware")
     */
    parent: relationship({
      label: 'Parent Category (父分类)',
      ref: 'Category.children',
      many: false,
      ui: {
        displayMode: 'select',
        description: 'Parent category for hierarchical structure | 父级分类（支持层级结构）',
      },
    }),

    /**
     * Child Categories
     */
    children: relationship({
      label: 'Child Categories (子分类)',
      ref: 'Category.parent',
      many: true,
      ui: {
        description: 'Child categories | 子级分类',
      },
    }),

    /**
     * Description (Multi-language)
     */
    description: json({
      label: 'Description (描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Category description in all 24 languages | 分类描述（支持24种语言）',
      },
    }),

    /**
     * Display Order
     *
     * Control the order of categories in lists (lower number = higher priority)
     */
    order: integer({
      label: 'Display Order (显示顺序)',
      defaultValue: 0,
      ui: {
        description: 'Display order (lower number appears first) | 显示顺序（数字越小越靠前）',
      },
    }),

    /**
     * Status
     */
    status: select({
      label: 'Status (状态)',
      options: [
        { label: 'Published (已发布)', value: 'PUBLISHED' },
        { label: 'Draft (草稿)', value: 'DRAFT' },
        { label: 'Archived (归档)', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      ui: {
        displayMode: 'segmented-control',
        description: 'Category status | 分类状态',
      },
    }),

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
    }),
  },

  /**
   * Access Control
   * - query: 公开访问 (前端需要读取分类)
   * - create/update/delete: 需要登录
   */
  access: {
    operation: {
      query: () => true,
      create: ({ session }: any) => !!session,
      update: ({ session }: any) => !!session,
      delete: ({ session }: any) => !!session,
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['slug', 'type', 'order', 'status'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
    labelField: 'slug',
  },

  /**
   * Hooks
   */
  hooks: {
    /**
     * ActivityLog - Record all operations
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if ((operation === 'create' || operation === 'update' || operation === 'delete') && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation, 'Category', item, undefined, originalItem)
      }
    },
  },
})
