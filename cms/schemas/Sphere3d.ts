/**
 * Sphere3d Model - 3D Sphere Configuration (3D球体配置)
 *
 * 用途: 首页3D球体区块配置 (暂留字段,后续使用)
 *
 * Features:
 * - Singleton (only one record)
 * - Placeholder for future 3D sphere functionality
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  text,
  select,
  timestamp,
} from '@keystone-6/core/fields'

export const Sphere3d = list({
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      defaultValue: '3D Sphere Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 占位字段
    // ==================================================================

    /**
     * Placeholder Note (占位说明)
     */
    note: text({
      label: 'Note (说明)',
      defaultValue: 'This configuration is reserved for future 3D sphere functionality',
      ui: {
        displayMode: 'textarea',
        description: '此配置为3D球体功能预留,暂不使用',
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
      delete: () => false, // Never allow deletion (singleton)
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
    label: '3D Sphere',
    singular: '3D Sphere',
    plural: '3D Spheres',
    description: '3D球体配置 - Singleton。暂留字段,后续使用。',
    hideCreate: async ({ context }) => {
      const count = await context.query.Sphere3d.count()
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
          console.log(`✅ [Sphere3d] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
