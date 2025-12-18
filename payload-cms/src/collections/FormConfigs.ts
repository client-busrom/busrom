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
    description: 'Configure dynamic form fields',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
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
        description: 'e.g., "main-form", "footer-form", "contact-us-form"',
      },
    },
    {
      name: 'displayName',
      type: 'text',
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
        description: 'Configure dynamic form fields',
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
            description: 'Internal field name (e.g., "email", "company")',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: {
            en: 'Label',
            zh: '显示标签',
          },
          localized: true,
          required: true,
        },
        {
          name: 'placeholder',
          type: 'text',
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
              type: 'text',
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
            description: 'Only for checkbox fields. When unchecked, checkbox acts as single-selection (like radio)',
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
          type: 'text',
          label: {
            en: 'Submit Button Text',
            zh: '提交按钮文字',
          },
          localized: true,
          defaultValue: 'Submit',
        },
        {
          name: 'successMessage',
          type: 'textarea',
          label: {
            en: 'Success Message',
            zh: '成功提示',
          },
          localized: true,
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
