/**
 * Applications Collection - Application Cases/Project Showcases
 *
 * Features:
 * - 24-language support
 * - Scene gallery: multiple scene groups with images
 * - Category support
 * - Soft delete (status: published/draft/archived)
 */

import type { CollectionConfig } from 'payload'


export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: {
    singular: {
      en: 'Application',
      zh: '案例图集',
    },
    plural: {
      en: 'Applications',
      zh: '案例图集',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'category', 'status', 'updatedAt'],
    group: {
      en: 'Media Library',
      zh: '媒体库',
    },
  },
  access: {
    read: ({ req }) => {
      // Public can only see published
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
  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    {
      type: 'tabs',
      tabs: [
        // ==================================================================
        // Tab 1: Basic Info
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
                  en: 'URL-friendly identifier (e.g., "commercial-building-glass-railing")',
                  zh: 'URL友好标识符（例如："commercial-building-glass-railing"）',
                },
              },
            },
            {
              name: 'name',
              type: 'textarea',
              label: {
                en: 'Application Name',
                zh: '应用名称',
              },
              required: true,
              localized: true,
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              label: {
                en: 'Short Description',
                zh: '简短描述',
              },
              localized: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: {
                en: 'Description',
                zh: '详细描述',
              },
              localized: true,
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              label: {
                en: 'Category',
                zh: '分类',
              },
              filterOptions: {
                type: { equals: 'APPLICATION' },
              },
            },
          ],
        },

        // ==================================================================
        // Tab 2: Scene Gallery
        // ==================================================================
        {
          label: {
            en: 'Scene Gallery',
            zh: '场景图集',
          },
          fields: [
            {
              name: 'sceneGallery',
              type: 'array',
              label: {
                en: 'Scene Gallery',
                zh: '场景图集',
              },
              admin: {
                description: {
                  en: 'Manage scene image groups. Each scene can contain multiple images.',
                  zh: '管理场景图片组。每个场景可以包含多张图片。',
                },
              },
              fields: [
                {
                  name: 'sceneName',
                  type: 'textarea',
                  label: {
                    en: 'Scene Name',
                    zh: '场景名称',
                  },
                  localized: true,
                },
                {
                  name: 'images',
                  type: 'relationship',
                  relationTo: 'media',
                  hasMany: true,
                  label: {
                    en: 'Images',
                    zh: '图片',
                  },
                  admin: {
                    description: {
                      en: 'Select multiple images for this scene',
                      zh: '为此场景选择多张图片',
                    },
                    components: {
                      Field: '@/components/fields/MediaPicker',
                    },
                  },
                },
              ],
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
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // 快速保存优化：如果是翻译中心触发的保存，跳过所有额外逻辑
        if (req?.context?.isTranslationSave) return data;
        return data;
      }
    ],
    afterRead: [
      ({ req, doc }) => {
        // 快速保存优化：如果是翻译中心触发的读取，跳过所有额外逻辑
        if (req?.context?.isTranslationSave) return doc;
        return doc;
      }
    ]
  },
}
