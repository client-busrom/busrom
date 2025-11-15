/**
 * DocumentTemplate Model - 图章模板
 *
 * 存储预编辑的Document JSON片段，运营人员可以选择模板并应用到当前文档中。
 * 应用后，模板内容会通过JSON数组拼接的方式插入到文档中，之后可以自由编辑。
 *
 * Features:
 * - 预编辑的Document JSON内容
 * - 分类管理
 * - 预览图
 * - 标签搜索
 * - 使用统计
 */

import { list } from '@keystone-6/core'
import { text, select, json, timestamp, relationship } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { publicReadAccess } from '../lib/permissions/access-control'
import { componentBlocks } from '../component-blocks'

export const DocumentTemplate = list({
  fields: {
    // 基础信息
    key: text({
      label: 'Template Key',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'Unique identifier (e.g., "product-intro-template")'
      }
    }),

    name: text({
      label: 'Template Name',
      validation: { isRequired: true },
      ui: {
        description: 'Display name shown in template selector'
      }
    }),

    description: text({
      label: 'Description',
      ui: {
        displayMode: 'textarea',
        description: 'Brief description of what this template is for'
      }
    }),

    category: select({
      label: 'Category',
      options: [
        { label: 'Product Introduction', value: 'product-intro' },
        { label: 'Feature Section', value: 'feature' },
        { label: 'FAQ Section', value: 'faq' },
        { label: 'Testimonial', value: 'testimonial' },
        { label: 'Call to Action', value: 'cta' },
        { label: 'Comparison Table', value: 'comparison' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
      ui: {
        description: 'Category for organizing templates'
      }
    }),

    // 🔥 核心：Document内容
    // 使用 document 字段类型，可以直接在 UI 中编辑模板内容
    content: document({
      formatting: {
        inlineMarks: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          code: true,
          superscript: true,
          subscript: true,
          keyboard: true,
        },
        listTypes: {
          ordered: true,
          unordered: true,
        },
        alignment: {
          center: true,
          end: true,
        },
        headingLevels: [1, 2, 3, 4, 5, 6],
        blockTypes: {
          blockquote: true,
          code: true,
        },
        softBreaks: true,
      },
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [2, 1],
        [1, 2],
        [1, 1, 1],
        [1, 2, 1],
        [2, 1, 1],
        [1, 1, 2]
      ],
      componentBlocks,
      ui: {
        views: './custom-fields/DocumentEditorForTemplate',
        description: '模板内容 - 使用富文本编辑器直接编辑'
      }
    }),

    // 预览图（可选）
    previewImage: relationship({
      label: 'Preview Image',
      ref: 'Media',
      ui: {
        displayMode: 'cards',
        cardFields: ['file', 'filename'],
        inlineConnect: true,
        description: 'Optional preview image to help users identify the template'
      }
    }),

    // 标签（用于搜索）
    tags: text({
      label: 'Tags',
      ui: {
        description: 'Comma-separated tags for searching (e.g., "product, hero, banner")'
      }
    }),

    // 使用统计
    usageCount: json({
      label: 'Usage Statistics',
      defaultValue: { count: 0 },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Tracks how many times this template has been used'
      }
    }),

    // 状态
    status: select({
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'active',
      ui: {
        displayMode: 'segmented-control',
        description: 'Only ACTIVE templates appear in the template selector'
      }
    }),

    // 时间戳
    createdAt: timestamp({
      label: 'Created At',
      defaultValue: { kind: 'now' }
    }),

    updatedAt: timestamp({
      label: 'Updated At',
      db: { updatedAt: true }
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'category', 'status', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'name',
    description: '📋 Document Templates - Pre-made content templates that can be inserted into documents',
  },

  access: publicReadAccess('DocumentTemplate'),

  hooks: {
    // 可以在这里添加使用统计的hook
    // 但暂时先不实现，因为需要遍历所有文档才能统计
  }
})
