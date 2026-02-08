/**
 * FormConfigs Collection - Form Configuration System
 *
 * Features:
 * - Dynamic form field configuration
 * - Support for various field types (text, email, textarea, select, etc.)
 * - Field validation rules
 * - Multi-language support
 * - Form location configuration
 */

import type { CollectionConfig } from 'payload'

export const FormConfigs: CollectionConfig = {
  slug: 'form-configs',
  labels: {
    singular: {
      en: 'Form Config',
      zh: '表单配置',
    },
    plural: {
      en: 'Form Configs',
      zh: '表单配置',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'status', 'updatedAt'],
    group: {
      en: 'Forms',
      zh: '表单管理',
    },
    description: {
      en: 'Configure dynamic form fields',
      zh: '配置动态表单字段',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // ==================================================================
    // Basic Information
    // ==================================================================
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Form Name',
        zh: '表单名称',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'e.g., "main-form", "footer-form", "contact-us-form"',
          zh: '例如："main-form"、"footer-form"、"contact-us-form"',
        },
      },
    },
    {
      name: 'displayName',
      type: 'textarea',
      label: {
        en: 'Display Name',
        zh: '显示名称',
      },
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
    },
    {
      name: 'location',
      type: 'select',
      label: {
        en: 'Form Location',
        zh: '表单位置',
      },
      required: true,
      defaultValue: 'CUSTOM',
      options: [
        { label: 'Home - Main Form | 首页主表单', value: 'HOME_MAIN' },
        { label: 'Footer Form | 页脚表单', value: 'FOOTER' },
        { label: 'Contact Us Page | 联系我们', value: 'CONTACT_US' },
        { label: 'Quick Inquiry | 快速咨询', value: 'QUICK_INQUIRY' },
        { label: 'Custom | 自定义', value: 'CUSTOM' },
      ],
    },

    // ==================================================================
    // Form Fields Configuration
    // ==================================================================
    {
      name: 'fields',
      type: 'array',
      label: {
        en: 'Form Fields',
        zh: '表单字段',
      },
      admin: {
        description: {
          en: 'Configure dynamic form fields',
          zh: '配置动态表单字段',
        },
      },
      fields: [
        {
          name: 'fieldName',
          type: 'text',
          label: {
            en: 'Field Name',
            zh: '字段名称',
          },
          required: true,
          admin: {
            description: {
              en: 'Internal field name (e.g., "email", "company")',
              zh: '内部字段名称（例如："email"、"company"）',
            },
          },
        },
        {
          name: 'label',
          type: 'textarea',
          label: {
            en: 'Label',
            zh: '显示标签',
          },
          localized: true,
          required: true,
        },
        {
          name: 'placeholder',
          type: 'textarea',
          label: {
            en: 'Placeholder',
            zh: '占位符',
          },
          localized: true,
        },
        {
          name: 'fieldType',
          type: 'select',
          label: {
            en: 'Field Type',
            zh: '字段类型',
          },
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Text | 文本', value: 'text' },
            { label: 'Email | 邮箱', value: 'email' },
            { label: 'Phone | 电话', value: 'phone' },
            { label: 'Textarea | 多行文本', value: 'textarea' },
            { label: 'Select | 下拉选择', value: 'select' },
            { label: 'Checkbox | 复选框', value: 'checkbox' },
            { label: 'Radio | 单选', value: 'radio' },
            { label: 'Number | 数字', value: 'number' },
            { label: 'Date | 日期', value: 'date' },
            { label: 'File | 文件', value: 'file' },
          ],
        },
        {
          name: 'options',
          type: 'array',
          label: {
            en: 'Options',
            zh: '选项',
          },
          admin: {
            condition: (data, siblingData) =>
              ['select', 'radio', 'checkbox'].includes(siblingData?.fieldType),
          },
          fields: [
            {
              name: 'value',
              type: 'text',
              label: 'Value',
              required: true,
            },
            {
              name: 'label',
              type: 'textarea',
              label: 'Label',
              localized: true,
              required: true,
            },
          ],
        },
        {
          name: 'allowMultiple',
          type: 'checkbox',
          label: {
            en: 'Allow Multiple Selections',
            zh: '允许多选',
          },
          defaultValue: true,
          admin: {
            description: {
              en: 'Only for checkbox fields. When unchecked, checkbox acts as single-selection (like radio)',
              zh: '仅适用于复选框字段。取消勾选时，复选框表现为单选（类似单选按钮）',
            },
            condition: (data, siblingData) => siblingData?.fieldType === 'checkbox',
          },
        },
        {
          name: 'required',
          type: 'checkbox',
          label: {
            en: 'Required',
            zh: '必填',
          },
          defaultValue: false,
        },
        {
          name: 'width',
          type: 'select',
          label: {
            en: 'Width',
            zh: '宽度',
          },
          defaultValue: 'full',
          options: [
            { label: 'Full | 全宽', value: 'full' },
            { label: 'Half | 半宽', value: 'half' },
            { label: 'Third | 三分之一', value: 'third' },
          ],
        },
        {
          name: 'order',
          type: 'number',
          label: {
            en: 'Order',
            zh: '顺序',
          },
          defaultValue: 0,
        },
      ],
    },

    // ==================================================================
    // Submit Button Configuration
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Submit Button',
        zh: '提交按钮配置',
      },
      fields: [
        {
          name: 'submitButtonText',
          type: 'textarea',
          label: {
            en: 'Submit Button Text',
            zh: '提交按钮文字',
          },
          localized: true,
          defaultValue: 'Submit',
        },
        {
          name: 'submittingText',
          type: 'textarea',
          label: {
            en: 'Submitting Text',
            zh: '提交中文字',
          },
          localized: true,
          defaultValue: 'Submitting...',
        },
        {
          name: 'successMessage',
          type: 'textarea',
          label: {
            en: 'Success Message',
            zh: '成功提示',
          },
          localized: true,
          defaultValue: 'Submitted successfully! We will contact you soon.',
        },
        {
          name: 'errorRequiredFields',
          type: 'textarea',
          label: {
            en: 'Required Fields Error',
            zh: '必填字段错误提示',
          },
          localized: true,
          defaultValue: 'Please fill in required fields',
        },
        {
          name: 'errorNetworkMessage',
          type: 'textarea',
          label: {
            en: 'Network Error Message',
            zh: '网络错误提示',
          },
          localized: true,
          defaultValue: 'Network error, please try again',
        },
        {
          name: 'errorCaptchaMessage',
          type: 'textarea',
          label: {
            en: 'Captcha Error Message',
            zh: '验证码错误提示',
          },
          localized: true,
          defaultValue: 'Please complete the captcha verification',
        },
      ],
    },

    // ==================================================================
    // Rate Limiting & Anti-Spam
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Rate Limiting & Anti-Spam',
        zh: '频率限制与防刷',
      },
      admin: {
        description: {
          en: 'Protect form from spam and abuse',
          zh: '保护表单免受垃圾信息和滥用',
        },
      },
      fields: [
        {
          name: 'rateLimitEnabled',
          type: 'checkbox',
          label: {
            en: 'Enable Rate Limiting',
            zh: '启用频率限制',
          },
          defaultValue: true,
        },
        {
          name: 'rateLimitPerIP',
          type: 'number',
          label: {
            en: 'Max Submissions per IP (per hour)',
            zh: '每IP每小时最大提交次数',
          },
          defaultValue: 5,
          admin: {
            description: {
              en: 'Maximum submissions allowed from same IP within 1 hour',
              zh: '同一IP在1小时内允许的最大提交次数',
            },
            condition: (data) => data?.rateLimitEnabled,
          },
        },
        {
          name: 'rateLimitPerDay',
          type: 'number',
          label: {
            en: 'Max Submissions per Day (total)',
            zh: '每日最大提交次数（总计）',
          },
          defaultValue: 100,
          admin: {
            description: {
              en: 'Maximum total submissions for this form per day (0 = unlimited)',
              zh: '此表单每天的最大提交总数（0 = 不限制）',
            },
            condition: (data) => data?.rateLimitEnabled,
          },
        },
        {
          name: 'minSubmitInterval',
          type: 'number',
          label: {
            en: 'Minimum Interval (seconds)',
            zh: '最小提交间隔（秒）',
          },
          defaultValue: 30,
          admin: {
            description: {
              en: 'Minimum seconds between submissions from same IP',
              zh: '同一IP两次提交之间的最小秒数',
            },
            condition: (data) => data?.rateLimitEnabled,
          },
        },
      ],
    },

    // ==================================================================
    // Captcha Settings (per-form overrides, keys in SiteConfig)
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Captcha Settings',
        zh: '验证码设置',
      },
      admin: {
        description: {
          en: 'Turnstile Site Key and Secret Key are configured in Site Config > Captcha',
          zh: 'Turnstile 的 Site Key 和 Secret Key 在 站点配置 > 验证码 中统一设置',
        },
      },
      fields: [
        {
          name: 'captchaEnabled',
          type: 'checkbox',
          label: {
            en: 'Enable Captcha for this form',
            zh: '为此表单启用验证码',
          },
          defaultValue: false,
        },
        {
          name: 'captchaTheme',
          type: 'select',
          label: {
            en: 'Captcha Theme',
            zh: '验证码主题',
          },
          defaultValue: 'auto',
          options: [
            { label: 'Auto | 自动', value: 'auto' },
            { label: 'Light | 浅色', value: 'light' },
            { label: 'Dark | 深色', value: 'dark' },
          ],
          admin: {
            condition: (data) => data?.captchaEnabled,
          },
        },
        {
          name: 'captchaSize',
          type: 'select',
          label: {
            en: 'Captcha Size',
            zh: '验证码尺寸',
          },
          defaultValue: 'normal',
          options: [
            { label: 'Normal | 正常', value: 'normal' },
            { label: 'Compact | 紧凑', value: 'compact' },
          ],
          admin: {
            condition: (data) => data?.captchaEnabled,
          },
        },
      ],
    },

    // ==================================================================
    // Email Notification Settings (per-form override)
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Email Notification',
        zh: '邮件通知设置',
      },
      admin: {
        description: {
          en: 'Override global email settings for this form. Leave empty to use global defaults.',
          zh: '为此表单覆盖全局邮件设置。留空则使用全局默认值。',
        },
      },
      fields: [
        {
          name: 'notificationEmails',
          type: 'text',
          label: {
            en: 'Notification Emails (Override)',
            zh: '通知邮箱（覆盖全局）',
          },
          admin: {
            description: {
              en: 'Comma-separated emails. If set, overrides global notification emails.',
              zh: '逗号分隔的邮箱。如果设置，将覆盖全局通知邮箱。',
            },
          },
        },
        {
          name: 'senderEmailAddress',
          type: 'email',
          label: {
            en: 'Sender Email Address (Override)',
            zh: '发件邮箱地址（覆盖全局）',
          },
          admin: {
            description: {
              en: 'e.g., support@busromhouse.com, sales@busromhouse.com. Leave empty to use global default.',
              zh: '例如：support@busromhouse.com、sales@busromhouse.com。留空则使用全局默认值。',
            },
          },
        },
        {
          name: 'senderName',
          type: 'text',
          label: {
            en: 'Sender Name (Override)',
            zh: '发件人名称（覆盖全局）',
          },
          localized: true,
          admin: {
            description: {
              en: 'e.g., "Busrom Support", "Busrom Sales". Leave empty to use global default.',
              zh: '例如："Busrom 客服"、"Busrom 销售"。留空则使用全局默认值。',
            },
          },
        },
      ],
    },

    // ==================================================================
    // Auto Reply Settings (per-form)
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Auto Reply',
        zh: '自动回复设置',
      },
      admin: {
        description: {
          en: 'Configure auto-reply for this specific form. This takes priority over global settings.',
          zh: '为此表单配置自动回复。此设置优先于全局设置。',
        },
      },
      fields: [
        {
          name: 'autoReplyEnabled',
          type: 'select',
          label: {
            en: 'Auto Reply',
            zh: '自动回复',
          },
          defaultValue: 'inherit',
          options: [
            { label: 'Inherit from Global | 继承全局设置', value: 'inherit' },
            { label: 'Enabled | 启用', value: 'enabled' },
            { label: 'Disabled | 禁用', value: 'disabled' },
          ],
          admin: {
            description: {
              en: 'Choose whether to enable auto-reply for this form',
              zh: '选择是否为此表单启用自动回复',
            },
          },
        },
        {
          name: 'autoReplySubject',
          type: 'textarea',
          label: {
            en: 'Auto Reply Subject (Override)',
            zh: '自动回复主题（覆盖全局）',
          },
          localized: true,
          admin: {
            description: {
              en: 'Leave empty to use global default',
              zh: '留空则使用全局默认值',
            },
            condition: (data) => data?.autoReplyEnabled === 'enabled',
          },
        },
        {
          name: 'autoReplyTemplate',
          type: 'richText',
          label: {
            en: 'Auto Reply Template (Override)',
            zh: '自动回复模板（覆盖全局）',
          },
          localized: true,
          admin: {
            description: {
              en: 'Leave empty to use global default. Use {name}, {email}, {formName} as placeholders.',
              zh: '留空则使用全局默认值。可使用 {name}、{email}、{formName} 作为占位符。',
            },
            condition: (data) => data?.autoReplyEnabled === 'enabled',
            components: {
              beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
            },
          },
        },
      ],
    },

    // ==================================================================
    // Sidebar Fields
    // ==================================================================
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
    {
      name: 'formFieldsTranslationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/FormFieldsTranslationCenter',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      defaultValue: 'draft',
      options: [
        { label: 'Published | 已发布', value: 'published' },
        { label: 'Draft | 草稿', value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
