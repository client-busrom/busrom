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
      zh: '应用案例',
    },
    plural: {
      en: 'Applications',
      zh: '应用案例',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'category', 'status', 'updatedAt'],
    group: {
      en: 'Content',
      zh: '内容管理',
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
                description: 'URL-friendly identifier (e.g., "commercial-building-glass-railing")',
              },
            },
            {
              name: 'name',
              type: 'text',
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
                description: 'Manage scene image groups. Each scene can contain multiple images.',
              },
              fields: [
                {
                  name: 'sceneName',
                  type: 'text',
                  label: {
                    en: 'Scene Name',
                    zh: '场景名称',
                  },
                  required: true,
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
                    description: 'Select multiple images for this scene',
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
