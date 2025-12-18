/**
 * SeriesIntroItems Collection
 *
 * Series Introduction Items for homepage
 * Migrated from Keystone SeriesIntro schema
 *
 * Features:
 * - Individual items, each linking to a ProductSeries
 * - title, description (localized)
 * - images based on MediaTags (随机选择)
 * - Native localization (24 languages)
 * - Draft-Publish workflow
 */

import type { CollectionConfig } from 'payload'

export const SeriesIntroItems: CollectionConfig = {
  slug: 'series-intro-items',
  labels: {
    singular: {
      en: 'Series Intro Item',
      zh: '系列介绍项',
    },
    plural: {
      en: 'Series Intro Items',
      zh: '系列介绍项',
    },
  },
  admin: {
    useAsTitle: 'internalLabel',
    defaultColumns: ['internalLabel', 'productSeries', 'status'],
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    afterRead: [
      async ({ doc, req: { payload } }) => {
        const { populateSeriesImages } = await import('@/utilities/getSeriesImages')
        return populateSeriesImages(doc, payload)
      },
    ],
  },
  fields: [
    // Translation Center
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
    // ==================================================================
    // 📝 Internal Label
    // ==================================================================
    {
      name: 'internalLabel',
      type: 'text',
      required: true,
      label: 'Internal Label | 内部标识',
      admin: {
        description: 'Internal identifier for this series intro item',
      },
    },

    // ==================================================================
    // 🔗 Product Series Relationship
    // ==================================================================
    {
      name: 'productSeries',
      type: 'relationship',
      relationTo: 'product-series',
      label: {
        en: 'Product Series',
        zh: '产品系列',
      },
      admin: {
        description: 'Link to a product series',
      },
    },

    // ==================================================================
    // 🌐 Localized Content
    // ==================================================================
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: {
        en: 'Title',
        zh: '标题',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Description',
        zh: '描述',
      },
    },

    // ==================================================================
    // 🖼️ Images (Tag-Based Random Selection or Manual)
    // ==================================================================
    {
      name: 'images',
      type: 'json',
      label: {
        en: 'Images',
        zh: '图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/TagBasedRandomImages',
        },
        description: 'Choose manual selection (up to 5 images) or auto random by category/tags',
      },
    },

    // ==================================================================
    // 📊 Status
    // ==================================================================
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Published | 已发布', value: 'published' },
        { label: 'Draft | 草稿', value: 'draft' },
      ],
      label: 'Status | 状态',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
