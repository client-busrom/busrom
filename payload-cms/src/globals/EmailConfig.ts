/**
 * EmailConfig Global - Email Service Configuration
 *
 * Features:
 * - SMTP server configuration
 * - Form notification settings (global defaults)
 * - Auto-reply templates with rich text support
 * - Multi-language support with Translation Center
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
    description: {
      en: 'Email service and notification settings',
      zh: '邮件服务和通知设置',
    },
  },
  versions: true,
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // ==================================================================
    // Translation Center (Sidebar)
    // ==================================================================
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
            description: {
              en: 'SMTP server hostname (e.g., smtp.gmail.com)',
              zh: 'SMTP服务器主机名（例如：smtp.gmail.com）',
            },
          },
        },
        {
          name: 'smtpPort',
          type: 'number',
          label: {
            en: 'SMTP Port',
            zh: 'SMTP 端口',
          },
          defaultValue: 587,
          admin: {
            description: {
              en: 'Usually 587 (TLS) or 465 (SSL)',
              zh: '通常是 587 (TLS) 或 465 (SSL)',
            },
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
            description: {
              en: 'For Gmail, use App Password (not your regular password)',
              zh: '对于 Gmail，请使用应用专用密码（而非常规密码）',
            },
          },
        },
        {
          name: 'testSmtp',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/fields/SmtpTestButton',
            },
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
        },
      ],
    },

    // ==================================================================
    // Form Notification Configuration (Global Defaults)
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Form Notification (Global Defaults)',
        zh: '表单通知配置（全局默认）',
      },
      admin: {
        description: {
          en: 'These settings apply to all forms unless overridden in individual form config',
          zh: '这些设置适用于所有表单，除非在单独的表单配置中覆盖',
        },
      },
      fields: [
        {
          name: 'formNotificationEnabled',
          type: 'checkbox',
          label: {
            en: 'Enable Form Notifications',
            zh: '启用表单通知',
          },
          defaultValue: true,
          admin: {
            description: {
              en: 'Send email notifications when forms are submitted',
              zh: '当表单提交时发送邮件通知',
            },
          },
        },
        {
          name: 'formNotificationEmails',
          type: 'text',
          label: {
            en: 'Notification Emails',
            zh: '通知邮箱',
          },
          admin: {
            description: {
              en: 'Comma-separated list of emails to notify on form submissions',
              zh: '表单提交时通知的邮箱列表，用逗号分隔',
            },
            condition: (data) => data?.formNotificationEnabled,
          },
        },
        {
          name: 'notificationSubject',
          type: 'text',
          label: {
            en: 'Notification Subject',
            zh: '通知邮件主题',
          },
          localized: true,
          defaultValue: 'New Form Submission: {formName}',
          admin: {
            description: {
              en: 'Use {formName} for form name placeholder',
              zh: '使用 {formName} 作为表单名称占位符',
            },
            condition: (data) => data?.formNotificationEnabled,
          },
        },
      ],
    },

    // ==================================================================
    // Auto Reply Configuration (Global Defaults)
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Auto Reply (Global Defaults)',
        zh: '自动回复配置（全局默认）',
      },
      admin: {
        description: {
          en: 'Auto-reply settings used when individual form config does not specify',
          zh: '当单独的表单配置未指定时使用的自动回复设置',
        },
      },
      fields: [
        {
          name: 'enableAutoReply',
          type: 'checkbox',
          label: {
            en: 'Enable Auto Reply (Global Default)',
            zh: '启用自动回复（全局默认）',
          },
          defaultValue: false,
          admin: {
            description: {
              en: 'This is the default setting. Individual forms can override this.',
              zh: '这是默认设置。单独的表单可以覆盖此设置。',
            },
          },
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
          },
        },
        {
          name: 'autoReplyTemplate',
          type: 'richText',
          label: {
            en: 'Auto Reply Template',
            zh: '自动回复模板',
          },
          localized: true,
          admin: {
            condition: (data) => data.enableAutoReply,
            description: {
              en: 'Use {name} for submitter name, {email} for email, {formName} for form name',
              zh: '使用 {name} 表示提交者姓名，{email} 表示邮箱，{formName} 表示表单名称',
            },
            components: {
              beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
            },
          },
        },
      ],
    },
  ],
}
