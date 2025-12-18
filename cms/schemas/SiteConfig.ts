/**
 * SiteConfig Model - Basic Site Configuration
 *
 * Features:
 * - Singleton pattern (only one configuration record)
 * - Company basic information (name, logo, favicon)
 * - Security settings (maintenance mode, CAPTCHA)
 * - Default language setting
 *
 * Note: Other configurations have been separated into:
 * - ContactConfig: Contact information
 * - SocialConfig: Social media links
 * - EmailConfig: Email service settings
 * - SeoConfig: SEO and analytics
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
   * Singleton Mode - Only one configuration record is allowed
   */
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🔑 Identifier
    // ==================================================================

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
    // 🏢 Company Information (公司基本信息)
    // ==================================================================

    /**
     * Site Name (网站名称)
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
        description: 'Site logo (recommended: SVG or PNG with transparent background) | 网站标志',
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
        description: 'Site icon (recommended: 32x32px or 64x64px PNG/ICO) | 网站图标',
      },
    }),

    // ==================================================================
    // 🌍 Language Setting (语言设置)
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

    // ==================================================================
    // 🔒 Security Settings (安全设置)
    // ==================================================================

    /**
     * Maintenance Mode (维护模式)
     */
    maintenanceMode: checkbox({
      defaultValue: false,
      label: 'Maintenance Mode (维护模式)',
      ui: {
        description: 'Enable maintenance mode (displays maintenance page to visitors) | 启用维护模式',
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
    // 🕐 Timestamps
    // ==================================================================

    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation === 'update' && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, 'update', 'SiteConfig', item, undefined, originalItem)
      }
    },
  },

  access: {
    operation: {
      query: () => true,
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      // Allow super admin to delete (for resetting config)
      delete: ({ session }) => session?.data?.isAdmin === true,
    },
  },

  ui: {
    labelField: 'identifier',
    label: 'Site Config | 站点基础配置',
    singular: 'Site Config | 站点基础配置',
    plural: 'Site Config | 站点基础配置',
    description: 'Basic site settings (company info, security) | 基础站点设置（公司信息、安全）',
  },
})
