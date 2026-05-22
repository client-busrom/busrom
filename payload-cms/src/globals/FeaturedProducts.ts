/**
 * FeaturedProducts Global - Featured Products Configuration
 *
 * 用途: 首页精选产品区块配置
 * - 选择和排序产品系列
 * - API自动为每个系列选择3个随机产品
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const FeaturedProducts: GlobalConfig = {
  slug: 'featured-products',
  label: {
    en: 'Featured Products',
    zh: '精选产品',
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

    // ==================================================================
    // 🌐 Localized Content
    // ==================================================================
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
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
    },
    {
      name: 'viewAllButtonText',
      type: 'textarea',
      label: {
        en: 'View All Button Text',
        zh: '"查看全部"按钮文字',
      },
      localized: true,
    },
    {
      name: 'viewAllButtonUrl',
      type: 'text',
      label: {
        en: 'View All Button URL',
        zh: '"查看全部"按钮链接',
      },
      admin: {
        components: {
          Field: '@/components/fields/SmartLinkField',
        },
      },
    },

    // ==================================================================
    // 📊 Product Series Categories (Sortable)
    // ==================================================================
    // Note: Keystone uses SortableProductSeriesField (JSON with sortable IDs)
    // For now, we use relationship array for simplicity
    // TODO: Implement custom sortable field if needed
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'product-series',
      hasMany: true,
      label: {
        en: 'Product Series Categories',
        zh: '产品系列分类',
      },
      admin: {
        description: {
          en: 'Select and order product series. API will automatically return 3 random products per series.',
          zh: '选择并排序产品系列。API将自动为每个系列返回3个随机产品。',
        },
      },
    },
  ],
}
