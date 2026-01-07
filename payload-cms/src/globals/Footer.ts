/**
 * Footer Global
 *
 * Footer Configuration (Singleton)
 * Migrated from Keystone Footer schema
 *
 * Features:
 * - Contact form configuration
 * - Company contact information
 * - Official notice/fraud warning
 * - Multilingual content (24 languages)
 */

import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: {
    en: 'Footer',
    zh: '页脚',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
  },
  // versions: true,
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    // Translation Center
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
    // 📋 Configuration Tabs
    // ==================================================================
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Contact',
            zh: '联系方式',
          },
          fields: [
            // Form Configuration
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
                  en: 'Select a form configuration (recommended: "footer-form"). All form settings (fields, button text, etc.) are configured in FormConfig.',
                  zh: '选择一个表单配置（推荐使用 "footer-form"）。表单的所有配置（字段、按钮文本等）都在 FormConfig 中设置。',
                },
              },
            },
            // Contact Information
            {
              type: 'group',
              name: 'contactInfoGroup',
              label: {
                en: 'Contact Information',
                zh: '联系信息',
              },
              fields: [
                {
                  name: 'contactTitle',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Contact Title',
                    zh: '联系标题',
                  },
                },
                // Email
                {
                  name: 'contactEmailLabel',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Email Label',
                    zh: '邮箱标签',
                  },
                  admin: {
                    description: {
                      en: 'e.g., "Email", "Contact Email"',
                      zh: '例如: "Email", "联系邮箱" 等',
                    },
                  },
                },
                {
                  name: 'contactEmail',
                  type: 'email',
                  label: {
                    en: 'Email',
                    zh: '邮箱',
                  },
                },
                // After Sales
                {
                  name: 'afterSalesLabel',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'After Sales Label',
                    zh: '售后标签',
                  },
                  admin: {
                    description: {
                      en: 'e.g., "After-sales", "Support"',
                      zh: '例如: "After-sales", "售后" 等',
                    },
                  },
                },
                {
                  name: 'afterSalesEmail',
                  type: 'email',
                  label: {
                    en: 'After Sales Email',
                    zh: '售后邮箱',
                  },
                },
                // WhatsApp
                {
                  name: 'whatsappLabel',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'WhatsApp Label',
                    zh: 'WhatsApp标签',
                  },
                },
                {
                  name: 'whatsappNumber',
                  type: 'text',
                  label: {
                    en: 'WhatsApp Number',
                    zh: 'WhatsApp号码',
                  },
                },
                {
                  name: 'address',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Address',
                    zh: '地址',
                  },
                },
                {
                  name: 'workingHours',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Working Hours',
                    zh: '工作时间',
                  },
                },
              ],
            },
            // Official Notice
            {
              type: 'group',
              name: 'officialNoticeGroup',
              label: {
                en: 'Official Notice',
                zh: '官方声明',
              },
              fields: [
                {
                  name: 'officialNoticeTitle',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Notice Title',
                    zh: '声明标题',
                  },
                },
                {
                  name: 'officialNoticeLine1',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Line 1',
                    zh: '第1行',
                  },
                },
                {
                  name: 'officialNoticeLine2',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Line 2',
                    zh: '第2行',
                  },
                },
                {
                  name: 'officialNoticeLine3',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Line 3',
                    zh: '第3行',
                  },
                },
                {
                  name: 'officialNoticeLine4',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Line 4',
                    zh: '第4行',
                  },
                  admin: {
                    description: {
                      en: 'e.g., signature, date, etc.',
                      zh: '例如：署名、日期等',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'Links & Menus',
            zh: '链接菜单',
          },
          fields: [
            // Social Links - Reference to SocialConfig
            {
              name: 'socialLinksNote',
              type: 'ui',
              admin: {
                components: {
                  Field: {
                    path: '@/components/fields/InfoBox',
                    exportName: 'InfoBox',
                    clientProps: {
                      message: {
                        en: 'Social links are managed in Social Config. Go to Website Settings > Social Config to edit social media links.',
                        zh: '社交链接在"社交媒体配置"中管理。请前往 网站设置 > 社交媒体配置 编辑社交链接。',
                      },
                      linkHref: '/admin/globals/social-config',
                      linkText: {
                        en: 'Edit Social Links',
                        zh: '编辑社交链接',
                      },
                    },
                  },
                },
              },
            },
            // Navigation Menus (横向展示)
            {
              name: 'navigationMenus',
              type: 'relationship',
              relationTo: 'navigation-menus',
              hasMany: true,
              label: {
                en: 'Navigation Menus',
                zh: '导航菜单',
              },
              admin: {
                description: {
                  en: 'Select navigation menus to display in non-homepage footer (horizontal layout)',
                  zh: '选择要在非首页页脚显示的导航菜单（横向排列）',
                },
              },
            },
            // Copyright & Legal
            {
              name: 'copyrightText',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Copyright Text',
                zh: '版权文本',
              },
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: {
                en: 'Legal Links',
                zh: '法律链接',
              },
              fields: [
                {
                  name: 'label',
                  type: 'textarea',
                  localized: true,
                  required: true,
                  label: {
                    en: 'Label',
                    zh: '标签',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: {
                    en: 'URL',
                    zh: '链接',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
