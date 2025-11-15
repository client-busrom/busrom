/**
 * BrandAnalysis Model - Brand Analysis Configuration (品牌分析配置)
 *
 * 用途: 首页品牌分析区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Brand name analysis (Bus + rom)
 * - 3 centers (Brand, Project, Service)
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

export const BrandAnalysis = list({
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      defaultValue: 'Brand Analysis Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 品牌名称分析
    // ==================================================================

    /**
     * Analysis Title Part 1 (分析标题第1部分)
     * Example: "Bus"
     */
    analysisTitle: json({
      label: 'Analysis Title Part 1 (分析标题第1部分)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Bus"',
      },
    }),

    /**
     * Analysis Title Part 2 (分析标题第2部分)
     * Example: "rom"
     */
    analysisTitle2: json({
      label: 'Analysis Title Part 2 (分析标题第2部分)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "rom"',
      },
    }),

    /**
     * Analysis Text Part 1 (分析文本第1部分)
     * Example: "Bus--Buffer & Bridge"
     */
    analysisText: json({
      label: 'Analysis Text Part 1 (分析文本第1部分)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Bus--Buffer & Bridge"',
      },
    }),

    /**
     * Analysis Text Part 2 (分析文本第2部分)
     * Example: "rom--Room & Space"
     */
    analysisText2: json({
      label: 'Analysis Text Part 2 (分析文本第2部分)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "rom--Room & Space"',
      },
    }),

    // ==================================================================
    // 📝 三个中心 (Brand/Project/Service Centers)
    // ==================================================================

    /**
     * Brand Center Title (品牌中心标题)
     */
    brandCenterTitle: json({
      label: 'Brand Center - Title (品牌中心标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Brand Center"',
      },
    }),

    /**
     * Brand Center Description (品牌中心描述)
     */
    brandCenterDescription: json({
      label: 'Brand Center - Description (品牌中心描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '品牌中心的详细描述',
      },
    }),

    /**
     * Brand Center Large Image (品牌中心大图)
     */
    brandCenterLargeImage: json({
      label: 'Brand Center - Large Image (品牌中心大图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '品牌中心的大图 - 选择图片后将显示预览',
      },
    }),

    /**
     * Brand Center Small Image (品牌中心小图)
     */
    brandCenterSmallImage: json({
      label: 'Brand Center - Small Image (品牌中心小图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '品牌中心的小图 - 选择图片后将显示预览',
      },
    }),

    /**
     * Project Center Title (项目中心标题)
     */
    projectCenterTitle: json({
      label: 'Project Center - Title (项目中心标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Project Center"',
      },
    }),

    /**
     * Project Center Description (项目中心描述)
     */
    projectCenterDescription: json({
      label: 'Project Center - Description (项目中心描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '项目中心的详细描述',
      },
    }),

    /**
     * Project Center Large Image (项目中心大图)
     */
    projectCenterLargeImage: json({
      label: 'Project Center - Large Image (项目中心大图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '项目中心的大图 - 选择图片后将显示预览',
      },
    }),

    /**
     * Project Center Small Image (项目中心小图)
     */
    projectCenterSmallImage: json({
      label: 'Project Center - Small Image (项目中心小图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '项目中心的小图 - 选择图片后将显示预览',
      },
    }),

    /**
     * Service Center Title (服务中心标题)
     */
    serviceCenterTitle: json({
      label: 'Service Center - Title (服务中心标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Service Center"',
      },
    }),

    /**
     * Service Center Description (服务中心描述)
     */
    serviceCenterDescription: json({
      label: 'Service Center - Description (服务中心描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '服务中心的详细描述',
      },
    }),

    /**
     * Service Center Large Image (服务中心大图)
     */
    serviceCenterLargeImage: json({
      label: 'Service Center - Large Image (服务中心大图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '服务中心的大图 - 选择图片后将显示预览',
      },
    }),

    /**
     * Service Center Small Image (服务中心小图)
     */
    serviceCenterSmallImage: json({
      label: 'Service Center - Small Image (服务中心小图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '服务中心的小图 - 选择图片后将显示预览',
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
        { label: '✅ Published (已发布)', value: 'PUBLISHED' },
        { label: '📝 Draft (草稿)', value: 'DRAFT' },
        { label: '🗄️ Archived (已归档)', value: 'ARCHIVED' },
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
    label: 'Brand Analysis',
    singular: 'Brand Analysis',
    plural: 'Brand Analyses',
    description: '品牌分析配置 - Singleton。包含品牌名称分析和3个中心介绍。',
    hideCreate: async ({ context }) => {
      const count = await context.query.BrandAnalysis.count()
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
          console.log(`✅ [BrandAnalysis] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
