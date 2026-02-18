/**
 * ReusableBlocks Collection - Reusable Content Blocks
 *
 * Reusable content blocks that can be referenced from multiple pages.
 * Useful for:
 * - Common CTA sections
 * - Feature highlights
 * - Testimonials
 * - Contact info blocks
 *
 * Features:
 * - 24-language support
 * - Rich text content
 * - Can be embedded in pages via relationship
 */

import type { CollectionConfig } from 'payload'

export const ReusableBlocks: CollectionConfig = {
  slug: 'reusable-blocks',
  labels: {
    singular: {
      en: 'Reusable Block',
      zh: '可复用区块',
    },
    plural: {
      en: 'Reusable Blocks',
      zh: '可复用区块',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'blockType', 'status', 'updatedAt'],
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
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // ==================================================================
    // Tab Layout for better organization
    // ==================================================================
    {
      type: 'tabs',
      tabs: [
        // ----------------------------------------------------------
        // Tab 1: Basic Info
        // ----------------------------------------------------------
        {
          label: {
            en: 'Basic Info',
            zh: '基本信息',
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
                description: {
                  en: 'Unique identifier (e.g., "cta-contact-us", "feature-quality")',
                  zh: '唯一标识符（例如："cta-contact-us"、"feature-quality"）',
                },
              },
            },
            {
              name: 'blockType',
              type: 'select',
              label: {
                en: 'Block Type',
                zh: '区块类型',
              },
              required: true,
              options: [
                { label: 'CTA | 行动召唤', value: 'CTA' },
                { label: 'Feature | 特性', value: 'FEATURE' },
                { label: 'Testimonial | 客户评价', value: 'TESTIMONIAL' },
                { label: 'Contact | 联系信息', value: 'CONTACT' },
                { label: 'Product | 产品', value: 'PRODUCT' },
                { label: 'Custom | 自定义', value: 'CUSTOM' },
              ],
            },
            {
              name: 'title',
              type: 'textarea',
              label: {
                en: 'Title',
                zh: '标题',
              },
              localized: true,
            },
            {
              name: 'subtitle',
              type: 'textarea',
              label: {
                en: 'Subtitle',
                zh: '副标题',
              },
              localized: true,
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 2: Content
        // ----------------------------------------------------------
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
                en: 'Content',
                zh: '富文本内容',
              },
              localized: true,
              admin: {
                description: {
                  en: 'Rich text content - use language tabs above to switch locales',
                  zh: '富文本内容 - 使用上方语言标签切换语言',
                },
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },

      ],
    },

    // ==================================================================
    // System Fields
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
