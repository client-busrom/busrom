/**
 * SimpleCta Model - Simple CTA Configuration (简单CTA配置)
 *
 * 用途: 首页"Ready to Start Your Project?"区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Title (2 parts), Subtitle, Description, Button Text
 * - Exactly 3 images
 * - Multilingual support (24 languages)
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  json,
  select,
  timestamp,
  text,
} from '@keystone-6/core/fields'

export const SimpleCta = list({
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      defaultValue: 'Simple CTA Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 文本内容
    // ==================================================================

    /**
     * Title (标题第1部分)
     *
     * Example: "Ready to Start"
     */
    title: json({
      label: 'Title (标题第1部分)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Ready to Start"',
      },
    }),

    /**
     * Title 2 (标题第2部分)
     *
     * Example: "Your Project?"
     */
    title2: json({
      label: 'Title 2 (标题第2部分)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Your Project?"',
      },
    }),

    /**
     * Subtitle (副标题)
     *
     * Example: "Let's Build Something Exceptional!"
     */
    subtitle: json({
      label: 'Subtitle (副标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Let\'s Build Something Exceptional!"',
      },
    }),

    /**
     * Description (描述)
     *
     * Example: "Connect with Busrom's Team for precision hardware..."
     */
    description: json({
      label: 'Description (描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '详细描述文本',
      },
    }),

    /**
     * Button Text (按钮文字)
     *
     * Example: "Contact Us Now！"
     */
    buttonText: json({
      label: 'Button Text (按钮文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '行动号召按钮的文字',
      },
    }),

    // ==================================================================
    // 🖼️ 图片 (必须3张)
    // ==================================================================

    /**
     * Images (图片)
     *
     * Exactly 3 images required
     */
    image1: json({
      label: 'Image 1 (图片1) - 必填',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    image2: json({
      label: 'Image 2 (图片2) - 必填',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    image3: json({
      label: 'Image 3 (图片3) - 必填',
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
      create: async ({ context }) => {
        const count = await context.query.SimpleCta.count()
        return count === 0 // Singleton: only allow if no records exist
      },
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session, // Never allow deletion
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
    label: 'Simple CTA',
    singular: 'Simple CTA',
    plural: 'Simple CTAs',
    description: 'Simple CTA 配置 - Singleton。包含标题(2部分)、副标题、描述、按钮文字、3张图片。',
    hideCreate: async ({ context }) => {
      const count = await context.query.SimpleCta.count()
      return count >= 1
    },
  },

  /**
   * Hooks
   */
  hooks: {
    // 验证必填字段
    validateInput: async ({ resolvedData, addValidationError, operation }) => {
      if (operation === 'create') {
        // 验证3张图片
        if (!resolvedData.image1) {
          addValidationError('Image 1 is required | 图片1为必填项')
        }
        if (!resolvedData.image2) {
          addValidationError('Image 2 is required | 图片2为必填项')
        }
        if (!resolvedData.image3) {
          addValidationError('Image 3 is required | 图片3为必填项')
        }
      }
    },

    // 发布时更新发布时间
    resolveInput: async ({ operation, resolvedData, item }) => {
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        if (!wasPublished) {
          resolvedData.publishedAt = new Date()
          console.log(`✅ [SimpleCta] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
