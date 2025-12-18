/**
 * SiteConfig Global
 *
 * Site-wide configuration (Singleton)
 * Migrated from Keystone SiteConfig schema
 *
 * Features:
 * - Site name, logo, favicon
 * - Contact information
 * - Social media links
 * - SEO defaults
 */

import type { GlobalConfig } from 'payload'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  label: {
    en: 'Site Config',
    zh: '站点配置',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.isAdmin === true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ----------------------------------------------------------
        // Tab 1: Basic Info
        // ----------------------------------------------------------
        {
          label: 'Basic Info | 基本信息',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              localized: true,
              label: 'Site Name | 站点名称',
            },
            {
              name: 'siteTagline',
              type: 'text',
              localized: true,
              label: 'Site Tagline | 站点标语',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo | 标志',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon | 网站图标',
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 2: Contact
        // ----------------------------------------------------------
        {
          label: 'Contact | 联系方式',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              label: 'Contact Email | 联系邮箱',
            },
            {
              name: 'contactPhone',
              type: 'text',
              label: 'Contact Phone | 联系电话',
            },
            {
              name: 'contactAddress',
              type: 'textarea',
              localized: true,
              label: 'Contact Address | 联系地址',
            },
            {
              name: 'googleMapsUrl',
              type: 'text',
              label: 'Google Maps URL | 谷歌地图链接',
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 3: SEO Defaults
        // ----------------------------------------------------------
        {
          label: 'SEO Defaults | SEO默认值',
          fields: [
            {
              name: 'defaultMetaTitle',
              type: 'text',
              localized: true,
              label: 'Default Meta Title | 默认标题',
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              localized: true,
              label: 'Default Meta Description | 默认描述',
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Default OG Image | 默认分享图片',
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics ID',
            },
            {
              name: 'googleTagManagerId',
              type: 'text',
              label: 'Google Tag Manager ID',
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 4: Social Media
        // ----------------------------------------------------------
        {
          label: 'Social Media | 社交媒体',
          fields: [
            {
              name: 'facebook',
              type: 'text',
              label: 'Facebook URL',
            },
            {
              name: 'twitter',
              type: 'text',
              label: 'Twitter/X URL',
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'Instagram URL',
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn URL',
            },
            {
              name: 'youtube',
              type: 'text',
              label: 'YouTube URL',
            },
            {
              name: 'tiktok',
              type: 'text',
              label: 'TikTok URL',
            },
          ],
        },
      ],
    },
  ],
}
