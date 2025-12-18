/**
 * BrandAdvantages Global - Brand Advantages Configuration
 *
 * 用途: 首页品牌优势区块配置
 * - 9个品牌优势，每个有对应的 lucide-react 图标
 * - 1张主图片
 * - 支持24语言（使用 MultiLocaleField 自定义组件）
 */

import type { GlobalConfig } from 'payload'

export const BrandAdvantages: GlobalConfig = {
  slug: 'brand-advantages',
  label: {
    en: 'Brand Advantages',
    zh: '品牌优势',
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
    // Main Image
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Main Image',
        zh: '主图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },

    // ==================================================================
    // Advantage 01
    // ==================================================================
    {
      name: 'advantage01Text',
      type: 'text',
      label: {
        en: 'Advantage 01 - Text',
        zh: '优势01 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage01Icon',
      type: 'text',
      label: {
        en: 'Advantage 01 - Icon',
        zh: '优势01 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称，例如: Sparkles, Target, Component',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 02
    // ==================================================================
    {
      name: 'advantage02Text',
      type: 'text',
      label: {
        en: 'Advantage 02 - Text',
        zh: '优势02 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage02Icon',
      type: 'text',
      label: {
        en: 'Advantage 02 - Icon',
        zh: '优势02 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 03
    // ==================================================================
    {
      name: 'advantage03Text',
      type: 'text',
      label: {
        en: 'Advantage 03 - Text',
        zh: '优势03 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage03Icon',
      type: 'text',
      label: {
        en: 'Advantage 03 - Icon',
        zh: '优势03 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 04
    // ==================================================================
    {
      name: 'advantage04Text',
      type: 'text',
      label: {
        en: 'Advantage 04 - Text',
        zh: '优势04 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage04Icon',
      type: 'text',
      label: {
        en: 'Advantage 04 - Icon',
        zh: '优势04 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 05
    // ==================================================================
    {
      name: 'advantage05Text',
      type: 'text',
      label: {
        en: 'Advantage 05 - Text',
        zh: '优势05 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage05Icon',
      type: 'text',
      label: {
        en: 'Advantage 05 - Icon',
        zh: '优势05 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 06
    // ==================================================================
    {
      name: 'advantage06Text',
      type: 'text',
      label: {
        en: 'Advantage 06 - Text',
        zh: '优势06 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage06Icon',
      type: 'text',
      label: {
        en: 'Advantage 06 - Icon',
        zh: '优势06 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 07
    // ==================================================================
    {
      name: 'advantage07Text',
      type: 'text',
      label: {
        en: 'Advantage 07 - Text',
        zh: '优势07 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage07Icon',
      type: 'text',
      label: {
        en: 'Advantage 07 - Icon',
        zh: '优势07 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 08
    // ==================================================================
    {
      name: 'advantage08Text',
      type: 'text',
      label: {
        en: 'Advantage 08 - Text',
        zh: '优势08 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage08Icon',
      type: 'text',
      label: {
        en: 'Advantage 08 - Icon',
        zh: '优势08 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },

    // ==================================================================
    // Advantage 09
    // ==================================================================
    {
      name: 'advantage09Text',
      type: 'text',
      label: {
        en: 'Advantage 09 - Text',
        zh: '优势09 - 文字',
      },
      localized: true,
    },
    {
      name: 'advantage09Icon',
      type: 'text',
      label: {
        en: 'Advantage 09 - Icon',
        zh: '优势09 - 图标',
      },
      admin: {
        description: 'Lucide React 图标名称',
      },
      defaultValue: 'Sparkles',
    },
  ],
}
