/**
 * HeroBannerItems Collection
 *
 * Hero Banner Carousel Items for homepage
 * Migrated from Keystone HeroBannerItem schema
 *
 * Features:
 * - Multiple items (max 9)
 * - Each item has: title, 5 features, images
 * - Native localization (24 languages)
 * - Draft-Publish workflow
 */

import type { CollectionConfig } from 'payload'

export const HeroBannerItems: CollectionConfig = {
  slug: 'hero-banner-items',
  labels: {
    singular: {
      en: 'Hero Banner Item',
      zh: '轮播图项目',
    },
    plural: {
      en: 'Hero Banner Items',
      zh: '轮播图项目',
    },
  },
  admin: {
    useAsTitle: 'internalLabel',
    defaultColumns: ['internalLabel', 'order', 'status'],
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },
  // 版本控制 - 保留修改历史

  versions: {
    maxPerDoc: 10,
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
        description: {
          en: 'Internal identifier for this banner item (e.g., "Banner 1 - Glass Standoff")',
          zh: '此轮播项的内部标识（例如："Banner 1 - 玻璃支架"）',
        },
      },
    },

    // ==================================================================
    // 🌐 Localized Content
    // ==================================================================
    {
      name: 'title',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Title',
        zh: '标题',
      },
    },

    // ==================================================================
    // ⭐ Features (固定5条) - 使用 textarea 支持多行输入
    // ==================================================================
    {
      name: 'feature1',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Feature 1',
        zh: '特点1',
      },
    },
    {
      name: 'feature2',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Feature 2',
        zh: '特点2',
      },
    },
    {
      name: 'feature3',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Feature 3',
        zh: '特点3',
      },
    },
    {
      name: 'feature4',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Feature 4',
        zh: '特点4',
      },
    },
    {
      name: 'feature5',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Feature 5',
        zh: '特点5',
      },
    },

    // ==================================================================
    // 🖼️ Images (固定4张)
    // ==================================================================
    {
      name: 'image1',
      type: 'upload',
      relationTo: 'media',
      label: 'Image 1 | 图片1',
      admin: {
        description: {
          en: 'Select an image',
          zh: '选择一张图片',
        },
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      label: 'Image 2 | 图片2',
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'image3',
      type: 'upload',
      relationTo: 'media',
      label: 'Image 3 | 图片3',
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'image4',
      type: 'upload',
      relationTo: 'media',
      label: 'Image 4 | 图片4',
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // 🔗 CTA Button
    // ==================================================================
    {
      name: 'ctaButton',
      type: 'group',
      label: {
        en: 'CTA Button',
        zh: '行动按钮',
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Button Text',
            zh: '按钮文本',
          },
        },
        {
          name: 'link',
          type: 'text',
          label: {
            en: 'Button Link',
            zh: '按钮链接',
          },
        },
      ],
    },

    // ==================================================================
    // 📊 Status & Order
    // ==================================================================
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order | 显示顺序',
      admin: {
        position: 'sidebar',
      },
    },
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
