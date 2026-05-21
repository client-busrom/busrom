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
      zh: '首页首屏轮播图',
    },
    plural: {
      en: 'Hero Banner Items',
      zh: '首页首屏轮播图',
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
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // Translation Center
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
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
      label: {
        en: 'Internal Label',
        zh: '内部标识',
      },
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
        en: 'Content Title',
        zh: '内容标题',
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
        en: 'Title',
        zh: '标题',
      },
    },
    {
      name: 'feature2',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Subtitle',
        zh: '副标题',
      },
    },
    {
      name: 'feature3',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Display 1',
        zh: '展示1',
      },
    },
    {
      name: 'feature4',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Display 2',
        zh: '展示2',
      },
    },
    {
      name: 'feature5',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Display 3',
        zh: '展示3',
      },
    },

    // ==================================================================
    // 🖼️ Images (根据 order 条件显示)
    // ==================================================================
    // 图片使用情况 (order 1-9 对应 Banner 1-9):
    // order 1 (Banner1): image1 ✅, image2 ✅, image3 ✅, image4 ❌
    // order 2 (Banner2): image1 ✅, image2 ✅, image3 ✅, image4 ❌
    // order 3 (Banner3): image1 ❌, image2 ✅, image3 ✅, image4 ✅
    // order 4 (Banner4): image1 ❌, image2 ✅, image3 ✅, image4 ✅
    // order 5 (Banner5): image1 ❌, image2 ✅, image3 ✅, image4 ✅
    // order 6 (Banner6): image1 ✅, image2 ✅, image3 ❌, image4 ❌
    // order 7 (Banner7): image1 ✅, image2 ✅, image3 ✅, image4 ✅
    // order 8 (Banner8): image1 ✅, image2 ✅, image3 ✅, image4 ✅
    // order 9 (Banner9): image1 ✅, image2 ✅, image3 ❌, image4 ❌
    {
      name: 'image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 1 (Background)',
        zh: '图片1（背景图）',
      },
      admin: {
        description: {
          en: 'Background image for Banner 1,2,6,7,8,9',
          zh: '用于 Banner 1,2,6,7,8,9 的背景图',
        },
        components: {
          Field: '@/components/fields/HeroBannerImagePicker',
        },
        // 显示条件: order 为 1,2,6,7,8,9 时显示
        condition: (data) => {
          const order = data?.order
          return [1, 2, 6, 7, 8, 9].includes(order)
        },
      },
    },
    {
      name: 'image1CropData',
      type: 'json',
      label: {
        en: 'Image 1 Crop Data',
        zh: '图片1裁剪数据',
      },
      admin: {
        hidden: true,
        condition: (data) => {
          const order = data?.order
          return [1, 2, 6, 7, 8, 9].includes(order)
        },
      },
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 2 (Decoration 1)',
        zh: '图片2（装饰图1）',
      },
      admin: {
        description: {
          en: 'Decoration image used in all banners',
          zh: '所有 Banner 都使用的装饰图',
        },
        components: {
          Field: '@/components/fields/HeroBannerImagePicker',
        },
        // 所有 banner 都使用 image2，无需条件
      },
    },
    {
      name: 'image2CropData',
      type: 'json',
      label: {
        en: 'Image 2 Crop Data',
        zh: '图片2裁剪数据',
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'image3',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 3 (Decoration 2)',
        zh: '图片3（装饰图2）',
      },
      admin: {
        components: {
          Field: '@/components/fields/HeroBannerImagePicker',
        },
        // 显示条件: order 为 1,2,3,4,5,7,8 时显示 (排除 6,9)
        condition: (data) => {
          const order = data?.order
          return ![6, 9].includes(order)
        },
      },
    },
    {
      name: 'image3CropData',
      type: 'json',
      label: {
        en: 'Image 3 Crop Data',
        zh: '图片3裁剪数据',
      },
      admin: {
        hidden: true,
        condition: (data) => {
          const order = data?.order
          return ![6, 9].includes(order)
        },
      },
    },
    {
      name: 'image4',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 4 (Decoration 3)',
        zh: '图片4（装饰图3）',
      },
      admin: {
        components: {
          Field: '@/components/fields/HeroBannerImagePicker',
        },
        // 显示条件: order 为 3,4,5,7,8 时显示
        condition: (data) => {
          const order = data?.order
          return [3, 4, 5, 7, 8].includes(order)
        },
      },
    },
    {
      name: 'image4CropData',
      type: 'json',
      label: {
        en: 'Image 4 Crop Data',
        zh: '图片4裁剪数据',
      },
      admin: {
        hidden: true,
        condition: (data) => {
          const order = data?.order
          return [3, 4, 5, 7, 8].includes(order)
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
      label: {
        en: 'Display Order',
        zh: '显示顺序',
      },
      admin: {
        position: 'sidebar',
        disableListColumn: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
      ],
      label: {
        en: 'Status',
        zh: '状态',
      },
      admin: {
        position: 'sidebar',
        disableListColumn: true,
      },
    },
  ],
}
