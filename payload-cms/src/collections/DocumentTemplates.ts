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
      zh: '页面板块模板库',
    },
    plural: {
      en: 'Document Templates',
      zh: '页面板块模板库',
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

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

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
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
    },

    // ==================================================================
    // Category
    // ==================================================================
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'template-categories',
      label: {
        en: 'Category',
        zh: '分类',
      },
      admin: {
        description: {
          en: 'Category for organizing templates (managed in Template Categories)',
          zh: '用于组织模板的分类（在"模板分类"中管理）',
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
        disableListColumn: true,
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
        { label: { en: 'Active', zh: '启用' }, value: 'active' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
        { label: { en: 'Archived', zh: '已归档' }, value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        description: {
          en: 'Only ACTIVE templates appear in the template selector',
          zh: '只有"启用"状态的模板会显示在模板选择器中',
        },
      },
    },
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
  ],
  timestamps: true,
}
