/**
 * SiteConfig Global
 *
 * Site-wide configuration (Singleton)
 *
 * Features:
 * - Site name, logo, favicon
 * - SEO defaults
 * - Captcha configuration
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
    description: {
      en: 'Site-wide configuration settings',
      zh: '全站配置设置',
    },
  },
  // versions: true,
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
          label: {
            en: 'Basic Info',
            zh: '基本信息',
          },
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              localized: true,
              label: {
                en: 'Site Name',
                zh: '站点名称',
              },
              admin: {
                description: {
                  en: 'The name of your website',
                  zh: '您的网站名称',
                },
              },
            },
            {
              name: 'siteTagline',
              type: 'text',
              localized: true,
              label: {
                en: 'Site Tagline',
                zh: '站点标语',
              },
              admin: {
                description: {
                  en: 'A short tagline or slogan for your site',
                  zh: '网站的简短标语或口号',
                },
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Logo',
                zh: '标志',
              },
              admin: {
                description: {
                  en: 'Site logo (SVG or PNG recommended)',
                  zh: '网站标志（建议使用 SVG 或 PNG）',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Favicon',
                zh: '网站图标',
              },
              admin: {
                description: {
                  en: 'Browser tab icon (ICO or PNG, 32x32px recommended)',
                  zh: '浏览器标签图标（建议 ICO 或 PNG，32x32 像素）',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 2: SEO Defaults
        // ----------------------------------------------------------
        {
          label: {
            en: 'SEO Defaults',
            zh: 'SEO 默认值',
          },
          fields: [
            {
              name: 'defaultMetaTitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Default Meta Title',
                zh: '默认 Meta 标题',
              },
              admin: {
                description: {
                  en: 'Default title used when no specific title is set',
                  zh: '未设置特定标题时使用的默认标题',
                },
              },
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Default Meta Description',
                zh: '默认 Meta 描述',
              },
              admin: {
                description: {
                  en: 'Default description used when no specific description is set',
                  zh: '未设置特定描述时使用的默认描述',
                },
              },
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Default OG Image',
                zh: '默认分享图片',
              },
              admin: {
                description: {
                  en: 'Default image for social media sharing (1200x630px recommended)',
                  zh: '社交媒体分享的默认图片（建议 1200x630 像素）',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: {
                en: 'Google Analytics ID',
                zh: 'Google Analytics ID',
              },
              admin: {
                description: {
                  en: 'e.g., G-XXXXXXXXXX or UA-XXXXXXXXX-X',
                  zh: '例如：G-XXXXXXXXXX 或 UA-XXXXXXXXX-X',
                },
              },
            },
            {
              name: 'googleTagManagerId',
              type: 'text',
              label: {
                en: 'Google Tag Manager ID',
                zh: 'Google Tag Manager ID',
              },
              admin: {
                description: {
                  en: 'e.g., GTM-XXXXXXX',
                  zh: '例如：GTM-XXXXXXX',
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 3: Captcha (Cloudflare Turnstile)
        // ----------------------------------------------------------
        {
          label: {
            en: 'Captcha',
            zh: '验证码',
          },
          fields: [
            {
              name: 'turnstileEnabled',
              type: 'checkbox',
              label: {
                en: 'Enable Turnstile',
                zh: '启用 Turnstile 验证码',
              },
              defaultValue: false,
              admin: {
                description: {
                  en: 'Enable Cloudflare Turnstile captcha for all forms',
                  zh: '为所有表单启用 Cloudflare Turnstile 验证码',
                },
              },
            },
            {
              name: 'turnstileSiteKey',
              type: 'text',
              label: {
                en: 'Turnstile Site Key',
                zh: 'Turnstile 站点密钥',
              },
              admin: {
                description: {
                  en: 'Get from Cloudflare Dashboard > Turnstile',
                  zh: '从 Cloudflare 控制台 > Turnstile 获取',
                },
                condition: (data) => data?.turnstileEnabled,
              },
            },
            {
              name: 'turnstileSecretKey',
              type: 'text',
              label: {
                en: 'Turnstile Secret Key',
                zh: 'Turnstile 密钥',
              },
              admin: {
                description: {
                  en: 'Keep this secret! Used for server-side verification',
                  zh: '请保密！用于服务端验证',
                },
                condition: (data) => data?.turnstileEnabled,
              },
            },
            {
              name: 'turnstileThreshold',
              type: 'number',
              label: {
                en: 'Submission Threshold',
                zh: '提交阈值',
              },
              defaultValue: 2,
              min: 1,
              max: 10,
              admin: {
                description: {
                  en: 'Show captcha after this many submissions (2 = show after first)',
                  zh: '达到此提交次数后显示验证码（2 = 第一次提交后显示）',
                },
                condition: (data) => data?.turnstileEnabled,
              },
            },
          ],
        },
      ],
    },
  ],
}
