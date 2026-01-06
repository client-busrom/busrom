/**
 * SimpleCta Global - Simple CTA Configuration
 *
 * 用途: 首页简易行动号召区块配置
 * - 3张图片
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const SimpleCta: GlobalConfig = {
  slug: 'simple-cta',
  label: {
    en: 'Simple CTA',
    zh: '简易CTA',
  },
  admin: {
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
  versions: true,
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // Translation Center
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/GlobalTranslationCenter',
        },
      },
    },
    // Status
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '发布状态',
      },
      defaultValue: 'draft',
      options: [
        { label: 'Draft | 草稿', value: 'draft' },
        { label: 'Published | 已发布', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Content
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
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
    },
    {
      name: 'ctaText',
      type: 'textarea',
      label: {
        en: 'CTA Text',
        zh: '按钮文字',
      },
      localized: true,
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: {
        en: 'CTA Link',
        zh: '按钮链接',
      },
    },

    // ==================================================================
    // Images (3 images)
    // ==================================================================
    {
      name: 'image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 1',
        zh: '图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 2',
        zh: '图片2',
      },
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
      label: {
        en: 'Image 3',
        zh: '图片3',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
  ],
}
