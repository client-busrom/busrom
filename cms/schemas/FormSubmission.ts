/**
 * FormSubmission Model - Dynamic Form Submissions
 *
 * 用途: 存储通过 FormConfig 配置的动态表单提交数据
 *
 * Features:
 * - Store submissions from any configured form
 * - Track submission status (UNREAD/READ/ARCHIVED)
 * - Store form data as JSON
 * - Store metadata (locale, IP, user agent, etc.)
 * - Link to FormConfig for form details
 */

import { list } from '@keystone-6/core'
import { text, select, timestamp, json, relationship, checkbox } from '@keystone-6/core/fields'
import { queueFormSubmissionNotification } from '../lib/email-queue'

export const FormSubmission = list({
  fields: {
    // ==================================================================
    // 📝 Form Information
    // ==================================================================

    /**
     * Form Config (关联到表单配置)
     */
    formConfig: relationship({
      ref: 'FormConfig',
      label: 'Form Configuration',
      ui: {
        displayMode: 'select',
        description: '关联的表单配置',
      },
    }),

    /**
     * Form Name (表单名称)
     * 冗余存储,方便快速查看
     */
    formName: text({
      label: 'Form Name',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '表单名称(冗余字段)',
      },
    }),

    // ==================================================================
    // 📊 Form Data (JSON)
    // ==================================================================

    /**
     * Form Data (表单数据)
     * 存储所有表单字段的键值对
     *
     * 示例:
     * {
     *   "Name": "John Doe",
     *   "Email": "john@example.com",
     *   "PhoneNumber": "+1234567890",
     *   "InquiryProduct": ["glass-standoff", "glass-hinge"],
     *   "Customize": "Custom size requirements...",
     *   "Message": "I would like to inquire about..."
     * }
     */
    data: json({
      label: 'Form Data (表单数据)',
      ui: {
        views: './custom-fields/JSONField',
        description: '表单提交的所有字段数据',
      },
    }),

    // ==================================================================
    // 📋 Status & Tracking
    // ==================================================================

    /**
     * Status (状态)
     */
    status: select({
      type: 'enum',
      options: [
        { label: '📬 Unread (未读)', value: 'UNREAD' },
        { label: '✅ Read (已读)', value: 'READ' },
        { label: '📁 Archived (已归档)', value: 'ARCHIVED' },
      ],
      defaultValue: 'UNREAD',
      validation: { isRequired: true },
      label: 'Status (状态)',
      ui: {
        displayMode: 'segmented-control',
      },
    }),

    /**
     * Auto Submitted (自动提交标记)
     * 标记是否由系统自动提交(如用户未完成表单但离开页面)
     */
    autoSubmitted: select({
      type: 'enum',
      options: [
        { label: '✋ Manual (手动提交)', value: 'MANUAL' },
        { label: '🤖 Auto (自动提交)', value: 'AUTO' },
      ],
      defaultValue: 'MANUAL',
      label: 'Submission Type',
      ui: {
        displayMode: 'segmented-control',
        description: '手动提交或自动保存',
      },
    }),

    // ==================================================================
    // 📍 Metadata
    // ==================================================================

    /**
     * Locale (语言)
     */
    locale: text({
      label: 'Locale (语言)',
      ui: {
        description: '用户提交时的语言,如 "en", "zh"',
      },
    }),

    /**
     * Source Page (来源页面)
     */
    sourcePage: text({
      label: 'Source Page (来源页面)',
      ui: {
        description: '用户提交时所在的页面 URL',
      },
    }),

    /**
     * IP Address
     */
    ipAddress: text({
      label: 'IP Address',
      ui: {
        description: '提交者的 IP 地址',
      },
    }),

    /**
     * User Agent
     */
    userAgent: text({
      label: 'User Agent',
      ui: {
        displayMode: 'textarea',
        description: '浏览器信息',
      },
    }),

    // ==================================================================
    // 📝 Admin Notes
    // ==================================================================

    /**
     * Admin Notes (管理员备注)
     */
    adminNotes: text({
      label: 'Admin Notes (管理员备注)',
      ui: {
        displayMode: 'textarea',
        description: '管理员可以在此添加备注',
      },
    }),

    // ==================================================================
    // 📧 Email Notification
    // ==================================================================

    /**
     * Email Sent Flag
     *
     * Tracks whether email notification has been sent to admins
     */
    emailSent: checkbox({
      defaultValue: false,
      label: 'Email Sent',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Whether email notification has been sent',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps
    // ==================================================================

    submittedAt: timestamp({
      label: 'Submitted At (提交时间)',
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    readAt: timestamp({
      label: 'Read At (阅读时间)',
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
      query: ({ session }) => !!session,
      create: () => true, // Allow public submission
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    labelField: 'formName',
    listView: {
      initialColumns: ['formName', 'status', 'autoSubmitted', 'emailSent', 'locale', 'submittedAt'],
      defaultFieldMode: 'read',
      initialSort: { field: 'submittedAt', direction: 'DESC' },
    },
    label: 'Form Submissions',
    singular: 'Form Submission',
    plural: 'Form Submissions',
    description: '动态表单提交记录 - 存储所有通过 FormConfig 配置的表单数据',
  },

  /**
   * Hooks
   */
  hooks: {
    // 自动设置 formName
    resolveInput: async ({ operation, resolvedData, context }) => {
      if (operation === 'create' && resolvedData.formConfig) {
        try {
          const formConfig = await context.query.FormConfig.findOne({
            where: { id: resolvedData.formConfig.connect.id },
            query: 'name',
          })
          if (formConfig) {
            resolvedData.formName = formConfig.name
          }
        } catch (error) {
          console.error('Error fetching form config:', error)
        }
      }

      // 标记为已读时记录时间
      if (operation === 'update' && resolvedData.status === 'READ') {
        const item = await context.db.FormSubmission.findOne({
          where: { id: (resolvedData as any).id },
        })
        if (item && item.status !== 'READ') {
          resolvedData.readAt = new Date()
        }
      }

      return resolvedData
    },

    /**
     * ActivityLog - Record all operations
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      // Send email notification on create
      if (operation === 'create' && item) {
        try {
          console.log(`📧 Sending email notification for form submission: ${item.formName}`)

          // Prepare form submission data
          const formData = {
            id: item.id,
            formName: item.formName || 'Unknown Form',
            formConfigId: item.formConfigId || null, // Pass FormConfig ID for custom email settings
            data: item.data || {},
            submittedAt: item.submittedAt,
            locale: item.locale,
            sourcePage: item.sourcePage,
            ipAddress: item.ipAddress,
            userAgent: item.userAgent,
          }

          // Queue email notification (non-blocking)
          const jobId = await queueFormSubmissionNotification(formData, context)

          // Update emailSent flag
          await context.db.FormSubmission.updateOne({
            where: { id: item.id },
            data: { emailSent: true },
          })

          console.log(`✅ Email notification queued (Job ID: ${jobId}) for form: ${item.formName}`)
        } catch (error) {
          console.error(`❌ Error sending email notification:`, error)
          // Don't throw error to prevent blocking the form submission
        }
      }

      // Log activity
      if ((operation === 'create' || operation === 'update' || operation === 'delete') && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation, 'FormSubmission', item, undefined, originalItem)
      }
    },
  },
})
