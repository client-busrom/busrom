/**
 * FormSubmissions Collection - Dynamic Form Submissions
 *
 * Features:
 * - Store submissions from any configured form
 * - Track submission status (UNREAD/READ/ARCHIVED)
 * - Store form data as JSON
 * - Store metadata (locale, IP, user agent, etc.)
 * - Link to FormConfig for form details
 * - Email notification on new submission
 * - Attachments support
 */

import type { CollectionConfig } from 'payload'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: {
      en: 'Form Submission',
      zh: '表单提交',
    },
    plural: {
      en: 'Form Submissions',
      zh: '表单提交',
    },
  },
  admin: {
    useAsTitle: 'formName',
    defaultColumns: ['formName', 'status', 'submissionType', 'emailSent', 'locale', 'submittedAt'],
    group: {
      en: 'Forms',
      zh: '表单管理',
    },
    description: 'View and manage form submissions',
    pagination: {
      defaultLimit: 25,
    },
    hideAPIURL: false,
  },
  access: {
    // Allow API creation (public from frontend), but completely prevent admin UI creation
    create: ({ req }) => {
      // If there's no user (API call from frontend), allow creation
      if (!req.user) return true
      // If there's a user (admin UI), prevent all creation - submissions should only come from frontend
      return false
    },
    // Only authenticated users can read/update
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    // Only super admin can delete
    delete: ({ req }) => {
      if (!req.user) return false
      return req.user.isAdmin === true
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Auto-populate formName from formConfig
        if (operation === 'create' && data?.formConfig) {
          try {
            const formConfig = await req.payload.findByID({
              collection: 'form-configs',
              id: data.formConfig,
            })
            if (formConfig) {
              data.formName = formConfig.name
            }
          } catch (error: any) {
            req.payload.logger.error('Error fetching form config:', error?.message || error)
          }
        }

        // Set readAt timestamp when status changes to READ
        if (operation === 'update' && data?.status === 'READ') {
          if (originalDoc?.status !== 'READ') {
            data.readAt = new Date().toISOString()
          }
        }

        return data
      },
    ],
  },
  fields: [
    // ==================================================================
    // Form Information
    // ==================================================================
    {
      name: 'formConfig',
      type: 'relationship',
      relationTo: 'form-configs',
      label: {
        en: 'Form Configuration',
        zh: '表单配置',
      },
      admin: {
        description: 'The form configuration this submission belongs to',
        readOnly: true,
      },
    },
    {
      name: 'formName',
      type: 'text',
      label: {
        en: 'Form Name',
        zh: '表单名称',
      },
      admin: {
        readOnly: true,
        description: 'Auto-populated from form config',
      },
    },

    // ==================================================================
    // Form Data
    // ==================================================================
    {
      name: 'data',
      type: 'json',
      label: {
        en: 'Form Data',
        zh: '表单数据',
      },
      admin: {
        description: 'All submitted form field values',
      },
    },
    {
      name: 'attachments',
      type: 'json',
      label: {
        en: 'Attachments',
        zh: '附件',
      },
      defaultValue: [],
      admin: {
        description: 'List of uploaded files',
      },
    },
    {
      name: 'totalAttachmentSize',
      type: 'number',
      label: {
        en: 'Total Attachment Size',
        zh: '附件总大小',
      },
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total size of all attachments in bytes',
      },
    },

    // ==================================================================
    // Status & Tracking
    // ==================================================================
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      required: true,
      defaultValue: 'UNREAD',
      options: [
        { label: 'Unread | 未读', value: 'UNREAD' },
        { label: 'Read | 已读', value: 'READ' },
        { label: 'Archived | 已归档', value: 'ARCHIVED' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'submissionType',
      type: 'select',
      label: {
        en: 'Submission Type',
        zh: '提交方式',
      },
      defaultValue: 'MANUAL',
      options: [
        { label: 'Manual | 手动提交', value: 'MANUAL' },
        { label: 'Auto | 自动保存', value: 'AUTO' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ==================================================================
    // Metadata
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Submission Metadata',
        zh: '提交元数据',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'locale',
          type: 'text',
          label: {
            en: 'Locale',
            zh: '语言',
          },
          admin: {
            readOnly: true,
            description: 'Language at time of submission',
          },
        },
        {
          name: 'sourcePage',
          type: 'text',
          label: {
            en: 'Source Page',
            zh: '来源页面',
          },
          admin: {
            readOnly: true,
            description: 'Page URL where form was submitted',
          },
        },
        {
          name: 'ipAddress',
          type: 'text',
          label: {
            en: 'IP Address',
            zh: 'IP 地址',
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'userAgent',
          type: 'textarea',
          label: {
            en: 'User Agent',
            zh: '浏览器信息',
          },
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    // ==================================================================
    // Admin Notes
    // ==================================================================
    {
      name: 'adminNotes',
      type: 'textarea',
      label: {
        en: 'Admin Notes',
        zh: '管理员备注',
      },
      admin: {
        description: 'Internal notes about this submission',
      },
    },

    // ==================================================================
    // Email Notification
    // ==================================================================
    {
      name: 'emailSent',
      type: 'checkbox',
      label: {
        en: 'Email Sent',
        zh: '邮件已发送',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Whether notification email has been sent',
      },
    },

    // ==================================================================
    // Timestamps
    // ==================================================================
    {
      name: 'submittedAt',
      type: 'date',
      label: {
        en: 'Submitted At',
        zh: '提交时间',
      },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'readAt',
      type: 'date',
      label: {
        en: 'Read At',
        zh: '阅读时间',
      },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
