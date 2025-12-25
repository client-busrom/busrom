/**
 * QuoteSteps Global - Quote Steps Configuration
 *
 * 用途: 首页报价流程步骤区块配置
 * - 标题、副标题、描述
 * - 5个步骤，每个步骤包含文字和图片
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const QuoteSteps: GlobalConfig = {
  slug: 'quote-steps',
  label: {
    en: 'Quote Steps',
    zh: '报价五步曲',
  },
  admin: {
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
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
    // ==================================================================
    // Header Section
    // ==================================================================
    {
      name: 'headerTitle',
      type: 'text',
      label: {
        en: 'Header - Title',
        zh: '标题 - 主标题',
      },
      localized: true,
      admin: {
        description: {
          en: 'e.g.: "Design Project Solutions"',
          zh: '例如: "Design Project Solutions"',
        },
      },
    },
    {
      name: 'headerTitle2',
      type: 'text',
      label: {
        en: 'Header - Title 2',
        zh: '标题 - 副标题',
      },
      localized: true,
      admin: {
        description: {
          en: 'e.g.: "Just Easy 5 Steps"',
          zh: '例如: "Just Easy 5 Steps"',
        },
      },
    },
    {
      name: 'headerSubtitle',
      type: 'text',
      label: {
        en: 'Header - Subtitle',
        zh: '标题 - 小标题',
      },
      localized: true,
    },
    {
      name: 'headerDescription',
      type: 'textarea',
      label: {
        en: 'Header - Description',
        zh: '标题 - 描述',
      },
      localized: true,
    },

    // ==================================================================
    // Step 01
    // ==================================================================
    {
      name: 'step01Text',
      type: 'text',
      label: {
        en: 'Step 01 - Text',
        zh: '步骤01 - 文字',
      },
      localized: true,
    },
    {
      name: 'step01Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Step 01 - Image',
        zh: '步骤01 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Step 02
    // ==================================================================
    {
      name: 'step02Text',
      type: 'text',
      label: {
        en: 'Step 02 - Text',
        zh: '步骤02 - 文字',
      },
      localized: true,
    },
    {
      name: 'step02Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Step 02 - Image',
        zh: '步骤02 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Step 03
    // ==================================================================
    {
      name: 'step03Text',
      type: 'text',
      label: {
        en: 'Step 03 - Text',
        zh: '步骤03 - 文字',
      },
      localized: true,
    },
    {
      name: 'step03Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Step 03 - Image',
        zh: '步骤03 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Step 04
    // ==================================================================
    {
      name: 'step04Text',
      type: 'text',
      label: {
        en: 'Step 04 - Text',
        zh: '步骤04 - 文字',
      },
      localized: true,
    },
    {
      name: 'step04Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Step 04 - Image',
        zh: '步骤04 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Step 05
    // ==================================================================
    {
      name: 'step05Text',
      type: 'text',
      label: {
        en: 'Step 05 - Text',
        zh: '步骤05 - 文字',
      },
      localized: true,
    },
    {
      name: 'step05Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Step 05 - Image',
        zh: '步骤05 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
  ],
}
