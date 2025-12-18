/**
 * ContactConfig Model - Contact Information Configuration
 *
 * Features:
 * - Singleton pattern (only one configuration record)
 * - Company contact details (email, phone, WhatsApp, WeChat)
 * - Address information
 *
 * Separated from SiteConfig for better organization
 */

import { list } from '@keystone-6/core'
import { text, timestamp } from '@keystone-6/core/fields'

export const ContactConfig = list({
  /**
   * Singleton Mode - Only one configuration record is allowed
   */
  isSingleton: true,

  fields: {
    // ==================================================================
    // 🔑 Identifier
    // ==================================================================

    identifier: text({
      defaultValue: 'contact-config',
      validation: { isRequired: true },
      label: 'Config Identifier (配置标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Internal identifier (auto-generated) | 内部标识符（自动生成）',
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
     */
    address: text({
      label: 'Address (公司地址)',
      ui: {
        displayMode: 'textarea',
        description: 'Company physical address | 公司实际地址',
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
        await logActivity(context, 'update', 'ContactConfig', item, undefined, originalItem)
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
    label: 'Contact Config | 联系信息配置',
    singular: 'Contact Config | 联系信息配置',
    plural: 'Contact Config | 联系信息配置',
    description: 'Company contact information settings | 公司联系信息设置',
  },
})
