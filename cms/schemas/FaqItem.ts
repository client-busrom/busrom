/**
 * FaqItem Model - Frequently Asked Questions
 *
 * Features:
 * - 24-language support with JSON multilingual approach
 * - JSON fields for question and answer (both text-based)
 * - Soft delete (status: PUBLISHED/DRAFT/ARCHIVED)
 * - Category support
 * - Display order
 */

import { list, graphql } from '@keystone-6/core'
import { text, json, select, relationship, timestamp, integer, virtual } from '@keystone-6/core/fields'
import { publicReadAccess } from '../lib/permissions/access-control'

export const FaqItem = list({
  fields: {
    // ==================================================================
    // 🔑 Core Fields
    // ==================================================================

    /**
     * Internal ID (for easy reference)
     */
    internalId: text({
      label: 'Internal ID (内部编号)',
      ui: {
        description: 'Internal reference ID | 内部参考编号 (e.g., "FAQ-001")',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Fields: JSON Approach (Short Text)
    // ==================================================================

    /**
     * Question (Multilingual JSON)
     */
    question: json({
      label: 'Question (问题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Question text in all 24 languages with auto-translation | 问题文本（支持24种语言自动翻译）',
      },
    }),

    /**
     * Answer (Multilingual JSON)
     */
    answer: json({
      label: 'Answer (答案)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Answer text in all 24 languages with auto-translation | 答案文本（支持24种语言自动翻译）',
      },
    }),

    // ==================================================================
    // 🖼️ Relationships
    // ==================================================================

    /**
     * Category
     */
    category: relationship({
      label: 'Category (分类)',
      ref: 'Category',
      many: false,
      ui: {
        displayMode: 'select',
        description: 'Select category (type: FAQ) | 选择分类（类型：常见问题）',
      },
    }),

    // ==================================================================
    // ⚙️ System Fields
    // ==================================================================

    /**
     * Display Order
     */
    order: integer({
      label: 'Display Order (显示顺序)',
      defaultValue: 0,
      ui: {
        description: 'Display order (lower number appears first) | 显示顺序（数字越小越靠前）',
      },
    }),

    /**
     * Status (Soft Delete)
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
        description: 'FAQ item status | 常见问题状态',
      },
    }),

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
    }),

    /**
     * Duplicate Action Button
     */
    duplicate: virtual({
      label: 'Duplicate (复制)',
      field: graphql.field({
        type: graphql.String,
        resolve() {
          return null
        },
      }),
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
        views: './custom-fields/DuplicateItemButton',
      },
    }),
  },

  /**
   * GraphQL Configuration
   */
  graphql: {
    plural: 'FaqItems',
  },

  /**
   * Access Control - RBAC System
   * Requires FaqItem:create, FaqItem:read, FaqItem:update, FaqItem:delete permissions
   */
  access: publicReadAccess('FaqItem'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['internalId', 'category', 'order', 'status'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
    labelField: 'internalId',
    label: 'FAQ Items | 常见问题',
    singular: 'FAQ Item | 常见问题',
    plural: 'FAQ Items | 常见问题',
  },

  /**
   * Hooks
   */
  hooks: {
    /**
     * ActivityLog - Record all operations
     * Note: Physical delete is disabled, only status changes are logged
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if ((operation === 'create' || operation === 'update') && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation, 'FaqItem', item, undefined, originalItem)
      }
    },
  },
})
