/**
 * MainForm Model - Main Form Configuration (主表单配置)
 *
 * 用途: 首页主表单区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Placeholders for form fields
 * - Button text
 * - Design text (left & right)
 * - Images
 * - Multilingual support (24 languages)
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  json,
  text,
  select,
  timestamp,
  relationship,
} from '@keystone-6/core/fields'

export const MainForm = list({
  graphql: {
    plural: 'MainFormConfigs',
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
      defaultValue: 'Main Form Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 🔗 表单配置关联
    // ==================================================================

    /**
     * Form Configuration (表单配置)
     * 关联到 FormConfig，使用动态表单配置系统
     */
    formConfig: relationship({
      ref: 'FormConfig',
      label: 'Form Configuration (表单配置)',
      ui: {
        displayMode: 'select',
        description: '选择要使用的表单配置。如果选择了，将使用 FormConfig 的字段配置；如果不选，则使用下方的占位符配置。',
      },
    }),

    // ==================================================================
    // 📝 表单占位符
    // ==================================================================

    placeholderName: json({
      label: 'Placeholder - Name (姓名占位符)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Your Name"',
      },
    }),

    placeholderEmail: json({
      label: 'Placeholder - Email (邮箱占位符)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Your Email"',
      },
    }),

    placeholderWhatsapp: json({
      label: 'Placeholder - WhatsApp (WhatsApp占位符)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "WhatsApp Number"',
      },
    }),

    placeholderCompany: json({
      label: 'Placeholder - Company (公司占位符)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Company Name"',
      },
    }),

    placeholderMessage: json({
      label: 'Placeholder - Message (消息占位符)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Message"',
      },
    }),

    placeholderVerify: json({
      label: 'Placeholder - Verify (验证码占位符)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Verify Code"',
      },
    }),

    // ==================================================================
    // 📝 按钮文字
    // ==================================================================

    buttonText: json({
      label: 'Button Text (按钮文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Send"',
      },
    }),

    // ==================================================================
    // 📝 设计文字
    // ==================================================================

    designTextLeft: json({
      label: 'Design Text - Left (设计文字-左)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Premium Architectural Glass Hardware"',
      },
    }),

    designTextRight: json({
      label: 'Design Text - Right (设计文字-右)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Customized Structure and Color"',
      },
    }),

    // ==================================================================
    // 🖼️ 图片
    // ==================================================================

    image1: json({
      label: 'Image 1 (图片1)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    image2: json({
      label: 'Image 2 (图片2)',
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
      delete: () => false, // Never allow deletion (singleton)
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
    label: 'Main Form',
    singular: 'Main Form',
    plural: 'Main Forms',
    description: '主表单配置 - Singleton。包含表单字段占位符、按钮文字、设计文字、图片。',
    hideCreate: async ({ context }) => {
      const count = await context.query.MainForm.count()
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
          console.log(`✅ [MainForm] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
