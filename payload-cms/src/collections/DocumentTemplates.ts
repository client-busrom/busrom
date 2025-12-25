/**
 * DocumentTemplates Collection - Reusable Content Templates
 *
 * Features:
 * - Pre-made rich text content templates
 * - Categories for organization
 * - Preview images
 * - Tags for searching
 * - Usage statistics
 *
 * Templates can be inserted into any rich text field.
 */

import type { CollectionConfig } from 'payload'

export const DocumentTemplates: CollectionConfig = {
  slug: 'document-templates',
  labels: {
    singular: {
      en: 'Document Template',
      zh: '文档模板',
    },
    plural: {
      en: 'Document Templates',
      zh: '文档模板',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'status', 'updatedAt'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
    description: {
      en: 'Pre-made content templates that can be inserted into documents',
      zh: '可插入文档的预制内容模板',
    },
    pagination: {
      defaultLimit: 50,
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.isAdmin === true,
  },
  fields: [
    // ==================================================================
    // Basic Information
    // ==================================================================
    {
      name: 'key',
      type: 'text',
      label: {
        en: 'Template Key',
        zh: '模板标识',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Unique identifier (e.g., "product-intro-template")',
          zh: '唯一标识符（例如："product-intro-template"）',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Template Name',
        zh: '模板名称',
      },
      required: true,
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
    // Category
    // ==================================================================
    {
      name: 'category',
      type: 'select',
      label: {
        en: 'Category',
        zh: '分类',
      },
      defaultValue: 'other',
      options: [
        { label: 'Product Introduction | 产品介绍', value: 'product-intro' },
        { label: 'Feature Section | 功能特点', value: 'feature' },
        { label: 'FAQ Section | 常见问题', value: 'faq' },
        { label: 'Testimonial | 客户评价', value: 'testimonial' },
        { label: 'Call to Action | 行动召唤', value: 'cta' },
        { label: 'Comparison Table | 对比表格', value: 'comparison' },
        { label: 'Other | 其他', value: 'other' },
      ],
      admin: {
        description: {
          en: 'Category for organizing templates',
          zh: '用于组织模板的分类',
        },
      },
    },

    // ==================================================================
    // Template Content (not localized - content is copied to target documents where it gets translated)
    // ==================================================================
    {
      name: 'content',
      type: 'richText',
      label: {
        en: 'Template Content',
        zh: '模板内容',
      },
    },

    // ==================================================================
    // Tags
    // ==================================================================
    {
      name: 'tags',
      type: 'text',
      label: {
        en: 'Tags',
        zh: '标签',
      },
      admin: {
        description: {
          en: 'Comma-separated tags for searching (e.g., "product, hero, banner")',
          zh: '用逗号分隔的搜索标签（例如："product, hero, banner"）',
        },
      },
    },

    // ==================================================================
    // Usage Statistics
    // ==================================================================
    {
      name: 'usageCount',
      type: 'number',
      label: {
        en: 'Usage Count',
        zh: '使用次数',
      },
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          en: 'Number of times this template has been used',
          zh: '此模板的使用次数',
        },
      },
    },

    // ==================================================================
    // Status
    // ==================================================================
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      defaultValue: 'active',
      options: [
        { label: 'Active | 启用', value: 'active' },
        { label: 'Draft | 草稿', value: 'draft' },
        { label: 'Archived | 已归档', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: 'Only ACTIVE templates appear in the template selector',
          zh: '只有"启用"状态的模板会显示在模板选择器中',
        },
      },
    },
  ],
  timestamps: true,
}
