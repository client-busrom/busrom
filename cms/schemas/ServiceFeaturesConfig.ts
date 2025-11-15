/**
 * ServiceFeaturesConfig Model - Service Features Configuration (服务特点配置)
 *
 * 用途: 首页"Premium Architectural Glass Hardware"区块配置
 *
 * Features:
 * - Singleton (only one record)
 * - Title + Subtitle
 * - Exactly 5 features (fixed, cannot add/remove)
 * - Each feature: title, shortTitle, description, images
 * - Image requirements: [4, 2, 6, 2, 2] images respectively
 * - Multilingual support (24 languages)
 * - Draft-Publish workflow
 */

import { list } from '@keystone-6/core'
import {
  json,
  select,
  timestamp,
  text,
} from '@keystone-6/core/fields'

export const ServiceFeaturesConfig = list({
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      defaultValue: 'Service Features Configuration',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 主标题和副标题
    // ==================================================================

    /**
     * Title (主标题)
     *
     * Example: "Premium Architectural Glass Hardware"
     */
    title: json({
      label: 'Title (主标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '服务特点区块的主标题，支持24语言',
      },
    }),

    /**
     * Subtitle (副标题)
     *
     * Example: "Fully Customized Glass Hardware by Busrom..."
     */
    subtitle: json({
      label: 'Subtitle (副标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '服务特点区块的副标题，支持24语言',
      },
    }),

    // ==================================================================
    // 🎯 Feature 1: Any Size (4张图片)
    // ==================================================================

    feature1Title: json({
      label: 'Feature 1 - Title (特点1标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Any Size, Any Structure, Any Shape"',
      },
    }),

    feature1ShortTitle: json({
      label: 'Feature 1 - Short Title (特点1短标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "Any Size"',
      },
    }),

    feature1Description: json({
      label: 'Feature 1 - Description (特点1描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '特点1的详细描述',
      },
    }),

    feature1Image1: json({
      label: 'Feature 1 - Image 1 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature1Image2: json({
      label: 'Feature 1 - Image 2 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature1Image3: json({
      label: 'Feature 1 - Image 3 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature1Image4: json({
      label: 'Feature 1 - Image 4 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // ==================================================================
    // 🎯 Feature 2: Custom (2张图片)
    // ==================================================================

    feature2Title: json({
      label: 'Feature 2 - Title (特点2标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature2ShortTitle: json({
      label: 'Feature 2 - Short Title (特点2短标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature2Description: json({
      label: 'Feature 2 - Description (特点2描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature2Image1: json({
      label: 'Feature 2 - Image 1 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature2Image2: json({
      label: 'Feature 2 - Image 2 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // ==================================================================
    // 🎯 Feature 3: (6张图片)
    // ==================================================================

    feature3Title: json({
      label: 'Feature 3 - Title (特点3标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature3ShortTitle: json({
      label: 'Feature 3 - Short Title (特点3短标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature3Description: json({
      label: 'Feature 3 - Description (特点3描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature3Image1: json({
      label: 'Feature 3 - Image 1 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature3Image2: json({
      label: 'Feature 3 - Image 2 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature3Image3: json({
      label: 'Feature 3 - Image 3 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature3Image4: json({
      label: 'Feature 3 - Image 4 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature3Image5: json({
      label: 'Feature 3 - Image 5 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature3Image6: json({
      label: 'Feature 3 - Image 6 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // ==================================================================
    // 🎯 Feature 4: (2张图片)
    // ==================================================================

    feature4Title: json({
      label: 'Feature 4 - Title (特点4标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature4ShortTitle: json({
      label: 'Feature 4 - Short Title (特点4短标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature4Description: json({
      label: 'Feature 4 - Description (特点4描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature4Image1: json({
      label: 'Feature 4 - Image 1 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature4Image2: json({
      label: 'Feature 4 - Image 2 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // ==================================================================
    // 🎯 Feature 5: (2张图片)
    // ==================================================================

    feature5Title: json({
      label: 'Feature 5 - Title (特点5标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature5ShortTitle: json({
      label: 'Feature 5 - Short Title (特点5短标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature5Description: json({
      label: 'Feature 5 - Description (特点5描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    feature5Image1: json({
      label: 'Feature 5 - Image 1 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    feature5Image2: json({
      label: 'Feature 5 - Image 2 (必填)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
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
      delete: () => true, // Temporarily allow deletion for cleanup
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
    label: 'Service Features Config',
    singular: 'Service Features Config',
    plural: 'Service Features Configs',
    description: 'Service Features 配置 - Singleton，固定5个特点，图片数量: [4,2,6,2,2]',
    hideCreate: async ({ context }) => {
      const count = await context.query.ServiceFeaturesConfig.count()
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
          console.log(`✅ [ServiceFeaturesConfig] Publishing configuration`)
        }
      }
      return resolvedData
    },
  },
})
