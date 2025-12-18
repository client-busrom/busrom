/**
 * SocialConfig Model - Social Media Links Configuration
 *
 * Features:
 * - Singleton pattern (only one configuration record)
 * - Social media platform URLs
 *
 * Separated from SiteConfig for better organization
 */

import { list } from '@keystone-6/core'
import { text, timestamp } from '@keystone-6/core/fields'

export const SocialConfig = list({
  /**
   * Singleton Mode - Only one configuration record is allowed
   */
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🔑 Identifier
    // ==================================================================

    identifier: text({
      defaultValue: 'social-config',
      validation: { isRequired: true },
      label: 'Config Identifier (配置标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Internal identifier (auto-generated) | 内部标识符（自动生成）',
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

    /**
     * TikTok URL
     */
    tiktokUrl: text({
      label: 'TikTok URL',
      ui: {
        description: 'TikTok profile URL | TikTok 主页链接',
      },
    }),

    /**
     * Pinterest URL
     */
    pinterestUrl: text({
      label: 'Pinterest URL',
      ui: {
        description: 'Pinterest profile URL | Pinterest 主页链接',
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
        await logActivity(context, 'update', 'SocialConfig', item, undefined, originalItem)
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
    label: 'Social Config | 社交媒体配置',
    singular: 'Social Config | 社交媒体配置',
    plural: 'Social Config | 社交媒体配置',
    description: 'Social media links settings | 社交媒体链接设置',
  },
})
