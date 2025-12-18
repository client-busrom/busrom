/**
 * OemOdm Global - OEM/ODM Services Configuration
 *
 * 用途: 首页OEM/ODM区块配置
 * - OEM部分: 标题、背景图、主图、2行描述
 * - ODM部分: 标题、背景图、主图、2行描述
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const OemOdm: GlobalConfig = {
  slug: 'oem-odm',
  label: {
    en: 'OEM/ODM',
    zh: 'OEM/ODM服务',
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
    // OEM 部分
    // ==================================================================
    {
      name: 'oemTitle',
      type: 'text',
      label: {
        en: 'OEM - Title',
        zh: 'OEM - 标题',
      },
      localized: true,
      admin: {
        description: '例如: "OEM"',
      },
    },
    {
      name: 'oemBgImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'OEM - Background Image',
        zh: 'OEM - 背景图',
      },
      admin: {
        description: 'OEM部分的背景图片',
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'oemImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'OEM - Main Image',
        zh: 'OEM - 主图',
      },
      admin: {
        description: 'OEM部分的主图片',
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'oemDescription1',
      type: 'textarea',
      label: {
        en: 'OEM - Description Line 1',
        zh: 'OEM - 描述第1行',
      },
      localized: true,
      admin: {
        description: '例如: "At Busrom, we work closely with designers, retailers..."',
      },
    },
    {
      name: 'oemDescription2',
      type: 'textarea',
      label: {
        en: 'OEM - Description Line 2',
        zh: 'OEM - 描述第2行',
      },
      localized: true,
      admin: {
        description: '例如: "Ready to turn your concept into a producible product?..."',
      },
    },

    // ==================================================================
    // ODM 部分
    // ==================================================================
    {
      name: 'odmTitle',
      type: 'text',
      label: {
        en: 'ODM - Title',
        zh: 'ODM - 标题',
      },
      localized: true,
      admin: {
        description: '例如: "ODM"',
      },
    },
    {
      name: 'odmBgImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'ODM - Background Image',
        zh: 'ODM - 背景图',
      },
      admin: {
        description: 'ODM部分的背景图片',
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'odmImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'ODM - Main Image',
        zh: 'ODM - 主图',
      },
      admin: {
        description: 'ODM部分的主图片',
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'odmDescription1',
      type: 'textarea',
      label: {
        en: 'ODM - Description Line 1',
        zh: 'ODM - 描述第1行',
      },
      localized: true,
      admin: {
        description: '例如: "Fully Customized Structure & Size & Color"',
      },
    },
    {
      name: 'odmDescription2',
      type: 'textarea',
      label: {
        en: 'ODM - Description Line 2',
        zh: 'ODM - 描述第2行',
      },
      localized: true,
      admin: {
        description: '例如: "Complete Solution - Just The Way You Want Them"',
      },
    },
  ],
}
