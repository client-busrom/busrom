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
          label: 'Contact | 联系方式',
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
                description: '选择一个表单配置 (推荐使用 "footer-form")。表单的所有配置（字段、按钮文本等）都在 FormConfig 中设置。',
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
                  type: 'text',
                  localized: true,
                  label: 'Contact Title | 联系标题',
                },
                // Email
                {
                  name: 'contactEmailLabel',
                  type: 'text',
                  localized: true,
                  label: 'Email Label | 邮箱标签',
                  admin: {
                    description: '例如: "Email", "联系邮箱" 等',
                  },
                },
                {
                  name: 'contactEmail',
                  type: 'email',
                  label: 'Email | 邮箱',
                },
                // After Sales
                {
                  name: 'afterSalesLabel',
                  type: 'text',
                  localized: true,
                  label: 'After Sales Label | 售后标签',
                  admin: {
                    description: '例如: "After-sales", "售后" 等',
                  },
                },
                {
                  name: 'afterSalesEmail',
                  type: 'email',
                  label: 'After Sales Email | 售后邮箱',
                },
                // WhatsApp
                {
                  name: 'whatsappLabel',
                  type: 'text',
                  localized: true,
                  label: 'WhatsApp Label | WhatsApp标签',
                },
                {
                  name: 'whatsappNumber',
                  type: 'text',
                  label: 'WhatsApp Number | WhatsApp号码',
                },
                {
                  name: 'address',
                  type: 'textarea',
                  localized: true,
                  label: 'Address | 地址',
                },
                {
                  name: 'workingHours',
                  type: 'text',
                  localized: true,
                  label: 'Working Hours | 工作时间',
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
                  type: 'text',
                  localized: true,
                  label: 'Notice Title | 声明标题',
                },
                {
                  name: 'officialNoticeLine1',
                  type: 'text',
                  localized: true,
                  label: 'Line 1 | 第1行',
                },
                {
                  name: 'officialNoticeLine2',
                  type: 'text',
                  localized: true,
                  label: 'Line 2 | 第2行',
                },
                {
                  name: 'officialNoticeLine3',
                  type: 'text',
                  localized: true,
                  label: 'Line 3 | 第3行',
                },
                {
                  name: 'officialNoticeLine4',
                  type: 'text',
                  localized: true,
                  label: 'Line 4 | 第4行',
                  admin: {
                    description: '例如：署名、日期等',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Links & Menus | 链接菜单',
          fields: [
            // Social Links
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Social Links | 社交链接',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Twitter/X', value: 'twitter' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'WeChat', value: 'wechat' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
            // Navigation Menus
            {
              name: 'column3Menus',
              type: 'relationship',
              relationTo: 'navigation-menus',
              hasMany: true,
              label: 'Column 3 Navigation Menus | 第三列导航菜单',
              admin: {
                description: '选择要在非首页页脚第三列显示的导航菜单（必须是有实际页面的菜单）',
              },
            },
            {
              name: 'column4Menus',
              type: 'relationship',
              relationTo: 'navigation-menus',
              hasMany: true,
              label: 'Column 4 Navigation Menus | 第四列导航菜单',
              admin: {
                description: '选择要在非首页页脚第四列显示的导航菜单（必须是有实际页面的菜单）',
              },
            },
            // Copyright & Legal
            {
              name: 'copyrightText',
              type: 'text',
              localized: true,
              label: 'Copyright Text | 版权文本',
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Legal Links | 法律链接',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
