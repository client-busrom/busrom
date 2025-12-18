/**
 * HeroBannerItem Model - Hero Banner Carousel Item (首页大轮播项)
 *
 * 用途: 首页顶部 Hero 轮播的单个项目
 *
 * Features:
 * - Multiple items (max 9)
 * - Each item has: title, 5 features, 4 images
 * - Multilingual support (24 languages)
 * - Draft-Publish workflow
 *
 * Requirements:
 * - features: must have exactly 5 items
 * - images: must have exactly 4 images
 * - Maximum 9 HeroBannerItems can be published
 */

import { list } from '@keystone-6/core'
import {
  json,
  relationship,
  integer,
  select,
  checkbox,
  timestamp,
  text,
} from '@keystone-6/core/fields'

export const HeroBannerItem = list({
  fields: {
    // ==================================================================
    // 📝 内部标识
    // ==================================================================

    /**
     * Internal Label (内部标识) - For display purposes only
     * Auto-generated from order number
     */
    internalLabel: text({
      label: 'Internal Label (内部标识)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '用于页面标题显示的内部标识',
      },
    }),

    // ==================================================================
    // 📝 基础信息
    // ==================================================================

    /**
     * Title (标题)
     *
     * Hero item title in 24 languages
     * Example: "Glass Standoff"
     */
    title: json({
      label: 'Title (标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '轮播项标题，支持24语言。例如: "Glass Standoff"',
      },
    }),

    /**
     * Features (特点)
     *
     * Exactly 5 feature texts in 24 languages
     * Example: [
     *   "Customized Minimalist Modern Glass Standoff",
     *   "Redefining Transparency & Modern Design",
     *   "Invisible Strength",
     *   "Adjustable Flexibility",
     *   "Superior Durability"
     * ]
     */
    feature1: json({
      label: 'Feature 1 (特点1)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '第1个特点，支持24语言',
      },
    }),

    feature2: json({
      label: 'Feature 2 (特点2)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '第2个特点，支持24语言',
      },
    }),

    feature3: json({
      label: 'Feature 3 (特点3)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '第3个特点，支持24语言',
      },
    }),

    feature4: json({
      label: 'Feature 4 (特点4)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '第4个特点，支持24语言',
      },
    }),

    feature5: json({
      label: 'Feature 5 (特点5)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '第5个特点，支持24语言',
      },
    }),

    // ==================================================================
    // 🖼️ 图片 (必须4张)
    // ==================================================================

    /**
     * Images (图片)
     *
     * Exactly 4 images required
     */
    image1: json({
      label: 'Image 1 (图片1) - 必填',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Select an image | 选择一张图片',
      },
    }),

    image2: json({
      label: 'Image 2 (图片2) - 必填',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Select an image | 选择一张图片',
      },
    }),

    image3: json({
      label: 'Image 3 (图片3) - 必填',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Select an image | 选择一张图片',
      },
    }),

    image4: json({
      label: 'Image 4 (图片4) - 必填',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Select an image | 选择一张图片',
      },
    }),

    // ==================================================================
    // 📋 排序与状态
    // ==================================================================

    /**
     * Order (排序)
     *
     * Display order in hero carousel (1-9)
     */
    order: integer({
      validation: { isRequired: true, min: 1, max: 9 },
      defaultValue: 1,
      label: 'Order (排序)',
      ui: {
        description: '轮播顺序 (1-9)，数字越小越靠前',
      },
    }),

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
        description: '只有已发布的项目会在前端显示',
      },
    }),

    /**
     * Enabled (启用)
     */
    enabled: checkbox({
      defaultValue: true,
      label: 'Enabled (启用)',
      ui: {
        description: '临时禁用此项，不删除数据',
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

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

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
      delete: ({ session }) => !!session,
    },
    // 前端只能看到已发布且启用的项目
    filter: {
      query: ({ session }) => {
        if (session) return true
        return {
          status: { equals: 'PUBLISHED' },
          enabled: { equals: true },
        }
      },
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    labelField: 'internalLabel',
    listView: {
      initialColumns: ['order', 'status', 'enabled', 'publishedAt'],
      initialSort: { field: 'order', direction: 'ASC' },
      pageSize: 20,
    },
    label: 'Hero Banner Items | 主横幅轮播',
    singular: 'Hero Banner Item | 主横幅项',
    plural: 'Hero Banner Items | 主横幅轮播',
    description: 'Hero 轮播项 - 最多9项。每项必须有标题、5个特点、4张图片。',
  },

  /**
   * Hooks
   */
  hooks: {
    // 自动生成 internalLabel
    resolveInput: async ({ operation, resolvedData, item }) => {
      // Generate internalLabel from order
      if (resolvedData.order !== undefined) {
        resolvedData.internalLabel = `Hero Banner Item #${resolvedData.order}`
      } else if (operation === 'create' && !resolvedData.internalLabel) {
        resolvedData.internalLabel = `Hero Banner Item #${resolvedData.order || 1}`
      } else if (operation === 'update' && item && !resolvedData.internalLabel) {
        resolvedData.internalLabel = `Hero Banner Item #${item.order}`
      }

      // 发布时更新发布时间
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        if (!wasPublished) {
          resolvedData.publishedAt = new Date()
          console.log(`✅ [HeroBannerItem] Publishing item: ${item?.title || 'unknown'}`)
        }
      }

      return resolvedData
    },

    // 验证必填字段
    validateInput: async ({ resolvedData, addValidationError, operation, context, item }) => {
      // 创建时验证必填字段
      if (operation === 'create') {
        // 验证标题
        if (!resolvedData.title || Object.keys(resolvedData.title).length === 0) {
          addValidationError('Title is required | 标题为必填项')
        }

        // 验证5个特点
        const features = [
          resolvedData.feature1,
          resolvedData.feature2,
          resolvedData.feature3,
          resolvedData.feature4,
          resolvedData.feature5,
        ]
        features.forEach((feature, index) => {
          if (!feature || Object.keys(feature).length === 0) {
            addValidationError(`Feature ${index + 1} is required | 特点${index + 1}为必填项`)
          }
        })

        // 验证4张图片
        const images = [
          resolvedData.image1,
          resolvedData.image2,
          resolvedData.image3,
          resolvedData.image4,
        ]
        images.forEach((image, index) => {
          if (!image) {
            addValidationError(`Image ${index + 1} is required | 图片${index + 1}为必填项`)
          }
        })
      }

      // 验证不超过9个已发布项目
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const publishedCount = await context.query.HeroBannerItem.count({
          where: {
            status: { equals: 'PUBLISHED' },
            enabled: { equals: true },
            id: { not: { equals: item.id } }, // 排除当前项
          },
        })

        if (publishedCount >= 9) {
          addValidationError('Maximum 9 published items allowed | 最多只能发布9个轮播项')
        }
      }
    },
  },
})
