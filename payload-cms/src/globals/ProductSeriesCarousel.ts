/**
 * ProductSeriesCarousel Global - Product Series Carousel Configuration
 *
 * 用途: 首页产品系列轮播区块配置
 * - 10个产品系列轮播
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const ProductSeriesCarousel: GlobalConfig = {
  slug: 'product-series-carousel',
  label: {
    en: 'Product Series Carousel',
    zh: '产品系列轮播',
  },
  admin: {
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
    // Note: Hidden from default nav via CustomNav.tsx
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
    // Carousel Items (Multilingual JSON structure like Keystone)
    {
      name: 'items',
      type: 'json',
      label: {
        en: 'Carousel Items',
        zh: '轮播项',
      },
      admin: {
        components: {
          Field: '@/components/fields/MultilingualCarouselItems',
        },
        description: {
          en: 'Multilingual carousel items. Each language has its own array of items.',
          zh: '多语言轮播项。每种语言有自己的项目数组。',
        },
      },
    },
    // Carousel Settings
    {
      name: 'autoplay',
      type: 'checkbox',
      label: {
        en: 'Autoplay',
        zh: '自动播放',
      },
      defaultValue: true,
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      label: {
        en: 'Autoplay Speed (ms)',
        zh: '自动播放速度 (毫秒)',
      },
      defaultValue: 5000,
      min: 1000,
      max: 10000,
    },
  ],
}
