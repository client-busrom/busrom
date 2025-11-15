/**
 * FormConfig Model - Form Configuration System (表单配置系统)
 *
 * 用途: 灵活配置网站各处的表单字段
 *
 * Features:
 * - 动态表单字段配置
 * - 支持多种字段类型 (text, email, textarea, select, checkbox, etc.)
 * - 字段验证规则配置
 * - 多语言支持 (24 languages)
 * - 可配置字段顺序
 * - 可指定表单用于哪里 (主表单、Footer、联系我们等)
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  json,
  text,
  select,
  integer,
  checkbox,
  timestamp,
} from '@keystone-6/core/fields'

export const FormConfig = list({
  fields: {
    // ==================================================================
    // 📝 基本信息
    // ==================================================================

    /**
     * Form Name (表单名称)
     * 用于标识不同的表单
     */
    name: text({
      label: 'Form Name (表单名称)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: '例如: "main-form", "footer-form", "contact-us-form"',
      },
    }),

    /**
     * Form Display Name (表单显示名称)
     * 用于后台管理界面显示
     */
    displayName: json({
      label: 'Display Name (显示名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Main Contact Form"',
      },
    }),

    /**
     * Form Description (表单描述)
     */
    description: json({
      label: 'Description (描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '表单的用途说明',
      },
    }),

    /**
     * Form Location (表单位置)
     * 表单用于哪里
     */
    location: select({
      label: 'Form Location (表单位置)',
      type: 'enum',
      options: [
        { label: '🏠 Home - Main Form (首页主表单)', value: 'HOME_MAIN' },
        { label: '🦶 Footer Form (页脚表单)', value: 'FOOTER' },
        { label: '📧 Contact Us Page (联系我们页面)', value: 'CONTACT_US' },
        { label: '💬 Quick Inquiry (快速咨询)', value: 'QUICK_INQUIRY' },
        { label: '🎯 Custom (自定义)', value: 'CUSTOM' },
      ],
      defaultValue: 'CUSTOM',
      validation: { isRequired: true },
      ui: {
        description: '指定此表单用于网站的哪个位置',
      },
    }),

    // ==================================================================
    // 📋 表单字段配置 (JSON Array)
    // ==================================================================

    /**
     * Form Fields (表单字段) - 多语言配置
     *
     * 数据结构 (类似 Product.specifications):
     * {
     *   en: [
     *     { fieldName: 'name', fieldType: 'text', label: 'Your Name', placeholder: 'Enter your name', required: true, order: 1 },
     *     { fieldName: 'email', fieldType: 'email', label: 'Email', ... }
     *   ],
     *   zh: [
     *     { fieldName: 'name', fieldType: 'text', label: '您的姓名', placeholder: '请输入您的姓名', required: true, order: 1 },
     *     { fieldName: 'email', fieldType: 'email', label: '邮箱', ... }
     *   ],
     *   // ... 其他语言
     * }
     *
     * 注意: 每种语言都有完整的字段列表，fieldName 和 fieldType 必须一致
     */
    fields: json({
      label: 'Form Fields (表单字段配置)',
      defaultValue: {},
      ui: {
        views: './custom-fields/FormFieldsConfigField',
        description: '配置表单字段（多语言）。每种语言独立配置字段的标签和占位符',
      },
    }),

    // ==================================================================
    // 🎨 表单外观配置
    // ==================================================================

    /**
     * Submit Button Text (提交按钮文字)
     */
    submitButtonText: json({
      label: 'Submit Button Text (提交按钮文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Submit", "Send Message"',
      },
    }),

    /**
     * Success Message (成功提示消息)
     */
    successMessage: json({
      label: 'Success Message (成功提示)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '表单提交成功后显示的消息',
      },
    }),

    /**
     * Error Message (错误提示消息)
     */
    errorMessage: json({
      label: 'Error Message (错误提示)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '表单提交失败后显示的消息',
      },
    }),

    // ==================================================================
    // ⚙️ 表单行为配置
    // ==================================================================
    //
    // 📌 配置继承说明：
    // 以下配置如果留空，将使用 SiteConfig 中的全局默认值
    // 如果填写，则覆盖全局默认值
    //
    // 继承逻辑：FormConfig 覆盖值 || SiteConfig 全局值 || 系统默认值

    /**
     * Notification Email (通知邮箱) - 可选，留空则使用全局配置
     *
     * 覆盖 SiteConfig.formNotificationEmails
     */
    notificationEmail: text({
      label: 'Notification Email (通知邮箱)',
      ui: {
        description: '接收此表单提交通知的邮箱，多个用逗号分隔。留空则使用 SiteConfig 中的全局配置',
      },
    }),

    /**
     * Enable Email Notification (启用邮件通知) - 可选
     *
     * 如果不设置，默认发送邮件通知
     */
    enableEmailNotification: checkbox({
      label: 'Enable Email Notification (启用邮件通知)',
      defaultValue: true,
      ui: {
        description: '此表单提交后是否发送邮件通知。默认：是',
      },
    }),

    /**
     * Enable Auto Reply (启用自动回复) - 可选，留空则使用全局配置
     *
     * 覆盖 SiteConfig.enableAutoReply
     */
    enableAutoReply: checkbox({
      label: 'Enable Auto Reply (启用自动回复)',
      ui: {
        description: '是否向此表单提交者发送自动回复。留空则使用 SiteConfig 中的全局配置',
      },
    }),

    /**
     * Auto Reply Subject (自动回复邮件主题) - 可选，留空则使用默认主题
     */
    autoReplySubject: json({
      label: 'Auto Reply Subject (自动回复主题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '此表单的自动回复邮件主题。留空则使用默认主题："Thank you for contacting us"',
      },
    }),

    /**
     * Auto Reply Content (自动回复邮件内容) - 可选，留空则使用全局模板
     *
     * 覆盖 SiteConfig.autoReplyTemplate
     */
    autoReplyContent: json({
      label: 'Auto Reply Content (自动回复内容)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '此表单的自动回复邮件内容。留空则使用 SiteConfig 中的全局模板。支持变量：{name}',
      },
    }),

    /**
     * Enable CAPTCHA (启用验证码) - 可选，留空则使用全局配置
     *
     * 覆盖 SiteConfig.enableCaptcha
     */
    enableCaptcha: checkbox({
      label: 'Enable CAPTCHA (启用验证码)',
      ui: {
        description: '此表单是否启用人机验证。留空则使用 SiteConfig 中的全局配置',
      },
    }),

    /**
     * Max Submissions Per Day (每日最大提交次数)
     * 防止垃圾提交
     */
    maxSubmissionsPerDay: integer({
      label: 'Max Submissions Per Day (每日最大提交次数)',
      defaultValue: 10,
      ui: {
        description: '同一IP每日最大提交次数，0表示不限制',
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
        { label: '🔒 Disabled (已禁用)', value: 'DISABLED' },
      ],
      defaultValue: 'DRAFT',
      validation: { isRequired: true },
      label: 'Status (状态)',
      ui: {
        displayMode: 'segmented-control',
        description: 'Published: 前端可用 | Disabled: 临时禁用表单',
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

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

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
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    // 前端只能看到已发布状态的表单配置
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
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'location', 'status', 'publishedAt', 'updatedAt'],
      defaultFieldMode: 'read',
    },
    label: 'Form Configurations',
    singular: 'Form Configuration',
    plural: 'Form Configurations',
    description: '动态表单配置系统 - 可灵活配置各处表单的字段、验证规则、行为等',
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
          console.log(`✅ [FormConfig] Publishing form configuration: ${item?.name}`)
        }
      }
      return resolvedData
    },

    // 验证字段配置的合法性
    validateInput: async ({ resolvedData, addValidationError }) => {
      // 验证 fields 字段 (多语言结构)
      if (resolvedData.fields) {
        try {
          const fields = typeof resolvedData.fields === 'string'
            ? JSON.parse(resolvedData.fields)
            : resolvedData.fields

          // 必须是对象 (语言代码 -> 字段数组)
          if (typeof fields !== 'object' || fields === null) {
            addValidationError('Fields must be an object with language codes')
            return
          }

          // 验证每种语言的字段数组
          Object.entries(fields).forEach(([lang, langFields]: [string, any]) => {
            if (!Array.isArray(langFields)) {
              addValidationError(`Fields for language "${lang}" must be an array`)
              return
            }

            // 验证每个字段的必需属性
            langFields.forEach((field: any, index: number) => {
              if (!field.fieldName) {
                addValidationError(`Field ${index + 1} in "${lang}": fieldName is required`)
              }
              if (!field.fieldType) {
                addValidationError(`Field ${index + 1} in "${lang}": fieldType is required`)
              }
              // 验证 select/radio 字段必须有 options (checkbox 可选)
              if (['select', 'radio'].includes(field.fieldType)) {
                if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
                  addValidationError(`Field ${index + 1} in "${lang}": options are required for select/radio fields`)
                }
              }
              // checkbox 的 options 如果存在则验证
              if (field.fieldType === 'checkbox' && field.options) {
                if (!Array.isArray(field.options) || field.options.length === 0) {
                  addValidationError(`Field ${index + 1} in "${lang}": if options are provided for checkbox, at least one option is required`)
                }
              }
            })
          })

          // 验证所有语言的 fieldName 和 fieldType 必须一致
          const languages = Object.keys(fields)
          if (languages.length > 1) {
            const baseLang = languages[0]
            const baseFields = fields[baseLang] as any[]
            const baseFieldNames = baseFields.map(f => f.fieldName)
            const baseFieldTypes = baseFields.map(f => f.fieldType)

            for (let i = 1; i < languages.length; i++) {
              const lang = languages[i]
              const langFields = fields[lang] as any[]

              if (langFields.length !== baseFields.length) {
                addValidationError(`Language "${lang}" has different number of fields than "${baseLang}"`)
                continue
              }

              langFields.forEach((field, idx) => {
                if (field.fieldName !== baseFieldNames[idx]) {
                  addValidationError(`Field ${idx + 1} in "${lang}": fieldName must match "${baseLang}" (expected "${baseFieldNames[idx]}", got "${field.fieldName}")`)
                }
                if (field.fieldType !== baseFieldTypes[idx]) {
                  addValidationError(`Field ${idx + 1} in "${lang}": fieldType must match "${baseLang}" (expected "${baseFieldTypes[idx]}", got "${field.fieldType}")`)
                }
                // 验证 select/radio/checkbox 字段的 options value 必须一致
                if (['select', 'radio', 'checkbox'].includes(field.fieldType)) {
                  const baseOptions = baseFields[idx].options || []
                  const fieldOptions = field.options || []

                  if (baseOptions.length !== fieldOptions.length) {
                    addValidationError(`Field ${idx + 1} in "${lang}": options count must match "${baseLang}" (expected ${baseOptions.length}, got ${fieldOptions.length})`)
                  } else if (baseOptions.length > 0) {
                    // 验证每个 option 的 value 必须一致
                    baseOptions.forEach((baseOpt: any, optIdx: number) => {
                      if (fieldOptions[optIdx] && baseOpt.value !== fieldOptions[optIdx].value) {
                        addValidationError(`Field ${idx + 1} option ${optIdx + 1} in "${lang}": value must match "${baseLang}" (expected "${baseOpt.value}", got "${fieldOptions[optIdx].value}")`)
                      }
                    })
                  }
                }
              })
            }
          }
        } catch (error) {
          addValidationError('Invalid fields configuration format')
        }
      }

      // 如果启用了邮件通知，必须填写通知邮箱
      if (resolvedData.enableEmailNotification && !resolvedData.notificationEmail) {
        addValidationError('Notification email is required when email notification is enabled')
      }
    },

    /**
     * ActivityLog - Record all operations
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if ((operation === 'create' || operation === 'update' || operation === 'delete') && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation, 'FormConfig', item, undefined, originalItem)
      }
    },
  },
})
