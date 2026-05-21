/**
 * ContactPopup Global - Contact Popup Configuration
 *
 * 用途: 导航栏 Contact Us 点击后的弹窗配置
 * - 弹窗标题
 * - 多个联系选项（电话、聊天、预约等）
 * - 每个选项包含图标、标题、描述、链接
 */

import type { GlobalConfig } from 'payload'

export const ContactPopup: GlobalConfig = {
  slug: 'contact-popup',
  label: {
    en: 'Contact Popup',
    zh: '联系弹窗',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
    description: {
      en: 'Configure the contact popup that appears when clicking "Contact Us" in the navigation',
      zh: '配置导航栏"联系我们"点击后显示的弹窗内容',
    },
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
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
    // Status
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '发布状态',
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
    // Popup Title
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Popup Title',
        zh: '弹窗标题',
      },
      localized: true,
      defaultValue: 'Find the support that works for you',
    },
    // Contact Options
    {
      name: 'options',
      type: 'array',
      label: {
        en: 'Contact Options',
        zh: '联系选项',
      },
      admin: {
        description: {
          en: 'Add contact options that will be displayed in the popup (e.g., Phone, Chat, Schedule Appointment)',
          zh: '添加将在弹窗中显示的联系选项（例如：电话、在线聊天、预约）',
        },
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Icon',
            zh: '图标',
          },
          admin: {
            description: {
              en: 'Square icon image (recommended 176x176px)',
              zh: '正方形图标图片（建议 176x176 像素）',
            },
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Option Title',
            zh: '选项标题',
          },
          localized: true,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: {
            en: 'Description',
            zh: '描述',
          },
          localized: true,
          admin: {
            description: {
              en: 'Support hours or brief description',
              zh: '服务时间或简短描述',
            },
          },
        },
        {
          name: 'linkType',
          type: 'select',
          label: {
            en: 'Link Type',
            zh: '链接类型',
          },
          defaultValue: 'url',
          options: [
            { label: { en: 'URL', zh: '网址' }, value: 'url' },
            { label: { en: 'Phone', zh: '电话' }, value: 'phone' },
            { label: { en: 'Email', zh: '邮箱' }, value: 'email' },
            { label: { en: 'Chat Widget', zh: '聊天组件' }, value: 'chat' },
          ],
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: {
            en: 'Link URL',
            zh: '链接地址',
          },
          admin: {
            components: {
              Field: '@/components/fields/ContactLinkField',
            },
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: {
            en: 'Open in New Tab',
            zh: '在新标签页打开',
          },
          defaultValue: true,
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: {
            en: 'Sort Order',
            zh: '排序',
          },
          defaultValue: 0,
          admin: {
            description: {
              en: 'Lower numbers appear first',
              zh: '数字越小越靠前',
            },
          },
        },
      ],
    },
  ],
}
