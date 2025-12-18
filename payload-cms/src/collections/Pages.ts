/**
 * Pages Collection - Unified Page Management
 *
 * Unified model for managing both template-based pages and free-form landing pages.
 *
 * Page Types:
 * 1. TEMPLATE: Fixed template pages (e.g., FAQ, About Us, Services)
 *    - Structure is pre-built by admin
 *    - Operators only edit text content and replace images
 *
 * 2. FREEFORM: Free-form landing pages (e.g., promotions, campaigns)
 *    - Operators can freely create and edit structure
 *    - Full access to rich text editor
 *
 * Features:
 * - 24-language support
 * - Hero section configuration
 * - SEO managed via separate SeoSetting model
 * - Draft-Publish workflow
 */

import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      en: 'Page',
      zh: '页面',
    },
    plural: {
      en: 'Pages',
      zh: '页面',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'pageType', 'template', 'status', 'order', 'updatedAt'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
    description: 'Unified page management - includes template pages and freeform landing pages',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: async ({ req, id }) => {
      if (!req.user) return false
      // Check if it's a system page
      if (id) {
        const page = await req.payload.findByID({
          collection: 'pages',
          id,
        })
        if (page?.isSystem) return false
      }
      return true
    },
  },
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
                zh: '页面标识',
              },
              required: true,
              unique: true,
              admin: {
                description: 'CMS internal identifier. e.g.: service-overview, faq, summer-promotion-2024',
              },
              validate: (value) => {
                if (!value) return true
                const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
                if (!slugRegex.test(value)) {
                  return 'Slug must be lowercase with hyphens only (e.g., service-overview)'
                }
                return true
              },
            },
            {
              name: 'path',
              type: 'text',
              label: {
                en: 'Path (URL)',
                zh: 'URL路径',
              },
              required: true,
              unique: true,
              admin: {
                description: 'Full URL path for frontend routing. e.g.: /service/one-stop-shop, /about-us/story',
              },
              validate: (value) => {
                if (!value) return true
                if (!value.startsWith('/')) {
                  return 'Path must start with / (e.g., /service/one-stop-shop)'
                }
                const pathRegex = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/
                if (!pathRegex.test(value)) {
                  return 'Path must be lowercase with hyphens, using / as separator'
                }
                return true
              },
            },
            {
              name: 'pageType',
              type: 'select',
              label: {
                en: 'Page Type',
                zh: '页面类型',
              },
              required: true,
              defaultValue: 'FREEFORM',
              options: [
                { label: 'Template Page | 固定模板页', value: 'TEMPLATE' },
                { label: 'Freeform Page | 自由落地页', value: 'FREEFORM' },
              ],
              admin: {
                description: 'Template: fixed structure, only edit content | Freeform: fully customizable',
              },
            },
            {
              name: 'template',
              type: 'text',
              label: {
                en: 'Template Name',
                zh: '模板名称',
              },
              admin: {
                description: 'Only for template pages. e.g.: SERVICE_OVERVIEW, FAQ, ABOUT_US, OEM_ODM',
                condition: (data) => data.pageType === 'TEMPLATE',
              },
            },
            {
              name: 'title',
              type: 'text',
              label: {
                en: 'Page Title',
                zh: '页面标题',
              },
              required: true,
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
              localized: true,
              label: {
                en: 'Content',
                zh: '富文本内容',
              },
              admin: {
                description: 'Rich text content - use language tabs above to switch locales',
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 3: Hero Section
        // ----------------------------------------------------------
        {
          label: {
            en: 'Hero Section',
            zh: '顶部配置',
          },
          fields: [
            {
              name: 'heroMediaTags',
              type: 'relationship',
              relationTo: 'media-tags',
              hasMany: true,
              label: {
                en: 'Hero Media Tags',
                zh: '顶部图片标签',
              },
              admin: {
                description: 'Select media tags for hero waterfall animation',
              },
            },
            {
              name: 'heroText',
              type: 'text',
              label: {
                en: 'Hero Text Overlay',
                zh: '顶部叠加文字',
              },
              localized: true,
            },
            {
              name: 'heroSubtitle',
              type: 'text',
              label: {
                en: 'Hero Subtitle',
                zh: '顶部副标题',
              },
              localized: true,
            },
          ],
        },
      ],
    },

    // ==================================================================
    // System Settings
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
      name: 'isSystem',
      type: 'checkbox',
      label: {
        en: 'System Page',
        zh: '系统页面',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'System pages cannot be deleted',
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
    {
      name: 'publishedAt',
      type: 'date',
      label: {
        en: 'Published At',
        zh: '发布时间',
      },
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
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
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: {
        en: 'Author',
        zh: '作者',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        // Auto-set publishedAt when publishing
        if (
          operation === 'update' &&
          data.status === 'published' &&
          originalDoc?.status !== 'published'
        ) {
          data.publishedAt = new Date()
        }
        return data
      },
    ],
  },
}
