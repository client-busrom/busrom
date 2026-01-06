/**
 * WhyChooseBusrom Global - Why Choose Busrom Configuration
 *
 * 用途: 首页"为什么选择Busrom"区块配置
 * - 5个理由
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const WhyChooseBusrom: GlobalConfig = {
  slug: 'why-choose-busrom',
  label: {
    en: 'Why Choose Busrom',
    zh: '为什么选择Busrom',
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
    // Title
    {
      name: 'title',
      type: 'textarea',
      label: {
        en: 'Title',
        zh: '标题',
      },
      localized: true,
    },
    // Title 2
    {
      name: 'title2',
      type: 'textarea',
      label: {
        en: 'Title 2',
        zh: '标题2',
      },
      localized: true,
    },

    // ==================================================================
    // View More Button
    // ==================================================================
    {
      name: 'viewMoreButtonText',
      type: 'textarea',
      label: {
        en: 'View More Button Text',
        zh: '查看更多按钮文字',
      },
      localized: true,
      admin: {
        description: {
          en: 'e.g.: "VIEW MORE INFORMATION"',
          zh: '例如: "VIEW MORE INFORMATION"',
        },
      },
    },
    {
      name: 'viewMoreButtonUrl',
      type: 'text',
      label: {
        en: 'View More Button URL',
        zh: '查看更多按钮链接',
      },
      admin: {
        description: {
          en: 'e.g.: "/about-us" or "https://example.com/about"',
          zh: '例如: "/about-us" 或 "https://example.com/about"',
        },
      },
    },

    // ==================================================================
    // Reason 01
    // ==================================================================
    {
      name: 'reason01Title',
      type: 'textarea',
      label: {
        en: 'Reason 01 - Title',
        zh: '理由01 - 标题',
      },
      localized: true,
    },
    {
      name: 'reason01Description',
      type: 'textarea',
      label: {
        en: 'Reason 01 - Description',
        zh: '理由01 - 描述',
      },
      localized: true,
    },
    {
      name: 'reason01Icon',
      type: 'text',
      label: {
        en: 'Reason 01 - Icon',
        zh: '理由01 - 图标',
      },
      admin: {
        description: {
          en: 'Lucide React icon name',
          zh: 'Lucide React 图标名称',
        },
      },
    },
    {
      name: 'reason01Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Reason 01 - Image',
        zh: '理由01 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Reason 02
    // ==================================================================
    {
      name: 'reason02Title',
      type: 'textarea',
      label: {
        en: 'Reason 02 - Title',
        zh: '理由02 - 标题',
      },
      localized: true,
    },
    {
      name: 'reason02Description',
      type: 'textarea',
      label: {
        en: 'Reason 02 - Description',
        zh: '理由02 - 描述',
      },
      localized: true,
    },
    {
      name: 'reason02Icon',
      type: 'text',
      label: {
        en: 'Reason 02 - Icon',
        zh: '理由02 - 图标',
      },
      admin: {
        description: {
          en: 'Lucide React icon name',
          zh: 'Lucide React 图标名称',
        },
      },
    },
    {
      name: 'reason02Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Reason 02 - Image',
        zh: '理由02 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Reason 03
    // ==================================================================
    {
      name: 'reason03Title',
      type: 'textarea',
      label: {
        en: 'Reason 03 - Title',
        zh: '理由03 - 标题',
      },
      localized: true,
    },
    {
      name: 'reason03Description',
      type: 'textarea',
      label: {
        en: 'Reason 03 - Description',
        zh: '理由03 - 描述',
      },
      localized: true,
    },
    {
      name: 'reason03Icon',
      type: 'text',
      label: {
        en: 'Reason 03 - Icon',
        zh: '理由03 - 图标',
      },
      admin: {
        description: {
          en: 'Lucide React icon name',
          zh: 'Lucide React 图标名称',
        },
      },
    },
    {
      name: 'reason03Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Reason 03 - Image',
        zh: '理由03 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Reason 04
    // ==================================================================
    {
      name: 'reason04Title',
      type: 'textarea',
      label: {
        en: 'Reason 04 - Title',
        zh: '理由04 - 标题',
      },
      localized: true,
    },
    {
      name: 'reason04Description',
      type: 'textarea',
      label: {
        en: 'Reason 04 - Description',
        zh: '理由04 - 描述',
      },
      localized: true,
    },
    {
      name: 'reason04Icon',
      type: 'text',
      label: {
        en: 'Reason 04 - Icon',
        zh: '理由04 - 图标',
      },
      admin: {
        description: {
          en: 'Lucide React icon name',
          zh: 'Lucide React 图标名称',
        },
      },
    },
    {
      name: 'reason04Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Reason 04 - Image',
        zh: '理由04 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Reason 05
    // ==================================================================
    {
      name: 'reason05Title',
      type: 'textarea',
      label: {
        en: 'Reason 05 - Title',
        zh: '理由05 - 标题',
      },
      localized: true,
    },
    {
      name: 'reason05Description',
      type: 'textarea',
      label: {
        en: 'Reason 05 - Description',
        zh: '理由05 - 描述',
      },
      localized: true,
    },
    {
      name: 'reason05Icon',
      type: 'text',
      label: {
        en: 'Reason 05 - Icon',
        zh: '理由05 - 图标',
      },
      admin: {
        description: {
          en: 'Lucide React icon name',
          zh: 'Lucide React 图标名称',
        },
      },
    },
    {
      name: 'reason05Image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Reason 05 - Image',
        zh: '理由05 - 图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
  ],
}
