/**
 * Footer Model - Footer Configuration (页脚配置)
 *
 * 用途: 管理网站页脚的全局配置，包括联系表单、联系信息、官方声明等
 *
 * Features:
 * - Singleton pattern (only one record exists)
 * - Multilingual content (24 languages)
 * - Contact form configuration
 * - Company contact information
 * - Official notice/fraud warning
 *
 * API Documentation:
 * - REST API: GET /api/home/footer?locale=en
 * - Returns: Form config, contact info, official notice
 */

import { list } from '@keystone-6/core'
import { text, json, checkbox, timestamp, select, relationship } from '@keystone-6/core/fields'

export const Footer = list({
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🏷️ Internal Label (内部标识)
    // ==================================================================

    internalLabel: text({
      label: 'Internal Label',
      defaultValue: 'Footer Configuration',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    // ==================================================================
    // 📋 Form Configuration (表单配置) - 关联到 FormConfig
    // ==================================================================

    /**
     * Form Configuration (表单配置)
     *
     * 关联到 FormConfig，自动使用配置的表单字段
     * 如果不关联，则使用下面的旧版字段配置
     */
    formConfig: relationship({
      label: 'Form Configuration (表单配置)',
      ref: 'FormConfig',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: '选择一个表单配置 (推荐使用 "footer-form")。如果选择了表单配置，将忽略下方的旧版字段设置。',
      },
    }),

    /**
     * ⚠️ 以下字段为旧版配置，仅在未关联 FormConfig 时使用
     * 推荐使用上方的 FormConfig 关联方式
     */

    /**
     * Form Title (表单标题)
     */
    formTitle: json({
      label: 'Form Title (表单标题) - 旧版',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '⚠️ 旧版配置。联系表单标题，支持24语言自动翻译',
      },
    }),

    /**
     * Form Placeholder - Name (姓名占位符)
     */
    formPlaceholderName: json({
      label: 'Form Placeholder - Name (姓名占位符) - 旧版',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '⚠️ 旧版配置。姓名输入框占位符，支持24语言自动翻译',
      },
    }),

    /**
     * Form Placeholder - Email (邮箱占位符)
     */
    formPlaceholderEmail: json({
      label: 'Form Placeholder - Email (邮箱占位符) - 旧版',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '⚠️ 旧版配置。邮箱输入框占位符，支持24语言自动翻译',
      },
    }),

    /**
     * Form Placeholder - Message (留言占位符)
     */
    formPlaceholderMessage: json({
      label: 'Form Placeholder - Message (留言占位符) - 旧版',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '⚠️ 旧版配置。留言输入框占位符，支持24语言自动翻译',
      },
    }),

    /**
     * Form Button Text (表单按钮文字)
     */
    formButtonText: json({
      label: 'Form Button Text (表单按钮文字) - 旧版',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '⚠️ 旧版配置。提交按钮文字，支持24语言自动翻译',
      },
    }),

    // ==================================================================
    // 📞 Contact Information (联系信息) - 多语言
    // ==================================================================

    /**
     * Contact Title (联系标题)
     */
    contactTitle: json({
      label: 'Contact Title (联系标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '联系信息标题，支持24语言自动翻译',
      },
    }),

    /**
     * Contact Email Label (邮箱标签)
     */
    contactEmailLabel: json({
      label: 'Contact Email Label (邮箱标签)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '邮箱标签文字，支持24语言自动翻译',
      },
    }),

    /**
     * Contact Email (联系邮箱)
     */
    contactEmail: json({
      label: 'Contact Email (联系邮箱)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '联系邮箱地址（通常所有语言相同）',
      },
    }),

    /**
     * After Sales Label (售后标签)
     */
    afterSalesLabel: json({
      label: 'After Sales Label (售后标签)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '售后邮箱标签文字，支持24语言自动翻译',
      },
    }),

    /**
     * After Sales Email (售后邮箱)
     */
    afterSalesEmail: json({
      label: 'After Sales Email (售后邮箱)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '售后邮箱地址（通常所有语言相同）',
      },
    }),

    /**
     * WhatsApp Label (WhatsApp标签)
     */
    whatsappLabel: json({
      label: 'WhatsApp Label (WhatsApp标签)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'WhatsApp标签文字，支持24语言自动翻译',
      },
    }),

    /**
     * WhatsApp Number (WhatsApp号码)
     */
    whatsappNumber: json({
      label: 'WhatsApp Number (WhatsApp号码)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'WhatsApp号码（通常所有语言相同）',
      },
    }),

    // ==================================================================
    // ⚠️ Official Notice (官方声明) - 多语言
    // ==================================================================

    /**
     * Official Notice Title (官方声明标题)
     */
    officialNoticeTitle: json({
      label: 'Official Notice Title (官方声明标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '官方声明标题，支持24语言自动翻译',
      },
    }),

    /**
     * Official Notice Line 1 (官方声明第1行)
     */
    officialNoticeLine1: json({
      label: 'Official Notice Line 1 (官方声明第1行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '官方声明第1行内容，支持24语言自动翻译',
      },
    }),

    /**
     * Official Notice Line 2 (官方声明第2行)
     */
    officialNoticeLine2: json({
      label: 'Official Notice Line 2 (官方声明第2行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '官方声明第2行内容，支持24语言自动翻译',
      },
    }),

    /**
     * Official Notice Line 3 (官方声明第3行)
     */
    officialNoticeLine3: json({
      label: 'Official Notice Line 3 (官方声明第3行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '官方声明第3行内容，支持24语言自动翻译',
      },
    }),

    /**
     * Official Notice Line 4 (官方声明第4行)
     */
    officialNoticeLine4: json({
      label: 'Official Notice Line 4 (官方声明第4行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '官方声明第4行内容（如署名），支持24语言自动翻译',
      },
    }),

    // ==================================================================
    // 🎛️ Settings (设置)
    // ==================================================================

    /**
     * Enabled (启用)
     *
     * Whether the footer is enabled
     */
    enabled: checkbox({
      defaultValue: true,
      label: 'Enabled (启用)',
      ui: {
        description: '是否启用页脚',
      },
    }),

    // ==================================================================
    // 📋 发布状态管理
    // ==================================================================

    /**
     * Status (状态)
     *
     * Draft: 草稿状态，仅在 CMS 中可见
     * Published: 已发布，前端可见
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
        description: '草稿状态不会在前端显示，只有发布后才会对访客可见',
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
        description: '内容发布到线上的时间',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps (时间戳)
    // ==================================================================

    /**
     * Updated At (更新时间)
     */
    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  /**
   * Access Control
   * - query: 公开访问 (前端需要读取)
   * - create: 仅用于初始化
   * - update: 需要登录
   * - delete: 禁止删除 (singleton)
   * - filter: 前端仅显示已发布内容
   */
  access: {
    operation: {
      query: () => true,
      create: () => true, // 仅用于初始化
      update: ({ session }: any) => !!session,
      delete: () => false, // 禁止删除 singleton
    },
    filter: {
      query: ({ session }: any) => {
        // 已登录用户可以看到所有状态
        if (session) return true
        // 前端访客只能看到已发布的内容
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
      initialColumns: ['internalLabel', 'formConfig', 'enabled', 'status', 'publishedAt', 'updatedAt'],
      defaultFieldMode: 'read',
    },
    description: '页脚配置 - Singleton + 草稿发布模式。现在支持关联 FormConfig 来动态配置表单字段。修改后将状态改为"已发布"才会在前端显示。',
  },

  /**
   * Hooks
   */
  hooks: {

    /**
     * 发布逻辑
     *
     * 当状态改为 PUBLISHED 时，更新发布时间
     */
    resolveInput: async ({ operation, resolvedData, item }) => {
      // 只在更新操作时处理
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        const isPublishing = !wasPublished

        if (isPublishing) {
          // 更新发布时间
          resolvedData.publishedAt = new Date()
          console.log(`✅ [Footer] Publishing footer content`)
        }
      }

      return resolvedData
    },

    /**
     * ActivityLog - Record all operations
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation === 'update' && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, 'update', 'Footer', item, undefined, originalItem)
      }
    },
  },
})
