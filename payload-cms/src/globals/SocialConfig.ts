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
    description: {
      en: 'Social media links settings',
      zh: '社交媒体链接设置',
    },
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
        description: {
          en: 'Add social media links with custom icons',
          zh: '添加带有自定义图标的社交媒体链接',
        },
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
            description: {
              en: 'Enter the name of your custom platform',
              zh: '输入您的自定义平台名称',
            },
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
            description: {
              en: 'Full URL to your social profile',
              zh: '社交主页的完整链接',
            },
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
            description: {
              en: 'Optional: Upload a custom icon (SVG or PNG recommended). Leave empty to use default platform icon.',
              zh: '可选：上传自定义图标（建议使用 SVG 或 PNG）。留空则使用默认平台图标。',
            },
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
            description: {
              en: 'Lower number appears first',
              zh: '数字越小越靠前',
            },
          },
        },
      ],
    },
  ],
}
