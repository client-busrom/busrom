/**
 * FaqItems Collection - Frequently Asked Questions
 *
 * Features:
 * - 24-language support for questions and answers
 * - Category grouping
 * - Display order control
 * - Soft delete
 * - Tabbed admin interface
 */

import type { CollectionConfig } from 'payload'

export const FaqItems: CollectionConfig = {
  slug: 'faq-items',
  labels: {
    singular: {
      en: 'FAQ',
      zh: '常见问题',
    },
    plural: {
      en: 'FAQs',
      zh: '常见问题',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'category', 'order', 'status'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) {
        return {
          status: { equals: 'published' },
        }
      }
      return true
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ==================================================================
        // Tab 1: Question
        // ==================================================================
        {
          label: {
            en: 'Question',
            zh: '问题',
          },
          fields: [
            {
              name: 'slug',
              type: 'text',
              label: {
                en: 'Slug',
                zh: '标识',
              },
              required: true,
              unique: true,
              admin: {
                description: 'Unique identifier (e.g., "shipping-policy")',
              },
            },
            {
              name: 'question',
              type: 'text',
              label: {
                en: 'Question',
                zh: '问题',
              },
              required: true,
              localized: true,
            },
          ],
        },

        // ==================================================================
        // Tab 2: Content (Answer)
        // ==================================================================
        {
          label: {
            en: 'Content',
            zh: '内容',
          },
          fields: [
            {
              name: 'contentTranslation',
              type: 'richText',
              label: {
                en: 'Answer',
                zh: '答案',
              },
              localized: true,
              admin: {
                description: 'Rich text answer - use language tabs above to switch locales',
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },

        // ==================================================================
        // Tab 3: Organization
        // ==================================================================
        {
          label: {
            en: 'Organization',
            zh: '组织',
          },
          fields: [
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              label: {
                en: 'Category',
                zh: '分类',
              },
              filterOptions: {
                type: { equals: 'FAQ' },
              },
              admin: {
                description: 'Select an FAQ category',
              },
            },
            {
              name: 'relatedFaqs',
              type: 'relationship',
              relationTo: 'faq-items',
              hasMany: true,
              label: {
                en: 'Related FAQs',
                zh: '相关问题',
              },
              admin: {
                description: 'Link to related FAQ items',
              },
            },
          ],
        },
      ],
    },

    // ==================================================================
    // Sidebar Fields
    // ==================================================================
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
        description: 'Lower number = higher priority',
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
