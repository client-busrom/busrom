/**
 * HomeContent Model - Homepage Content Configuration (首页内容配置)
 *
 * 用途: 存储首页各个动态区块的配置数据，支持17个不同的内容区块，支持24语言的多语言内容
 *
 * Features:
 * - Configure different sections of the homepage
 * - Multilingual content storage (24 languages)
 * - Enable/disable sections
 * - Reorder sections dynamically
 *
 * Section types (17 sections):
 * 1. Hero Banner - 首页大轮播 (9个产品系列轮播，每个4张图片)
 * 2. Product Series Carousel - 产品系列轮播 (10个产品系列)
 * 3. Service Features - 服务特点 (5个特点，每个多张图片)
 * 4. 3D Sphere - 3D球体展示 (预留)
 * 5. Simple CTA - 简易行动号召 (3张图片)
 * 6. Series Introduction - 系列产品介绍 (8个系列)
 * 7. Featured Products - 精选产品 (10个系列，每个3个产品)
 * 8. Brand Advantages - 品牌优势 (9个优势 + 图标)
 * 9. OEM/ODM - OEM/ODM服务介绍
 * 10. Quote Steps - 获取报价五步曲
 * 11. Main Form - 主表单配置
 * 12. Why Choose Busrom - 为什么选择Busrom (5个原因)
 * 13. Case Studies - 应用案例 (8个案例，从 Application 模型获取)
 * 14. Brand Analysis - 品牌分析 (Bus + rom含义 + 3个中心)
 * 15. Brand Value - 品牌价值体现 (5个价值项)
 * 16. Footer - 页脚配置 (独立的 Footer 模型)
 * 17. Product Series List - 产品系列列表数据 (从 ProductSeries 模型获取)
 *
 * API Documentation:
 * - REST API: /docs/api-contracts/HomeContentApiDocumentation.md
 * - Frontend: GET /api/home?locale=en
 * - Module: GET /api/home/{section}?locale=en
 */

import { list } from '@keystone-6/core'
import {
  select,
  checkbox,
  timestamp,
  integer,
  json,
} from '@keystone-6/core/fields'

