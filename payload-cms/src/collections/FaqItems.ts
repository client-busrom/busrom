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
import { formatSlug } from '../hooks/formatSlug'

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
    useAsTitle: 'adminLabel',
    defaultColumns: ['adminLabel', 'slug', 'category', 'status'],
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
  
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing
        if (isTranslation) return data

        return data;
      }
    ]
  },

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

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
              name: 'adminLabel',
              type: 'textarea',
              label: {
                en: 'Admin Identification (Internal Use)',
                zh: '内部管理标识（不影响URL）',
              },
              admin: {
                description: {
                  en: 'This identifier is for internal management and can contain spaces/caps. (e.g. "FAQ- Shipping Policy")',
                  zh: '仅用于后台管理区分，可以包含空格和大小写（例如："FAQ- 配送政策"）',
                },
              },
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              label: {
                en: 'Technical Slug (URL Anchor)',
                zh: '技术标识 (自动生成)',
              },
              hooks: {
                beforeValidate: [formatSlug('question')],
              },
              required: true,
              unique: true,
              admin: {
                readOnly: true,
                description: {
                  en: 'This is automatically generated and used for deep linking anchors.',
                  zh: '此字段自动生成，用于前端锚点跳转，不可手动修改。',
                },
              },
            },
            {
              name: 'question',
              type: 'textarea',
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
                  description: {
                    en: 'Rich text answer - use language tabs above to switch locales',
                    zh: '富文本答案 - 使用上方语言标签切换语言',
                  },
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
                description: {
                  en: 'Select an FAQ category',
                  zh: '选择FAQ分类',
                },
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
                description: {
                  en: 'Link to related FAQ items',
                  zh: '关联相关FAQ项目',
                },
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
        disableListColumn: true,
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
        disableListColumn: true,
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
        disableListColumn: true,
      },
    },
  ],
  timestamps: true,
}
