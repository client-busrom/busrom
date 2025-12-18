/**
 * EmailConfig Global - Email Service Configuration
 *
 * Features:
 * - SMTP server configuration
 * - Form notification settings
 * - Auto-reply templates
 */

import type { GlobalConfig } from 'payload'

export const EmailConfig: GlobalConfig = {
  slug: 'email-config',
  label: {
    en: 'Email Config',
    zh: '邮件服务配置',
  },
  admin: {
    group: {
      en: 'CMS Settings',
      zh: 'CMS系统设置',
    },
    description: 'Email service and notification settings',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // ==================================================================
    // SMTP Configuration
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'SMTP Configuration',
        zh: 'SMTP 配置',
      },
      fields: [
        {
          name: 'smtpHost',
          type: 'text',
          label: {
            en: 'SMTP Host',
            zh: 'SMTP 主机',
          },
          admin: {
            description: 'SMTP server hostname (e.g., smtp.gmail.com)',
          },
        },
        {
          name: 'smtpPort',
          type: 'text',
          label: {
            en: 'SMTP Port',
            zh: 'SMTP 端口',
          },
          admin: {
            description: 'Usually 587 (TLS) or 465 (SSL)',
          },
        },
        {
          name: 'smtpUser',
          type: 'text',
          label: {
            en: 'SMTP User',
            zh: 'SMTP 用户名',
          },
        },
        {
          name: 'smtpPassword',
          type: 'text',
          label: {
            en: 'SMTP Password',
            zh: 'SMTP 密码',
          },
          admin: {
            // Note: In production, use Payload's encrypted fields or env vars
          },
        },
      ],
    },

    // ==================================================================
    // Sender Configuration
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Sender Configuration',
        zh: '发件人配置',
      },
      fields: [
        {
          name: 'emailFromAddress',
          type: 'email',
          label: {
            en: 'From Address',
            zh: '发件邮箱地址',
          },
          defaultValue: 'noreply@busrom.com',
        },
        {
          name: 'emailFromName',
          type: 'text',
          label: {
            en: 'From Name',
            zh: '发件人名称',
          },
          localized: true,
          defaultValue: 'Busrom Team',
          admin: {
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
            },
          },
        },
      ],
    },

    // ==================================================================
    // Form Notification Configuration
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Form Notification',
        zh: '表单通知配置',
      },
      fields: [
        {
          name: 'formNotificationEmails',
          type: 'text',
          label: {
            en: 'Notification Emails',
            zh: '通知邮箱',
          },
          admin: {
            description: 'Comma-separated list of emails to notify on form submissions',
          },
        },
        {
          name: 'enableAutoReply',
          type: 'checkbox',
          label: {
            en: 'Enable Auto Reply',
            zh: '启用自动回复',
          },
          defaultValue: false,
        },
        {
          name: 'autoReplySubject',
          type: 'text',
          label: {
            en: 'Auto Reply Subject',
            zh: '自动回复主题',
          },
          localized: true,
          defaultValue: 'Thank you for contacting Busrom',
          admin: {
            condition: (data) => data.enableAutoReply,
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
            },
          },
        },
        {
          name: 'autoReplyTemplate',
          type: 'textarea',
          label: {
            en: 'Auto Reply Template',
            zh: '自动回复模板',
          },
          localized: true,
          admin: {
            condition: (data) => data.enableAutoReply,
            description: 'Use {name} for submitter name',
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
            },
          },
        },
      ],
    },
  ],
}
