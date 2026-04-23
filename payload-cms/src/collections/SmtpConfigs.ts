/**
 * SmtpConfigs Collection - Multi-SMTP Account Configuration
 *
 * Each SMTP config has its own SMTP credentials, sender info,
 * associated forms, notification settings, and auto-reply defaults.
 * A form can only be assigned to one SMTP config at a time.
 */

import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  InlineCodeFeature,
  ParagraphFeature,
  HeadingFeature,
  UnorderedListFeature,
  OrderedListFeature,
  LinkFeature,
  UploadFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  AlignFeature,
  IndentFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'

/**
 * Simplified Lexical editor for email templates.
 * Includes text formatting + image upload, excludes custom blocks/embeds.
 */
const emailTemplateEditor = lexicalEditor({
  features: [
    // Text formatting
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    // Structure
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    // Lists
    UnorderedListFeature(),
    OrderedListFeature(),
    // Links & images
    LinkFeature(),
    UploadFeature(),
    // Layout
    AlignFeature(),
    IndentFeature(),
    // Toolbar
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

export const SmtpConfigs: CollectionConfig = {
  slug: 'smtp-configs',
  labels: {
    singular: {
      en: 'SMTP Config',
      zh: 'SMTP 配置',
    },
    plural: {
      en: 'SMTP Configs',
      zh: 'SMTP 配置',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'smtpHost', 'status', 'updatedAt'],
    group: {
      en: 'Forms',
      zh: '表单管理',
    },
    description: {
      en: 'Configure SMTP accounts for form email sending',
      zh: '配置用于表单邮件发送的 SMTP 账号',
    },
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Server-side safety net: ensure no formConfig is assigned to another enabled SmtpConfig
        if (!data?.formConfigs || !Array.isArray(data.formConfigs) || data.formConfigs.length === 0) {
          return data
        }

        const currentId = originalDoc?.id
        const formConfigIds = data.formConfigs.map((fc: any) =>
          typeof fc === 'object' ? fc.id : fc,
        )

        for (const formConfigId of formConfigIds) {
          const existing = await req.payload.find({
            collection: 'smtp-configs' as any,
            where: {
              and: [
                { formConfigs: { in: [formConfigId] } },
                { status: { equals: 'enabled' } },
                ...(currentId ? [{ id: { not_equals: currentId } }] : []),
              ],
            },
            limit: 1,
          })

          if (existing.totalDocs > 0) {
            const conflicting = existing.docs[0] as any
            throw new Error(
              `Form "${formConfigId}" is already assigned to SMTP config "${conflicting.name}". Remove it from there first.`,
            )
          }
        }

        return data
      },
    ],
  },
  fields: [
    // ==================================================================
    // Basic Information
    // ==================================================================
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Config Name',
        zh: '配置名称',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'e.g., "Pre-sales Email", "After-sales Email"',
          zh: '例如："售前邮箱"、"售后邮箱"',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
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
          required: true,
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
          required: true,
        },
        {
          name: 'smtpPassword',
          type: 'text',
          label: {
            en: 'SMTP Password',
            zh: 'SMTP 密码',
          },
          required: true,
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
          admin: {
            description: {
              en: 'Leave empty to use SMTP user as sender',
              zh: '留空则使用 SMTP 用户名作为发件人',
            },
          },
        },
        {
          name: 'emailFromName',
          type: 'text',
          label: {
            en: 'From Name',
            zh: '发件人名称',
          },
          localized: true,
          defaultValue: 'Busrom',
        },
      ],
    },

    // ==================================================================
    // Associated Forms
    // ==================================================================
    {
      name: 'formConfigs',
      type: 'relationship',
      relationTo: 'form-configs',
      hasMany: true,
      label: {
        en: 'Associated Forms',
        zh: '关联表单',
      },
      admin: {
        description: {
          en: 'Select forms that will use this SMTP config. Each form can only belong to one SMTP config.',
          zh: '选择使用此 SMTP 配置的表单。每个表单只能属于一个 SMTP 配置。',
        },
        components: {
          Field: '@/components/fields/SmtpFormConfigPicker',
        },
      },
    },

    // ==================================================================
    // Notification Email Settings
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Notification Email',
        zh: '通知邮件设置',
      },
      admin: {
        description: {
          en: 'Configure admin notification emails for form submissions',
          zh: '配置表单提交时的管理员通知邮件',
        },
      },
      fields: [
        {
          name: 'notificationEnabled',
          type: 'checkbox',
          label: {
            en: 'Enable Notification',
            zh: '启用通知',
          },
          defaultValue: true,
        },
        {
          name: 'notificationEmails',
          type: 'textarea',
          label: {
            en: 'Notification Emails',
            zh: '通知邮箱',
          },
          admin: {
            description: {
              en: 'Enter emails separated by commas or newlines',
              zh: '输入通知邮箱，使用逗号或回车换行分隔',
            },
            condition: (data) => data?.notificationEnabled,
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
            condition: (data) => data?.notificationEnabled,
          },
        },
      ],
    },

    // ==================================================================
    // Auto Reply Defaults
    // ==================================================================
    {
      name: 'autoReplyEnabled',
      type: 'checkbox',
      label: {
        en: 'Enable Auto Reply (Default)',
        zh: '启用自动回复（默认）',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'Default auto-reply setting. Individual forms can override.',
          zh: '默认自动回复设置。各表单可单独覆盖。',
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
        description: {
          en: 'Email subject. Supports placeholders like {name}, {company}.',
          zh: '邮件主题。支持 {name}、{company} 等占位符。',
        },
        condition: (data) => data?.autoReplyEnabled,
      },
    },
    {
      name: 'autoReplyTemplate',
      type: 'richText',
      editor: emailTemplateEditor,
      label: {
        en: 'Auto Reply Template',
        zh: '自动回复模板',
      },
      localized: true,
      admin: {
        description: {
          en: 'Write only the core message. "Dear [Name]," is added automatically at the top. {company}, {formName} are still available.',
          zh: '只需填写核心内容。系统会自动在顶部添加“尊敬的 [姓名]：”称呼。{company}、{formName} 仍可作为手动占位符使用。',
        },
        condition: (data) => data?.autoReplyEnabled,
        components: {
          beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
        },
      },
    },

    // ==================================================================
    // Sidebar
    // ==================================================================
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      defaultValue: 'enabled',
      options: [
        { label: { en: 'Enabled', zh: '启用' }, value: 'enabled' },
        { label: { en: 'Disabled', zh: '禁用' }, value: 'disabled' },
      ],
      admin: {
        position: 'sidebar',
        disableListColumn: true,
      },
    },
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
  ],
  timestamps: true,
}
