/**
 * SeoConfig Model - SEO & Analytics Configuration
 *
 * Features:
 * - Singleton pattern (only one configuration record)
 * - Google Analytics & Search Console
 * - IndexNow protocol for search engine notification
 * - Smart ping rate limiting
 *
 * Separated from SiteConfig for better organization
 */

import { list } from '@keystone-6/core'
import { text, checkbox, select, timestamp } from '@keystone-6/core/fields'

export const SeoConfig = list({
  /**
   * Singleton Mode - Only one configuration record is allowed
   */
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🔑 Identifier
    // ==================================================================

    identifier: text({
      defaultValue: 'seo-config',
      validation: { isRequired: true },
      label: 'Config Identifier (配置标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Internal identifier (auto-generated) | 内部标识符（自动生成）',
      },
    }),

    // ==================================================================
    // 📊 Analytics (数据分析)
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
     * Bing Webmaster Verification Key
     */
    bingWebmasterKey: text({
      label: 'Bing Webmaster Key (必应站长密钥)',
      ui: {
        description: 'Bing Webmaster Tools verification code | 必应站长工具验证代码',
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

    /**
     * Facebook Pixel ID
     */
    facebookPixelId: text({
      label: 'Facebook Pixel ID',
      ui: {
        description: 'Facebook Pixel tracking ID | Facebook Pixel跟踪 ID',
      },
    }),

    // ==================================================================
    // 🔔 Search Engine Ping Configuration (搜索引擎 Ping 配置)
    // ==================================================================

    /**
     * Enable IndexNow (启用 IndexNow)
     */
    enableIndexNow: checkbox({
      defaultValue: false,
      label: 'Enable IndexNow (启用 IndexNow)',
      ui: {
        description: 'Enable IndexNow protocol for faster search engine indexing (Bing/Yandex/Seznam) | 启用 IndexNow 协议以加快搜索引擎索引（Bing/Yandex/Seznam）',
      },
    }),

    /**
     * IndexNow API Key
     */
    indexNowKey: text({
      label: 'IndexNow API Key',
      ui: {
        description: 'IndexNow API key for instant indexing (create at indexnow.org) | IndexNow API 密钥用于即时索引（在 indexnow.org 创建）',
      },
    }),

    /**
     * Ping Mode (Ping 模式)
     */
    seoPingMode: select({
      type: 'string',
      options: [
        { label: 'Disabled (关闭)', value: 'disabled' },
        { label: 'Manual Only (仅手动)', value: 'manual' },
        { label: 'Auto - Important Content (自动-重要内容)', value: 'auto_important' },
        { label: 'Auto - All Content (自动-所有内容)', value: 'auto_all' },
      ],
      defaultValue: 'disabled',
      label: 'SEO Ping Mode (SEO Ping 模式)',
      ui: {
        description: 'When to notify search engines: Disabled=never, Manual=button only, Auto-Important=Blog/Product only, Auto-All=all content | 何时通知搜索引擎',
      },
    }),

    /**
     * Ping Rate Limit (Ping 频率限制)
     */
    seoPingRateLimit: select({
      type: 'string',
      options: [
        { label: 'No limit (无限制)', value: '0' },
        { label: '1 minute (1分钟)', value: '60' },
        { label: '5 minutes (5分钟)', value: '300' },
        { label: '15 minutes (15分钟)', value: '900' },
        { label: '1 hour (1小时)', value: '3600' },
        { label: '6 hours (6小时)', value: '21600' },
        { label: '24 hours (24小时)', value: '86400' },
      ],
      defaultValue: '3600',
      label: 'SEO Ping Rate Limit (SEO Ping 频率限制)',
      ui: {
        description: 'Minimum interval between automatic pings (prevents being blocked) | 自动 Ping 的最小间隔时间（防止被拉黑）',
      },
    }),

    /**
     * Last Ping Time (上次 Ping 时间)
     */
    lastSeoPingTime: timestamp({
      label: 'Last SEO Ping Time (上次 SEO Ping 时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Last time search engines were notified (auto-updated) | 上次通知搜索引擎的时间（自动更新）',
      },
    }),

    /**
     * Ping Queue Count (Ping 队列数量)
     */
    seoPingQueueCount: text({
      defaultValue: '0',
      label: 'SEO Ping Queue Count (SEO Ping 队列数量)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Number of URLs waiting to be submitted | 等待提交的 URL 数量',
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
        await logActivity(context, 'update', 'SeoConfig', item, undefined, originalItem)
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
    label: 'SEO Config | SEO配置',
    singular: 'SEO Config',
    plural: 'SEO Config',
    description: 'SEO, analytics and search engine notification settings | SEO、数据分析和搜索引擎通知设置',
  },
})
