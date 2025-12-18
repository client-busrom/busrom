/**
 * OemOdm Model - OEM/ODM Configuration (OEM/ODM配置)
 *
 * 用途: 首页OEM/ODM区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Two sections: OEM and ODM
 * - Each section has: title, bgImage, image, description (array)
 * - Multilingual support (24 languages)
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  json,
  text,
  select,
  timestamp,
} from '@keystone-6/core/fields'

export const OemOdm = list({
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      defaultValue: 'OEM/ODM Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 OEM 部分
    // ==================================================================

    /**
     * OEM Title (OEM标题)
     */
    oemTitle: json({
      label: 'OEM - Title (OEM标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "OEM"',
      },
    }),

    /**
     * OEM Background Image (OEM背景图)
     */
    oemBgImage: json({
      label: 'OEM - Background Image (OEM背景图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'OEM部分的背景图片 - 选择图片后将显示预览',
      },
    }),

    /**
     * OEM Main Image (OEM主图)
     */
    oemImage: json({
      label: 'OEM - Main Image (OEM主图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'OEM部分的主图片 - 选择图片后将显示预览',
      },
    }),

    /**
     * OEM Description Line 1 (OEM描述第1行)
     */
    oemDescription1: json({
      label: 'OEM - Description Line 1 (OEM描述第1行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "At Busrom, we work closely with designers, retailers..."',
      },
    }),

    /**
     * OEM Description Line 2 (OEM描述第2行)
     */
    oemDescription2: json({
      label: 'OEM - Description Line 2 (OEM描述第2行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Ready to turn your concept into a producible product?..."',
      },
    }),

    // ==================================================================
    // 📝 ODM 部分
    // ==================================================================

    /**
     * ODM Title (ODM标题)
     */
    odmTitle: json({
      label: 'ODM - Title (ODM标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "ODM"',
      },
    }),

    /**
     * ODM Background Image (ODM背景图)
     */
    odmBgImage: json({
      label: 'ODM - Background Image (ODM背景图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'ODM部分的背景图片 - 选择图片后将显示预览',
      },
    }),

    /**
     * ODM Main Image (ODM主图)
     */
    odmImage: json({
      label: 'ODM - Main Image (ODM主图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'ODM部分的主图片 - 选择图片后将显示预览',
      },
    }),

    /**
     * ODM Description Line 1 (ODM描述第1行)
     */
    odmDescription1: json({
      label: 'ODM - Description Line 1 (ODM描述第1行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Fully Customized Structure & Size & Color"',
      },
    }),

    /**
     * ODM Description Line 2 (ODM描述第2行)
     */
    odmDescription2: json({
      label: 'ODM - Description Line 2 (ODM描述第2行)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Complete Solution - Just The Way You Want Them"',
      },
    }),

    // ==================================================================
    // 📋 发布状态
    // ==================================================================

    /**
     * Status (发布状态)
     */
    status: select({
      type: 'string',
      options: [
        { label: '📝 Draft (草稿)', value: 'DRAFT' },
        { label: '✅ Published (已发布)', value: 'PUBLISHED' },
      ],
      defaultValue: 'DRAFT',
      validation: { isRequired: true },
      label: 'Status (发布状态)',
      ui: {
        displayMode: 'segmented-control',
        description: '只有已发布状态才会在前端显示',
      },
    }),

    /**
     * Published At (发布时间)
     */
    publishedAt: timestamp({
      label: 'Published At (发布时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    // ==================================================================
    // 🕐 时间戳
    // ==================================================================

    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: () => true,
      create: () => true, // Allow creation for seeding
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session, // Allow admins to delete duplicates
    },
    // 前端只能看到已发布状态
    filter: {
      query: ({ session }) => {
        if (session) return true
        return { status: { equals: 'PUBLISHED' } }
      },
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    labelField: 'internalLabel',
    listView: {
      initialColumns: ['status', 'publishedAt', 'updatedAt'],
    },
    label: 'OEM/ODM | OEM/ODM服务',
    singular: 'OEM/ODM | OEM/ODM服务',
    plural: 'OEM/ODM | OEM/ODM服务',
    description: 'OEM/ODM配置 - Singleton。包含OEM和ODM两个部分，各有标题、背景图、主图、2行描述。',
    hideCreate: async ({ context }) => {
      const count = await context.query.OemOdm.count()
      return count >= 1
    },
  },

  /**
   * Hooks
   */
  hooks: {
    // 发布时更新发布时间
    resolveInput: async ({ operation, resolvedData, item }) => {
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        if (!wasPublished) {
          resolvedData.publishedAt = new Date()
          console.log(`✅ [OemOdm] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