export const HomeContent = list({
  fields: {
    // ==================================================================
    // 📝 Section Configuration (区块配置)
    // ==================================================================

    /**
     * Section Type (区块类型)
     *
     * Type of homepage section - 17 different section types
     */
    section: select({
      type: 'string',
      options: [
        { label: 'Hero Banner | 主视觉横幅', value: 'hero_banner' },
        { label: 'Product Series Carousel | 产品系列轮播', value: 'product_series_carousel' },
        { label: 'Service Features | 服务特点', value: 'service_features' },
        { label: '3D Sphere | 3D球体', value: 'sphere_3d' },
        { label: 'Simple CTA | 简单CTA', value: 'simple_cta' },
        { label: 'Series Introduction | 系列介绍', value: 'series_intro' },
        { label: 'Featured Products | 精选产品', value: 'featured_products' },
        { label: 'Brand Advantages | 品牌优势', value: 'brand_advantages' },
        { label: 'OEM/ODM | OEM/ODM服务', value: 'oem_odm' },
        { label: 'Quote Steps | 获取报价五步曲', value: 'quote_steps' },
        { label: 'Main Form | 主表单配置', value: 'main_form' },
        { label: 'Why Choose Busrom | 为什么选择Busrom', value: 'why_choose_busrom' },
        { label: 'Case Studies | 应用案例', value: 'case_studies' },
        { label: 'Brand Analysis | 品牌分析', value: 'brand_analysis' },
        { label: 'Brand Value | 品牌价值', value: 'brand_value' },
      ],
      validation: { isRequired: true },
      isIndexed: 'unique',
      label: 'Section Type (区块类型)',
      ui: {
        displayMode: 'select',
        description: 'Type of homepage section | 首页区块类型',
      },
    }),

    /**
     * Enabled (启用)
     *
     * Whether this section is displayed
     */
    enabled: checkbox({
      defaultValue: true,
      label: 'Enabled (启用)',
      ui: {
        description: 'Show/hide this section on the homepage | 在首页显示/隐藏此区块',
      },
    }),

    /**
     * Order (排序)
     *
     * Display order on homepage (lower numbers appear first)
     */
    order: integer({
      defaultValue: 1,
      validation: {
        min: 1,
        max: 20,
      },
      label: 'Order (排序)',
      ui: {
        description: 'Display order (lower numbers appear first) | 显示顺序(数字越小越靠前)',
      },
    }),

    // ==================================================================
    // 📋 发布状态管理
    // ==================================================================

    /**
     * Status (状态)
     *
     * Draft: 草稿状态，仅在 CMS 中可见
     * Published: 已发布，前端可见
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
        description: '草稿状态不会在前端显示，只有发布后才会对访客可见',
      },
    }),

    /**
     * Published At (发布时间)
     *
     * 记录内容最后一次发布的时间
     */
    publishedAt: timestamp({
      label: 'Published At (发布时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '内容发布到线上的时间',
      },
    }),

    /**
     * Draft Content (草稿内容)
     *
     * 用于暂存未发布的修改
     */
    draftContent: json({
      label: 'Draft Content (草稿内容)',
      defaultValue: null,
      ui: {
        description: '草稿内容，可以随意修改而不影响线上。点击发布后会替换正式内容。',
        createView: { fieldMode: 'hidden' },
      },
    }),

    // ==================================================================
    // 📄 Content Data (内容数据) - 多语言支持
    // ==================================================================

    /**
     * Content (多语言内容 - 已发布版本)
     *
     * JSON-formatted multilingual content data for this section
     * Supports 24 languages with custom editor
     *
     * Data structure varies by section type. Examples:
     *
     * Hero Banner:
     * {
     *   "en": [
     *     {
     *       "title": "Glass Standoff",
     *       "features": ["Feature 1", "Feature 2", ...],
     *       "images": [
     *         { "url": "s3://...", "altText": "..." },
     *         ...
     *       ]
     *     }
     *   ],
     *   "zh": [...],
     *   ... // other 22 languages
     * }
     *
     * Service Features:
     * {
     *   "en": {
     *     "title": "Premium Architectural Glass Hardware",
     *     "subtitle": "...",
     *     "features": [
     *       {
     *         "title": "...",
     *         "shortTitle": "...",
     *         "description": "...",
     *         "images": [...]
     *       }
     *     ]
     *   },
     *   "zh": {...}
     * }
     */
    content: json({
      label: 'Content (多语言内容)',
      defaultValue: {},
      ui: {
        // TODO: Create custom field editor for better UX
        // views: './custom-fields/MultilingualHomeContentField',
        description: '此区块的多语言JSON内容，支持24种语言。详细格式见 API 文档。暂时使用JSON编辑器，可直接编辑复杂结构。',
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
   * Access Control
   */
  access: {
    operation: {
      query: () => true, // Frontend needs to read homepage content
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    // 过滤规则：前端只能看到已发布的内容
    filter: {
      query: ({ session }) => {
        // 如果是管理员登录，可以看到所有内容（包括草稿）
        if (session) {
          return true
        }
        // 前端访客只能看到已发布的内容
        return {
          status: { equals: 'PUBLISHED' },
        }
      },
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['section', 'status', 'enabled', 'order', 'publishedAt', 'updatedAt'],
      initialSort: { field: 'order', direction: 'ASC' },
      pageSize: 20,
    },
    labelField: 'section',
    label: 'Home Content | 首页内容',
    singular: 'Home Content | 首页内容',
    plural: 'Home Content | 首页内容',
    description: '首页内容配置 - 草稿-发布流程：编辑 draftContent → 改状态为 Published → 自动发布到线上',
    itemView: {
      defaultFieldMode: 'edit',
    },
  },

  /**
   * Hooks
   */
  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      // Validate JSON format if content is provided
      if (resolvedData.content) {
        try {
          // If content is a string, parse it to validate JSON
          if (typeof resolvedData.content === 'string') {
            JSON.parse(resolvedData.content)
          }
          // If it's already an object, it's been validated by Keystone
        } catch (error) {
          addValidationError('Content must be valid JSON format | 内容必须是有效的JSON格式')
        }
      }

      // Validate draft content if provided
      if (resolvedData.draftContent) {
        try {
          if (typeof resolvedData.draftContent === 'string') {
            JSON.parse(resolvedData.draftContent)
          }
        } catch (error) {
          addValidationError('Draft content must be valid JSON format | 草稿内容必须是有效的JSON格式')
        }
      }
    },

    /**
     * 发布逻辑
     *
     * 当状态从 DRAFT 改为 PUBLISHED 时:
     * 1. 将 draftContent 复制到 content (如果有草稿内容)
     * 2. 更新 publishedAt 时间
     * 3. 清空 draftContent
     */
    resolveInput: async ({ operation, resolvedData, item, context }) => {
      // 只在更新操作时处理
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        const isPublishing = !wasPublished

        if (isPublishing || resolvedData.status === 'PUBLISHED') {
          // 如果有草稿内容，发布时将其移到正式内容
          if (resolvedData.draftContent !== undefined && resolvedData.draftContent !== null) {
            resolvedData.content = resolvedData.draftContent
            resolvedData.draftContent = null
          }

          // 更新发布时间
          resolvedData.publishedAt = new Date()

          console.log(`✅ [HomeContent] Publishing section: ${item?.section || 'unknown'}`)
        }
      }

      return resolvedData
    },
  },
})
