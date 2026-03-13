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
        { label: { en: 'Home - Main Form', zh: '首页主表单' }, value: 'HOME_MAIN' },
        { label: { en: 'Footer Form', zh: '页脚表单' }, value: 'FOOTER' },
        { label: { en: 'Contact Us Page', zh: '联系我们' }, value: 'CONTACT_US' },
        { label: { en: 'Quick Inquiry', zh: '快速咨询' }, value: 'QUICK_INQUIRY' },
        { label: { en: 'Custom', zh: '自定义' }, value: 'CUSTOM' },
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
            { label: { en: 'Text', zh: '文本' }, value: 'text' },
            { label: { en: 'Email', zh: '邮箱' }, value: 'email' },
            { label: { en: 'Phone', zh: '电话' }, value: 'phone' },
            { label: { en: 'Textarea', zh: '多行文本' }, value: 'textarea' },
            { label: { en: 'Select', zh: '下拉选择' }, value: 'select' },
            { label: { en: 'Checkbox', zh: '复选框' }, value: 'checkbox' },
            { label: { en: 'Radio', zh: '单选' }, value: 'radio' },
            { label: { en: 'Number', zh: '数字' }, value: 'number' },
            { label: { en: 'Date', zh: '日期' }, value: 'date' },
            { label: { en: 'File', zh: '文件' }, value: 'file' },
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
            {
              name: 'hasCustomInput',
              type: 'checkbox',
              label: {
                en: 'Allow Custom Input',
                zh: '允许自定义输入（如"其他"）',
              },
              defaultValue: false,
              admin: {
                description: {
                  en: 'If checked, selecting this option will show a text input for the user to type manually.',
                  zh: '如果勾选，用户选择此项时会弹出一个输入框供其手动填写。',
                },
              },
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
            { label: { en: 'Full', zh: '全宽' }, value: 'full' },
            { label: { en: 'Half', zh: '半宽' }, value: 'half' },
            { label: { en: 'Third', zh: '三分之一' }, value: 'third' },
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
            { label: { en: 'Auto', zh: '自动' }, value: 'auto' },
            { label: { en: 'Light', zh: '浅色' }, value: 'light' },
            { label: { en: 'Dark', zh: '深色' }, value: 'dark' },
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
            { label: { en: 'Normal', zh: '正常' }, value: 'normal' },
            { label: { en: 'Compact', zh: '紧凑' }, value: 'compact' },
          ],
          admin: {
            condition: (data) => data?.captchaEnabled,
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
          en: 'Configure auto-reply for this specific form. Overrides the SMTP config defaults.',
          zh: '为此表单配置自动回复。覆盖 SMTP 配置中的默认设置。',
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
            { label: { en: 'Inherit from SMTP Config', zh: '继承 SMTP 配置' }, value: 'inherit' },
            { label: { en: 'Enabled', zh: '启用' }, value: 'enabled' },
            { label: { en: 'Disabled', zh: '禁用' }, value: 'disabled' },
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
            zh: '自动回复主题（覆盖 SMTP 默认）',
          },
          localized: true,
          admin: {
            description: {
              en: 'Leave empty to use SMTP config default',
              zh: '留空则使用 SMTP 配置的默认值',
            },
            condition: (data) => data?.autoReplyEnabled === 'enabled',
          },
        },
        {
          name: 'autoReplyTemplate',
          type: 'richText',
          editor: emailTemplateEditor,
          label: {
            en: 'Auto Reply Template (Override)',
            zh: '自动回复模板（覆盖 SMTP 默认）',
          },
          localized: true,
          admin: {
            description: {
              en: 'Leave empty to use SMTP config default. "Dear [Name]," is added automatically.',
              zh: '留空则使用 SMTP 配置的默认值。系统会自动在顶部添加“尊敬的 [姓名]：”称呼。',
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
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
