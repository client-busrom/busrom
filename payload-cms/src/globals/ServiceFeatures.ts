/**
 * ServiceFeatures Global - Service Features Configuration
 *
 * 用途: 首页"Premium Architectural Glass Hardware"区块配置
 * - 5个服务特点
 * - 每个特点包含标题、短标题、描述、多张图片
 * - 图片数量: [4, 2, 6, 2, 2]
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const ServiceFeatures: GlobalConfig = {
  slug: 'service-features',
  label: {
    en: 'Service Features',
    zh: '服务特点配置',
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
    // Main Title & Subtitle
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        zh: '主标题',
      },
      localized: true,
      admin: {
        description: '例如: "Premium Architectural Glass Hardware"',
      },
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
    // Feature 01 (4 images)
    // ==================================================================
    {
      name: 'feature01Title',
      type: 'text',
      label: {
        en: 'Feature 01 - Title',
        zh: '特点01 - 标题',
      },
      localized: true,
      admin: {
        description: '例如: "Any Size, Any Structure, Any Shape"',
      },
    },
    {
      name: 'feature01ShortTitle',
      type: 'text',
      label: {
        en: 'Feature 01 - Short Title',
        zh: '特点01 - 短标题',
      },
      localized: true,
      admin: {
        description: '例如: "Any Size"',
      },
    },
    {
      name: 'feature01Description',
      type: 'textarea',
      label: {
        en: 'Feature 01 - Description',
        zh: '特点01 - 描述',
      },
      localized: true,
    },
    {
      name: 'feature01Image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 01 - Image 1',
        zh: '特点01 - 图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature01Image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 01 - Image 2',
        zh: '特点01 - 图片2',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature01Image3',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 01 - Image 3',
        zh: '特点01 - 图片3',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature01Image4',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 01 - Image 4',
        zh: '特点01 - 图片4',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Feature 02 (2 images)
    // ==================================================================
    {
      name: 'feature02Title',
      type: 'text',
      label: {
        en: 'Feature 02 - Title',
        zh: '特点02 - 标题',
      },
      localized: true,
    },
    {
      name: 'feature02ShortTitle',
      type: 'text',
      label: {
        en: 'Feature 02 - Short Title',
        zh: '特点02 - 短标题',
      },
      localized: true,
    },
    {
      name: 'feature02Description',
      type: 'textarea',
      label: {
        en: 'Feature 02 - Description',
        zh: '特点02 - 描述',
      },
      localized: true,
    },
    {
      name: 'feature02Image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 02 - Image 1',
        zh: '特点02 - 图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature02Image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 02 - Image 2',
        zh: '特点02 - 图片2',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Feature 03 (6 images)
    // ==================================================================
    {
      name: 'feature03Title',
      type: 'text',
      label: {
        en: 'Feature 03 - Title',
        zh: '特点03 - 标题',
      },
      localized: true,
    },
    {
      name: 'feature03ShortTitle',
      type: 'text',
      label: {
        en: 'Feature 03 - Short Title',
        zh: '特点03 - 短标题',
      },
      localized: true,
    },
    {
      name: 'feature03Description',
      type: 'textarea',
      label: {
        en: 'Feature 03 - Description',
        zh: '特点03 - 描述',
      },
      localized: true,
    },
    {
      name: 'feature03Image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 03 - Image 1',
        zh: '特点03 - 图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature03Image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 03 - Image 2',
        zh: '特点03 - 图片2',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature03Image3',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 03 - Image 3',
        zh: '特点03 - 图片3',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature03Image4',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 03 - Image 4',
        zh: '特点03 - 图片4',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature03Image5',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 03 - Image 5',
        zh: '特点03 - 图片5',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature03Image6',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 03 - Image 6',
        zh: '特点03 - 图片6',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Feature 04 (2 images)
    // ==================================================================
    {
      name: 'feature04Title',
      type: 'text',
      label: {
        en: 'Feature 04 - Title',
        zh: '特点04 - 标题',
      },
      localized: true,
    },
    {
      name: 'feature04ShortTitle',
      type: 'text',
      label: {
        en: 'Feature 04 - Short Title',
        zh: '特点04 - 短标题',
      },
      localized: true,
    },
    {
      name: 'feature04Description',
      type: 'textarea',
      label: {
        en: 'Feature 04 - Description',
        zh: '特点04 - 描述',
      },
      localized: true,
    },
    {
      name: 'feature04Image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 04 - Image 1',
        zh: '特点04 - 图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature04Image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 04 - Image 2',
        zh: '特点04 - 图片2',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Feature 05 (2 images)
    // ==================================================================
    {
      name: 'feature05Title',
      type: 'text',
      label: {
        en: 'Feature 05 - Title',
        zh: '特点05 - 标题',
      },
      localized: true,
    },
    {
      name: 'feature05ShortTitle',
      type: 'text',
      label: {
        en: 'Feature 05 - Short Title',
        zh: '特点05 - 短标题',
      },
      localized: true,
    },
    {
      name: 'feature05Description',
      type: 'textarea',
      label: {
        en: 'Feature 05 - Description',
        zh: '特点05 - 描述',
      },
      localized: true,
    },
    {
      name: 'feature05Image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 05 - Image 1',
        zh: '特点05 - 图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'feature05Image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Feature 05 - Image 2',
        zh: '特点05 - 图片2',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
  ],
}
