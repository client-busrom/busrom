/**
 * BrandValue Global - Brand Value Configuration
 *
 * 用途: 首页品牌价值区块配置
 * - 5个价值项 (Param1, Param2, Slogan, Value, Vision)
 * - 每个价值项包含标题、描述、图片
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const BrandValue: GlobalConfig = {
  slug: 'brand-value',
  label: {
    en: 'Brand Value',
    zh: '品牌价值',
  },
  admin: {
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
  // versions: true,
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
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Main Title & Subtitle
    {
      name: 'title',
      type: 'textarea',
      label: {
        en: 'Title',
        zh: '主标题',
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

    // ==================================================================
    // Value Item 01 - Param 1
    // ==================================================================
    {
      name: 'param1Title',
      type: 'textarea',
      label: {
        en: 'Param 1 - Title',
        zh: 'Param 1 - 标题',
      },
      localized: true,
    },
    {
      name: 'param1Description',
      type: 'textarea',
      label: {
        en: 'Param 1 - Description',
        zh: 'Param 1 - 描述',
      },
      localized: true,
    },
    {
      name: 'param1Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Param 1 - Image',
        zh: 'Param 1 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Value Item 02 - Param 2
    // ==================================================================
    {
      name: 'param2Title',
      type: 'textarea',
      label: {
        en: 'Param 2 - Title',
        zh: 'Param 2 - 标题',
      },
      localized: true,
    },
    {
      name: 'param2Description',
      type: 'textarea',
      label: {
        en: 'Param 2 - Description',
        zh: 'Param 2 - 描述',
      },
      localized: true,
    },
    {
      name: 'param2Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Param 2 - Image',
        zh: 'Param 2 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Value Item 03 - Slogan
    // ==================================================================
    {
      name: 'sloganTitle',
      type: 'textarea',
      label: {
        en: 'Slogan - Title',
        zh: 'Slogan - 标题',
      },
      localized: true,
    },
    {
      name: 'sloganDescription',
      type: 'textarea',
      label: {
        en: 'Slogan - Description',
        zh: 'Slogan - 描述',
      },
      localized: true,
    },
    {
      name: 'sloganImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Slogan - Image',
        zh: 'Slogan - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Value Item 04 - Value
    // ==================================================================
    {
      name: 'valueTitle',
      type: 'textarea',
      label: {
        en: 'Value - Title',
        zh: 'Value - 标题',
      },
      localized: true,
    },
    {
      name: 'valueDescription',
      type: 'textarea',
      label: {
        en: 'Value - Description',
        zh: 'Value - 描述',
      },
      localized: true,
    },
    {
      name: 'valueImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Value - Image',
        zh: 'Value - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Value Item 05 - Vision
    // ==================================================================
    {
      name: 'visionTitle',
      type: 'textarea',
      label: {
        en: 'Vision - Title',
        zh: 'Vision - 标题',
      },
      localized: true,
    },
    {
      name: 'visionDescription',
      type: 'textarea',
      label: {
        en: 'Vision - Description',
        zh: 'Vision - 描述',
      },
      localized: true,
    },
    {
      name: 'visionImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Vision - Image',
        zh: 'Vision - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
  ],
}
