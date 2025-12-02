/**
 * BrandAdvantages Model - Brand Advantages Configuration (品牌优势配置)
 *
 * 用途: 首页品牌优势区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Exactly 9 advantages (fixed, cannot add/remove)
 * - Each advantage has a lucide-react icon name
 * - One main image
 * - Multilingual support (24 languages)
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  json,
  text,
  select,
  timestamp,
} from '@keystone-6/core/fields'

export const BrandAdvantages = list({
  graphql: {
    plural: 'BrandAdvantagesConfigs',
  },
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      defaultValue: 'Brand Advantages Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 9个品牌优势
    // ==================================================================

    advantage1: json({
      label: 'Advantage 1 (优势1)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Performance & Innovation & Refined Design"',
      },
    }),

    icon1: text({
      label: 'Advantage 1 - Icon (优势1图标)',
      defaultValue: 'Sparkles',
      ui: {
        description: 'Lucide React 图标名称，例如: Sparkles',
      },
    }),

    advantage2: json({
      label: 'Advantage 2 (优势2)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Ultra Pursue"',
      },
    }),

    icon2: text({
      label: 'Advantage 2 - Icon (优势2图标)',
      defaultValue: 'Target',
      ui: {
        description: 'Lucide React 图标名称，例如: Target',
      },
    }),

    advantage3: json({
      label: 'Advantage 3 (优势3)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Carefully Developed Structure & Parts"',
      },
    }),

    icon3: text({
      label: 'Advantage 3 - Icon (优势3图标)',
      defaultValue: 'Component',
      ui: {
        description: 'Lucide React 图标名称，例如: Component',
      },
    }),

    advantage4: json({
      label: 'Advantage 4 (优势4)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Strictly Selected Aviation-grade Materials"',
      },
    }),

    icon4: text({
      label: 'Advantage 4 - Icon (优势4图标)',
      defaultValue: 'ShieldCheck',
      ui: {
        description: 'Lucide React 图标名称，例如: ShieldCheck',
      },
    }),

    advantage5: json({
      label: 'Advantage 5 (优势5)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Precision Performance & Premium Finishes"',
      },
    }),

    icon5: text({
      label: 'Advantage 5 - Icon (优势5图标)',
      defaultValue: 'Gauge',
      ui: {
        description: 'Lucide React 图标名称，例如: Gauge',
      },
    }),

    advantage6: json({
      label: 'Advantage 6 (优势6)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Clean Aesthetics & Hidden Fixings"',
      },
    }),

    icon6: text({
      label: 'Advantage 6 - Icon (优势6图标)',
      defaultValue: 'EyeOff',
      ui: {
        description: 'Lucide React 图标名称，例如: EyeOff',
      },
    }),

    advantage7: json({
      label: 'Advantage 7 (优势7)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "IP-rated Components and Water or Electrical Separation for Wet Areas"',
      },
    }),

    icon7: text({
      label: 'Advantage 7 - Icon (优势7图标)',
      defaultValue: 'Waves',
      ui: {
        description: 'Lucide React 图标名称，例如: Waves',
      },
    }),

    advantage8: json({
      label: 'Advantage 8 (优势8)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Smart-Ready Integration"',
      },
    }),

    icon8: text({
      label: 'Advantage 8 - Icon (优势8图标)',
      defaultValue: 'Cpu',
      ui: {
        description: 'Lucide React 图标名称，例如: Cpu',
      },
    }),

    advantage9: json({
      label: 'Advantage 9 (优势9)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "From Single-unit Orders To OEM/ODM"',
      },
    }),

    icon9: text({
      label: 'Advantage 9 - Icon (优势9图标)',
      defaultValue: 'Factory',
      ui: {
        description: 'Lucide React 图标名称，例如: Factory',
      },
    }),

    // ==================================================================
    // 🖼️ 主图片
    // ==================================================================

    /**
     * Main Image (主图片)
     */
    image: json({
      label: 'Main Image (主图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '品牌优势区块的主图片 - 选择图片后将显示预览',
      },
    }),

    // ==================================================================
    // 📋 发布状态
    // ==================================================================

    /**
     * Status (发布状态)
     */
    status: select({
      type: 'string',
      options: [
        { label: '✅ Published (已发布)', value: 'PUBLISHED' },
        { label: '📝 Draft (草稿)', value: 'DRAFT' },
        { label: '🗄️ Archived (已归档)', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      validation: { isRequired: true },
      label: 'Status (发布状态)',
      ui: {
        displayMode: 'segmented-control',
        description: '只有已发布状态才会在前端显示',
      },
    }),

    /**
     * Published At (发布时间)
     */
    publishedAt: timestamp({
      label: 'Published At (发布时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    // ==================================================================
    // 🕐 时间戳
    // ==================================================================

    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: () => true,
      create: () => true, // Allow creation for seeding
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session, // Never allow deletion (singleton)
    },
    // 前端只能看到已发布状态
    filter: {
      query: ({ session }) => {
        if (session) return true
        return { status: { equals: 'PUBLISHED' } }
      },
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    labelField: 'internalLabel',
    listView: {
      initialColumns: ['status', 'publishedAt', 'updatedAt'],
    },
    label: 'Brand Advantages',
    singular: 'Brand Advantages Config',
    plural: 'Brand Advantages Configs',
    description: '品牌优势配置 - Singleton。9个优势，每个有对应的lucide-react图标，加1张主图。',
    hideCreate: async ({ context }) => {
      const count = await context.query.BrandAdvantages.count()
      return count >= 1
    },
  },

  /**
   * Hooks
   */
  hooks: {
    // 发布时更新发布时间
    resolveInput: async ({ operation, resolvedData, item }) => {
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        if (!wasPublished) {
          resolvedData.publishedAt = new Date()
          console.log(`✅ [BrandAdvantages] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
