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
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { sendFormNotificationEmail, sendAutoReplyEmail } from '../lib/form-email'

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
    description: {
      en: 'View and manage form submissions',
      zh: '查看和管理表单提交',
    },
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
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.isAdmin) return true

      // Non-admins can only see submissions for forms they are assigned to,
      // or forms that have no assigned operators (public forms)
      return {
        or: [
          {
            'formConfig.assignedOperators': {
              exists: false,
            },
          },
          {
            'formConfig.assignedOperators': {
              in: [user.id],
            },
          },
        ],
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.isAdmin) return true

      return {
        or: [
          {
            'formConfig.assignedOperators': {
              exists: false,
            },
          },
          {
            'formConfig.assignedOperators': {
              in: [user.id],
            },
          },
        ],
      }
    },
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

        // Parse phone number for country info
        if (operation === 'create' && data?.data) {
          const formData = data.data
          // Look for phone fields in common names
          const phoneFieldKeys = ['phone', 'tel', 'whatsapp', 'phoneNumber', 'mobile']
          let phoneValue = ''

          // 1. Try common keys
          for (const key of phoneFieldKeys) {
            if (formData[key]) {
              phoneValue = formData[key]
              break
            }
          }

          // 2. If not found, look for any value starting with '+'
          if (!phoneValue) {
            for (const key in formData) {
              if (typeof formData[key] === 'string' && formData[key].startsWith('+')) {
                phoneValue = formData[key]
                break
              }
            }
          }

          if (phoneValue) {
            try {
              const phoneNumber = parsePhoneNumberFromString(phoneValue)
              if (phoneNumber) {
                data.countryCode = phoneNumber.country // e.g., 'CN', 'US'
                // countryName is a bit harder without a library, but countryCode is usually enough
                // for the notification. We can use Intl.DisplayNames if available in Node.
                if (phoneNumber.country) {
                  try {
                    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
                    data.countryName = regionNames.of(phoneNumber.country)
                  } catch (e) {
                    data.countryName = phoneNumber.country
                  }
                }
              }
            } catch (err: any) {
              req.payload.logger.error(`Phone parsing error: ${err?.message || err}`)
            }
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
    afterChange: [
      async ({ doc, req, operation }) => {
        // Only send emails on create (new submission)
        if (operation !== 'create') return doc

        // Send emails asynchronously (don't block the response)
        setImmediate(async () => {
          try {
            // Send notification email to admin
            const notificationResult = await sendFormNotificationEmail(req.payload, doc)
            if (notificationResult.success) {
              // Update emailSent flag
              await req.payload.update({
                collection: 'form-submissions',
                id: doc.id,
                data: { emailSent: true },
              })
              req.payload.logger.info(`Notification email sent for submission ${doc.id}`)
            } else if (notificationResult.error) {
              req.payload.logger.error(`Failed to send notification email: ${notificationResult.error}`)
            }

            // Send auto-reply to submitter
            const autoReplyResult = await sendAutoReplyEmail(req.payload, doc)
            if (autoReplyResult.success) {
              req.payload.logger.info(`Auto-reply email sent for submission ${doc.id}`)
            } else if (autoReplyResult.error && autoReplyResult.error !== 'Auto-reply disabled') {
              req.payload.logger.error(`Failed to send auto-reply email: ${autoReplyResult.error}`)
            }
          } catch (error: any) {
            req.payload.logger.error('Error in email notification hook:', error?.message || error)
          }
        })

        return doc
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
        description: {
          en: 'The form configuration this submission belongs to',
          zh: '此提交所属的表单配置',
        },
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
        description: {
          en: 'Auto-populated from form config',
          zh: '从表单配置自动填充',
        },
      },
    },
    {
      name: 'countryCode',
      type: 'text',
      label: {
        en: 'Country Code',
        zh: '国家代码',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'countryName',
      type: 'text',
      label: {
        en: 'Country Name',
        zh: '国家名称',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    // ==================================================================
    // Form Data (Visual Display)
    // ==================================================================
    {
      name: 'dataDisplay',
      type: 'ui',
      label: {
        en: 'Submitted Data',
        zh: '提交的数据',
      },
      admin: {
        components: {
          Field: '@/components/fields/FormDataDisplay',
        },
      },
    },
    {
      name: 'data',
      type: 'json',
      label: {
        en: 'Form Data (Raw JSON)',
        zh: '表单数据 (原始JSON)',
      },
      admin: {
        readOnly: true,
        description: {
          en: 'All submitted form field values',
          zh: '所有提交的表单字段值',
        },
        condition: () => false, // Hide raw JSON field
      },
    },
    {
      name: 'attachmentsDisplay',
      type: 'ui',
      label: {
        en: 'Attachments',
        zh: '附件',
      },
      admin: {
        components: {
          Field: '@/components/fields/AttachmentsDisplay',
        },
      },
    },
    {
      name: 'attachments',
      type: 'json',
      label: {
        en: 'Attachments (Raw)',
        zh: '附件 (原始)',
      },
      defaultValue: [],
      admin: {
        readOnly: true,
        description: {
          en: 'List of uploaded files',
          zh: '上传文件列表',
        },
        condition: () => false, // Hide raw JSON field
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
        description: {
          en: 'Total size of all attachments in bytes',
          zh: '所有附件的总大小（字节）',
        },
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
        { label: { en: 'Unread', zh: '未读' }, value: 'UNREAD' },
        { label: { en: 'Read', zh: '已读' }, value: 'READ' },
        { label: { en: 'Archived', zh: '已归档' }, value: 'ARCHIVED' },
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
        { label: { en: 'Manual', zh: '手动提交' }, value: 'MANUAL' },
        { label: { en: 'Auto', zh: '自动保存' }, value: 'AUTO' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
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
            description: {
              en: 'Language at time of submission',
              zh: '提交时的语言',
            },
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
            description: {
              en: 'Page URL where form was submitted',
              zh: '表单提交的页面URL',
            },
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
        description: {
          en: 'Internal notes about this submission',
          zh: '关于此提交的内部备注',
        },
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
        description: {
          en: 'Whether notification email has been sent',
          zh: '是否已发送通知邮件',
        },
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
