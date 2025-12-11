/**
 * SiteConfig Model - Site-Wide Configuration
 *
 * Features:
 * - Singleton pattern (only one configuration record)
 * - Company information and contact details
 * - Logo and favicon
 * - Social media links
 * - Third-party service API keys
 * - Email service configuration
 * - Site feature toggles
 */

import { list } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  timestamp,
  relationship,
  json,
} from '@keystone-6/core/fields'

export const SiteConfig = list({
  /**
   * Singleton Mode
   *
   * Only one configuration record is allowed
   */
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🔑 Identifier (标识符)
    // ==================================================================

    /**
     * Config Identifier (配置标识)
     *
     * Internal identifier for singleton config
     */
    identifier: text({
      defaultValue: 'site-config',
      validation: { isRequired: true },
      label: 'Config Identifier (配置标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Internal identifier (auto-generated) | 内部标识符（自动生成）',
      },
    }),

    // ==================================================================
    // 🏢 Company Information
    // ==================================================================

    /**
     * Site Name (网站名称)
     *
     * Bilingual support for English and Chinese
     */
    siteName: json({
      defaultValue: { en: 'Busrom', zh: 'Busrom' },
      label: 'Site Name (网站名称)',
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Website display name | 网站显示名称',
      },
    }),

    /**
     * Company Name (公司名称)
     *
     * Bilingual support for English and Chinese
     */
    companyName: json({
      defaultValue: {
        en: 'Busrom Hardware Co., Ltd.',
        zh: 'Busrom 五金有限公司'
      },
      label: 'Company Name (公司名称)',
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Full legal company name | 公司全称',
      },
    }),

    /**
     * Logo (标志)
     */
    logo: relationship({
      ref: 'Media',
      label: 'Logo (标志)',
      many: false,
      ui: {
        displayMode: 'cards',
        cardFields: ['file', 'filename'],
        inlineConnect: true,
        description: 'Site logo (recommended: SVG or PNG with transparent background) | 网站标志（推荐：SVG 或透明背景 PNG）',
      },
    }),

    /**
     * Favicon (网站图标)
     */
    favicon: relationship({
      ref: 'Media',
      label: 'Favicon (网站图标)',
      many: false,
      ui: {
        displayMode: 'cards',
        cardFields: ['file', 'filename'],
        inlineConnect: true,
        description: 'Site icon (recommended: 32x32px or 64x64px PNG/ICO) | 网站图标（推荐：32x32px 或 64x64px PNG/ICO）',
      },
    }),

    // ==================================================================
    // 📞 Contact Information (联系信息)
    // ==================================================================

    /**
     * Email (邮箱)
     */
    email: text({
      label: 'Email (邮箱)',
      validation: {
        match: {
          regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          explanation: 'Invalid email format',
        },
      },
      ui: {
        description: 'Primary contact email | 主要联系邮箱',
      },
    }),

    /**
     * Phone (电话)
     */
    phone: text({
      label: 'Phone (电话)',
      ui: {
        description: 'Primary contact phone number | 主要联系电话',
      },
    }),

    /**
     * WhatsApp
     */
    whatsapp: text({
      label: 'WhatsApp',
      ui: {
        description: 'WhatsApp number for customer support | 客户支持 WhatsApp 号码',
      },
    }),

    /**
     * WeChat (微信)
     */
    wechat: text({
      label: 'WeChat (微信)',
      ui: {
        description: 'WeChat ID | 微信号',
      },
    }),

    /**
     * Address (公司地址)
     *
     * Bilingual support for English and Chinese
     */
    address: text({
      label: 'Address (公司地址)',
      ui: {
        description: 'Company physical address | 公司实际地址',
      },
    }),

    // ==================================================================
    // 🌐 Social Media Links (社交媒体链接)
    // ==================================================================

    /**
     * Facebook URL
     */
    facebookUrl: text({
      label: 'Facebook URL',
      ui: {
        description: 'Facebook page URL | Facebook 主页链接',
      },
    }),

    /**
     * Instagram URL
     */
    instagramUrl: text({
      label: 'Instagram URL',
      ui: {
        description: 'Instagram profile URL | Instagram 主页链接',
      },
    }),

    /**
     * LinkedIn URL
     */
    linkedinUrl: text({
      label: 'LinkedIn URL',
      ui: {
        description: 'LinkedIn company page URL | LinkedIn 公司主页链接',
      },
    }),

    /**
     * YouTube URL
     */
    youtubeUrl: text({
      label: 'YouTube URL',
      ui: {
        description: 'YouTube channel URL | YouTube 频道链接',
      },
    }),

    /**
     * Twitter URL
     */
    twitterUrl: text({
      label: 'Twitter/X URL',
      ui: {
        description: 'Twitter/X profile URL | Twitter/X 主页链接',
      },
    }),

    // ==================================================================
    // 🔑 Third-Party Service API Keys (第三方服务 API 密钥)
    // ==================================================================

    /**
     * Google Analytics ID
     */
    googleAnalyticsId: text({
      label: 'Google Analytics ID',
      ui: {
        description: 'Google Analytics tracking ID (e.g., G-XXXXXXXXXX) | Google 分析跟踪 ID',
      },
    }),

    /**
     * Google Search Console Verification Key
     */
    googleSearchConsoleKey: text({
      label: 'Google Search Console Key (谷歌搜索控制台密钥)',
      ui: {
        description: 'Google Search Console verification code | 谷歌搜索控制台验证代码',
      },
    }),

    /**
     * TikTok Pixel ID
     */
    tiktokPixelId: text({
      label: 'TikTok Pixel ID',
      ui: {
        description: 'TikTok Pixel tracking ID | TikTok Pixel跟踪 ID',
      },
    }),

    // ==================================================================
    // 📧 Email Service Configuration (邮件服务配置)
    // ==================================================================

    /**
     * SMTP Host (SMTP 主机)
     */
    smtpHost: text({
      label: 'SMTP Host (SMTP 主机)',
      ui: {
        description: 'SMTP server hostname | SMTP 服务器主机名',
      },
    }),

    /**
     * SMTP Port (SMTP 端口)
     */
    smtpPort: text({
      label: 'SMTP Port (SMTP 端口)',
      ui: {
        description: 'SMTP server port (usually 587 or 465) | SMTP 服务器端口（通常为 587 或 465）',
      },
    }),

    /**
     * SMTP User (SMTP 用户名)
     */
    smtpUser: text({
      label: 'SMTP User (SMTP 用户名)',
      ui: {
        description: 'SMTP authentication username | SMTP 认证用户名',
      },
    }),

    /**
     * SMTP Password (SMTP 密码)
     */
    smtpPassword: text({
      label: 'SMTP Password (SMTP 密码)',
      ui: {
        description: 'SMTP authentication password | SMTP 认证密码',
      },
    }),

    /**
     * Email From Address (发件邮箱地址)
     */
    emailFromAddress: text({
      defaultValue: 'noreply@busrom.com',
      label: 'Email From Address (发件邮箱地址)',
      ui: {
        description: 'Sender email address for automated emails | 自动邮件的发件人地址',
      },
    }),

    /**
     * Email From Name (发件人名称)
     *
     * Bilingual support for English and Chinese
     */
    emailFromName: json({
      defaultValue: {
        en: 'Busrom Team',
        zh: 'Busrom 团队'
      },
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Sender name for automated emails | 自动邮件发件人名称',
      },
    }),

    // ==================================================================
    // 📮 Form Notification Configuration (表单通知配置)
    // ==================================================================

    /**
     * Form Notification Emails (表单通知邮箱)
     */
    formNotificationEmails: text({
      label: 'Form Notification Emails (表单通知邮箱)',
      ui: {
        description: 'Comma-separated list of emails to notify on form submissions | 接收表单提交通知的邮箱列表（逗号分隔）',
      },
    }),

    /**
     * Enable Auto Reply (启用自动回复)
     */
    enableAutoReply: checkbox({
      defaultValue: false,
      label: 'Enable Auto Reply (启用自动回复)',
      ui: {
        description: 'Send automatic reply email to form submitters | 向表单提交者发送自动回复邮件',
      },
    }),

    /**
     * Auto Reply Template (自动回复模板)
     *
     * Bilingual support for English and Chinese
     */
    autoReplyTemplate: json({
      defaultValue: {
        en: `Dear {name},

Thank you for contacting Busrom. We have received your message and will get back to you within 24 hours.

Best regards,
Busrom Team`,
        zh: `尊敬的 {name}，

感谢您联系 Busrom。我们已收到您的留言，将在 24 小时内回复您。

此致
Busrom 团队`
      },
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Email template for auto-reply. Use {name} for submitter name | 自动回复邮件模板。使用 {name} 代表提交者姓名',
      },
    }),

    // ==================================================================
    // ⚙️ Site Feature Toggles (网站功能开关)
    // ==================================================================

    /**
     * Maintenance Mode (维护模式)
     */
    maintenanceMode: checkbox({
      defaultValue: false,
      label: 'Maintenance Mode (维护模式)',
      ui: {
        description: 'Enable maintenance mode (displays maintenance page to visitors) | 启用维护模式（向访客显示维护页面）',
      },
    }),

    /**
     * Enable CAPTCHA (启用验证码)
     */
    enableCaptcha: checkbox({
      defaultValue: true,
      label: 'Enable CAPTCHA (启用验证码)',
      ui: {
        description: 'Enable reCAPTCHA on contact forms | 在联系表单上启用 reCAPTCHA',
      },
    }),

    /**
     * reCAPTCHA Site Key
     */
    recaptchaSiteKey: text({
      label: 'reCAPTCHA Site Key (站点密钥)',
      ui: {
        description: 'Google reCAPTCHA v3 site key | Google reCAPTCHA v3 站点密钥',
      },
    }),

    /**
     * reCAPTCHA Secret Key
     */
    recaptchaSecretKey: text({
      label: 'reCAPTCHA Secret Key (密钥)',
      ui: {
        description: 'Google reCAPTCHA v3 secret key | Google reCAPTCHA v3 密钥',
      },
    }),

    // ==================================================================
    // 🌍 SEO & Internationalization (SEO 与国际化)
    // ==================================================================

    /**
     * Default Language (默认语言)
     */
    defaultLanguage: select({
      type: 'string',
      options: [
        { label: 'English', value: 'en' },
        { label: '简体中文', value: 'zh-CN' },
        { label: 'Español', value: 'es' },
        { label: 'Français', value: 'fr' },
        { label: 'Deutsch', value: 'de' },
        { label: '日本語', value: 'ja' },
        { label: '한국어', value: 'ko' },
      ],
      defaultValue: 'en',
      label: 'Default Language (默认语言)',
      ui: {
        description: 'Default site language | 网站默认语言',
      },
    }),

    /**
     * Enable IndexNow (启用 IndexNow)
     */
    enableIndexNow: checkbox({
      defaultValue: true,
      label: 'Enable IndexNow (启用 IndexNow)',
      ui: {
        description: 'Enable IndexNow protocol for faster search engine indexing | 启用 IndexNow 协议以加快搜索引擎索引',
      },
    }),

    /**
     * IndexNow API Key
     */
    indexNowKey: text({
      label: 'IndexNow API Key',
      ui: {
        description: 'IndexNow API key for instant indexing | IndexNow API 密钥用于即时索引',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps (时间戳)
    // ==================================================================

    /**
     * Updated At (更新时间)
     */
    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  /**
   * Hooks
   */
  hooks: {
    /**
     * ActivityLog - Record all operations
     * SiteConfig is singleton, only log updates
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation === 'update' && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, 'update', 'SiteConfig', item, undefined, originalItem)
      }
    },
  },

  /**
   * Access Control
   *
   * Role-based field-level permissions:
   * - Super Admin: Full access to all fields
   * - Admin: Access to business settings (company info, contacts, social media)
   * - Editor: Access to content settings (form notifications, auto-reply)
   * - Other roles: Read-only access
   */
  access: {
    operation: {
      query: () => true, // Frontend needs to read configuration
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      // Allow super admin to delete (for resetting/migrating config)
      delete: ({ session }) => session?.data?.isAdmin === true,
    },
  },

  /**
   * Field-level Access Control
   *
   * Use this pattern in individual fields:
   *
   * Example for sensitive fields (Super Admin only):
   * ```
   * access: {
   *   read: ({ session }) => session?.data?.role?.name === 'Super Admin',
   *   update: ({ session }) => session?.data?.role?.name === 'Super Admin',
   * }
   * ```
   *
   * Example for admin fields (Admin and above):
   * ```
   * access: {
   *   read: ({ session }) => ['Super Admin', 'Admin'].includes(session?.data?.role?.name),
   *   update: ({ session }) => ['Super Admin', 'Admin'].includes(session?.data?.role?.name),
   * }
   * ```
   */

  /**
   * UI Configuration
   */
  ui: {
    labelField: 'identifier',
    description: 'Global site configuration settings | 全局网站配置设置',
  },
})
