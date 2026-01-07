/**
 * Blogs Collection - Blog Posts/Articles
 *
 * Features:
 * - 24-language support using Payload's native localization
 * - Rich text content with Lexical editor
 * - Category support
 * - Featured image
 * - SEO fields
 * - Soft delete (status: published/draft/archived)
 * - Tabbed admin interface
 */

import type { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  labels: {
    singular: {
      en: 'Blog',
      zh: '博客',
    },
    plural: {
      en: 'Blogs',
      zh: '博客',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'status', 'author', 'publishedAt', 'updatedAt'],
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
  versions: {
    maxPerDoc: 10,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ==================================================================
        // Tab 1: Basic Information
        // ==================================================================
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
                en: 'Slug (URL ID)',
                zh: 'Slug (URL标识)',
              },
              required: true,
              unique: true,
              admin: {
                description: {
                  en: 'URL-friendly identifier (e.g., "how-to-install-glass-standoff")',
                  zh: 'URL友好标识符（例如："how-to-install-glass-standoff"）',
                },
              },
            },
            {
              name: 'title',
              type: 'textarea',
              label: {
                en: 'Blog Title',
                zh: '博客标题',
              },
              required: true,
              localized: true,
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: {
                en: 'Excerpt',
                zh: '摘要',
              },
              localized: true,
              admin: {
                description: {
                  en: 'Short summary for previews and SEO',
                  zh: '用于预览和SEO的简短摘要',
                },
              },
            },
            {
              name: 'author',
              type: 'text',
              label: {
                en: 'Author',
                zh: '作者',
              },
              defaultValue: 'Busrom Team',
            },
          ],
        },

        // ==================================================================
        // Tab 2: Content
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

        // ==================================================================
        // Tab 3: Media & Categories
        // ==================================================================
        {
          label: {
            en: 'Media & Categories',
            zh: '媒体和分类',
          },
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Cover Image',
                zh: '封面图片',
              },
              admin: {
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: {
                en: 'Categories',
                zh: '分类',
              },
              filterOptions: {
                type: { equals: 'BLOG' },
              },
              admin: {
                description: {
                  en: 'Select blog categories',
                  zh: '选择博客分类',
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
  ],
  timestamps: true,
}
