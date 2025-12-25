/**
 * BrandAnalysis Global - Brand Analysis Configuration
 *
 * 用途: 首页品牌分析区块配置
 * - 品牌名称分析 (Bus + rom)
 * - 3个中心 (Brand, Project, Service)
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const BrandAnalysis: GlobalConfig = {
  slug: 'brand-analysis',
  label: {
    en: 'Brand Analysis',
    zh: '品牌分析',
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
    // Brand Center
    {
      name: 'brandCenter',
      type: 'group',
      label: {
        en: 'Brand Center',
        zh: '品牌中心',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'largeImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Large Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'smallImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Small Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
      ],
    },
    // Project Center
    {
      name: 'projectCenter',
      type: 'group',
      label: {
        en: 'Project Center',
        zh: '项目中心',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'largeImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Large Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'smallImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Small Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
      ],
    },
    // Service Center
    {
      name: 'serviceCenter',
      type: 'group',
      label: {
        en: 'Service Center',
        zh: '服务中心',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'largeImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Large Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'smallImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Small Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
      ],
    },
  ],
}
