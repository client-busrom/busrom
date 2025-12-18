/**
 * SocialConfig Global - Social Media Links Configuration
 *
 * Features:
 * - Flexible social media links array
 * - Support for common platforms with preset icons
 * - Custom platform support
 */

import type { GlobalConfig } from 'payload'

export const SocialConfig: GlobalConfig = {
  slug: 'social-config',
  label: {
    en: 'Social Config',
    zh: '社交媒体配置',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
    description: 'Social media links settings',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'socialLinks',
      type: 'array',
      label: {
        en: 'Social Links',
        zh: '社交链接',
      },
      admin: {
        description: 'Add social media links with custom icons',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: {
            en: 'Platform',
            zh: '平台',
          },
          required: true,
          admin: {
            components: {
              afterInput: ['@/components/fields/SocialPlatformIcon'],
            },
          },
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Pinterest', value: 'pinterest' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Telegram', value: 'telegram' },
            { label: 'Discord', value: 'discord' },
            { label: 'WeChat | 微信', value: 'wechat' },
            { label: 'Weibo | 微博', value: 'weibo' },
            { label: 'Douyin | 抖音', value: 'douyin' },
            { label: 'Xiaohongshu | 小红书', value: 'xiaohongshu' },
            { label: 'Bilibili | B站', value: 'bilibili' },
            { label: 'Custom | 自定义', value: 'custom' },
          ],
        },
        {
          name: 'customName',
          type: 'text',
          label: {
            en: 'Custom Platform Name',
            zh: '自定义平台名称',
          },
          admin: {
            condition: (data, siblingData) => siblingData?.platform === 'custom',
            description: 'Enter the name of your custom platform',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: {
            en: 'URL',
            zh: '链接',
          },
          required: true,
          admin: {
            description: 'Full URL to your social profile',
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Custom Icon',
            zh: '自定义图标',
          },
          admin: {
            description: 'Optional: Upload a custom icon (SVG or PNG recommended). Leave empty to use default platform icon.',
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'order',
          type: 'number',
          label: {
            en: 'Display Order',
            zh: '显示顺序',
          },
          defaultValue: 0,
          admin: {
            description: 'Lower number appears first',
          },
        },
      ],
    },
  ],
}
