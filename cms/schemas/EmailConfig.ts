/**
 * EmailConfig Model - Email Service Configuration
 *
 * Features:
 * - Singleton pattern (only one configuration record)
 * - SMTP server configuration
 * - Form notification settings
 * - Auto-reply templates
 *
 * Separated from SiteConfig for better organization
 */

import { list } from '@keystone-6/core'
import { text, checkbox, json, timestamp } from '@keystone-6/core/fields'

export const EmailConfig = list({
  /**
   * Singleton Mode - Only one configuration record is allowed
   */
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🔑 Identifier
    // ==================================================================

    identifier: text({
      defaultValue: 'email-config',
      validation: { isRequired: true },
      label: 'Config Identifier (配置标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Internal identifier (auto-generated) | 内部标识符（自动生成）',
      },
    }),

    // ==================================================================
    // 📧 SMTP Configuration (SMTP 配置)
    // ==================================================================

    /**
     * SMTP Host (SMTP 主机)
     */
    smtpHost: text({
      label: 'SMTP Host (SMTP 主机)',
      ui: {
        description: 'SMTP server hostname | SMTP 服务器主机名',
      },
    }),

    /**
     * SMTP Port (SMTP 端口)
     */
    smtpPort: text({
      label: 'SMTP Port (SMTP 端口)',
      ui: {
        description: 'SMTP server port (usually 587 or 465) | SMTP 服务器端口（通常为 587 或 465）',
      },
    }),

    /**
     * SMTP User (SMTP 用户名)
     */
    smtpUser: text({
      label: 'SMTP User (SMTP 用户名)',
      ui: {
        description: 'SMTP authentication username | SMTP 认证用户名',
      },
    }),

    /**
     * SMTP Password (SMTP 密码)
     */
    smtpPassword: text({
      label: 'SMTP Password (SMTP 密码)',
      ui: {
        description: 'SMTP authentication password | SMTP 认证密码',
      },
    }),

    /**
     * Email From Address (发件邮箱地址)
     */
    emailFromAddress: text({
      defaultValue: 'noreply@busrom.com',
      label: 'Email From Address (发件邮箱地址)',
      ui: {
        description: 'Sender email address for automated emails | 自动邮件的发件人地址',
      },
    }),

    /**
     * Email From Name (发件人名称)
     */
    emailFromName: json({
      defaultValue: {
        en: 'Busrom Team',
        zh: 'Busrom 团队'
      },
      label: 'Email From Name (发件人名称)',
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Sender name for automated emails | 自动邮件发件人名称',
      },
    }),

    // ==================================================================
    // 📮 Form Notification Configuration (表单通知配置)
    // ==================================================================

    /**
     * Form Notification Emails (表单通知邮箱)
     */
    formNotificationEmails: text({
      label: 'Form Notification Emails (表单通知邮箱)',
      ui: {
        description: 'Comma-separated list of emails to notify on form submissions | 接收表单提交通知的邮箱列表（逗号分隔）',
      },
    }),

    /**
     * Enable Auto Reply (启用自动回复)
     */
    enableAutoReply: checkbox({
      defaultValue: false,
      label: 'Enable Auto Reply (启用自动回复)',
      ui: {
        description: 'Send automatic reply email to form submitters | 向表单提交者发送自动回复邮件',
      },
    }),

    /**
     * Auto Reply Template (自动回复模板)
     */
    autoReplyTemplate: json({
      defaultValue: {
        en: `Dear {name},

Thank you for contacting Busrom. We have received your message and will get back to you within 24 hours.

Best regards,
Busrom Team`,
        zh: `尊敬的 {name}，

感谢您联系 Busrom。我们已收到您的留言，将在 24 小时内回复您。

此致
Busrom 团队`
      },
      label: 'Auto Reply Template (自动回复模板)',
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Email template for auto-reply. Use {name} for submitter name | 自动回复邮件模板。使用 {name} 代表提交者姓名',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps
    // ==================================================================

    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation === 'update' && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, 'update', 'EmailConfig', item, undefined, originalItem)
      }
    },
  },

  access: {
    operation: {
      query: () => true,
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      // Allow super admin to delete (for resetting config)
      delete: ({ session }) => session?.data?.isAdmin === true,
    },
  },

  ui: {
    labelField: 'identifier',
    label: 'Email Config | 邮件服务配置',
    singular: 'Email Config',
    plural: 'Email Config',
    description: 'Email service and notification settings | 邮件服务和通知设置',
  },
})
