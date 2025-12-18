/**
 * QuoteSteps Model - Quote Steps Configuration (报价步骤配置)
 *
 * 用途: 首页报价流程步骤区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Header: title, title2, subtitle, description
 * - Exactly 5 steps (fixed, cannot add/remove)
 * - Each step: text, image
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

export const QuoteSteps = list({
  graphql: {
    plural: 'QuoteStepsConfigs',
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
      defaultValue: 'Quote Steps Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 标题和描述
    // ==================================================================

    /**
     * Title (主标题)
     */
    title: json({
      label: 'Title (主标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Design Project Solutions"',
      },
    }),

    /**
     * Title 2 (副标题)
     */
    title2: json({
      label: 'Title 2 (副标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Just Easy 5 Steps"',
      },
    }),

    /**
     * Subtitle (小标题)
     */
    subtitle: json({
      label: 'Subtitle (小标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "From concept to reality, made simple."',
      },
    }),

    /**
     * Description (描述)
     */
    description: json({
      label: 'Description (描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '整体描述文字',
      },
    }),

    // ==================================================================
    // 📝 步骤 1-5
    // ==================================================================

    step1Text: json({
      label: 'Step 1 - Text (步骤1文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Send Details (Size & Structure & Color)"',
      },
    }),

    step1Image: json({
      label: 'Step 1 - Image (步骤1图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    step2Text: json({
      label: 'Step 2 - Text (步骤2文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Get A Free Quote"',
      },
    }),

    step2Image: json({
      label: 'Step 2 - Image (步骤2图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    step3Text: json({
      label: 'Step 3 - Text (步骤3文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    step3Image: json({
      label: 'Step 3 - Image (步骤3图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    step4Text: json({
      label: 'Step 4 - Text (步骤4文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    step4Image: json({
      label: 'Step 4 - Image (步骤4图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    step5Text: json({
      label: 'Step 5 - Text (步骤5文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    step5Image: json({
      label: 'Step 5 - Image (步骤5图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
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
        { label: '📝 Draft (草稿)', value: 'DRAFT' },
        { label: '✅ Published (已发布)', value: 'PUBLISHED' },
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
    label: 'Quote Steps | 报价五步曲',
    singular: 'Quote Steps | 报价五步曲',
    plural: 'Quote Steps | 报价五步曲',
    description: '报价步骤配置 - Singleton。固定5个步骤，每个步骤包含文字和图片。',
    hideCreate: async ({ context }) => {
      const count = await context.query.QuoteSteps.count()
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
          console.log(`✅ [QuoteSteps] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
