/**
 * ContactConfig Global - Contact Information Configuration
 *
 * Features:
 * - Company contact details (email, phone, WhatsApp, WeChat)
 * - Address information
 */

import type { GlobalConfig } from 'payload'

export const ContactConfig: GlobalConfig = {
  slug: 'contact-config',
  label: {
    en: 'Contact Config',
    zh: '联系信息配置',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
    description: 'Company contact information settings',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // ==================================================================
    // Contact Information
    // ==================================================================
    {
      name: 'email',
      type: 'email',
      label: {
        en: 'Email',
        zh: '邮箱',
      },
      admin: {
        description: 'Primary contact email',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        en: 'Phone',
        zh: '电话',
      },
      admin: {
        description: 'Primary contact phone number',
      },
    },
    {
      name: 'whatsapp',
      type: 'text',
      label: {
        en: 'WhatsApp',
        zh: 'WhatsApp',
      },
      admin: {
        description: 'WhatsApp number for customer support',
      },
    },
    {
      name: 'wechat',
      type: 'text',
      label: {
        en: 'WeChat',
        zh: '微信',
      },
      admin: {
        description: 'WeChat ID',
      },
    },
    {
      name: 'address',
      type: 'textarea',
      label: {
        en: 'Address',
        zh: '公司地址',
      },
      admin: {
        description: 'Company physical address',
      },
    },
  ],
}
