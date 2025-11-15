/**
 * MediaTag Model - Flat Multi-dimensional Tag System
 *
 * 媒体标签 - 扁平多维度标签系统
 *
 * Features:
 * - ✅ Flat structure (no hierarchy)
 * - ✅ Type field for grouping (PRODUCT_SERIES, FUNCTION_TYPE, SCENE_TYPE, SPEC, COLOR, CUSTOM)
 * - ✅ Multilingual name field in JSON format
 * - ✅ Color field (HEX color code) for UI display
 * - ✅ Virtual field `mediaCount` (shows usage count)
 * - ✅ Order field for sorting
 *
 * Tag Types:
 * - PRODUCT_SERIES: Product series tags (e.g., Glass Standoff, Glass Hinge)
 * - FUNCTION_TYPE: Functional categorization (e.g., Scene Photo, White Background)
 * - SCENE_TYPE: Scene type tags (e.g., Single Scene, Combination Scene)
 * - SPEC: Specification tags (e.g., 50mm, 100mm, Stainless Steel)
 * - COLOR: Color tags (e.g., Black, Silver, Gold)
 * - CUSTOM: Custom tags for flexible categorization
 */

import { list } from '@keystone-6/core'
import { text, json, select, integer, timestamp, virtual } from '@keystone-6/core/fields'
import { graphql } from '@keystone-6/core'

// Helper function to generate slug from type and name
function generateSlugFromTypeAndName(type: string, nameJson: any): string {
  try {
    // Parse name JSON to get English name
    const nameObj = typeof nameJson === 'string' ? JSON.parse(nameJson) : nameJson
    const nameEn = nameObj?.en || ''

    if (!nameEn) return ''

    // Clean the English name
    const cleanName = nameEn
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // If type is CUSTOM, return clean name without prefix
    if (!type || type === 'CUSTOM') {
      return cleanName
    }

    // Map type to prefix
    const typePrefix: Record<string, string> = {
      'PRODUCT_SERIES': 'series',
      'FUNCTION_TYPE': 'func',
      'SCENE_TYPE': 'scene',
      'SPEC': 'spec',
      'COLOR': 'color',
    }

    const prefix = typePrefix[type] || type.toLowerCase()
    return `${prefix}-${cleanName}`
  } catch {
    return ''
  }
}

export const MediaTag = list({
  fields: {
    /**
     * Tag Name (Multilingual)
     *
     * 标签名称（多语言）
     *
     * Stored as JSON with all 24 languages
     * Example: { "en": "Glass Standoff", "zh": "广告螺丝" }
     */
    name: json({
      label: 'Tag Name (标签名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Tag name in all 24 languages | 标签名称（支持24种语言）',
      },
    }),

    /**
     * Slug (URL-friendly identifier)
     *
     * Slug（URL 友好的标识符）
     *
     * Used for API filtering: /api/media?tag=glass-standoff
     * Auto-generated from name (EN) and type via hooks
     */
    slug: text({
      label: 'Slug (URL标识)',
      isIndexed: 'unique',
      ui: {
        description: 'Auto-generated from English name and type, or enter manually | 留空则自动根据英文名称和类型生成，也可手动填写',
      },
    }),

    /**
     * Tag Type (for grouping)
     *
     * 标签类型（用于分组）
     *
     * - PRODUCT_SERIES: Product series tags
     * - FUNCTION_TYPE: Functional categorization
     * - SCENE_TYPE: Scene type tags
     * - SPEC: Specification tags
     * - COLOR: Color tags
     * - CUSTOM: Custom tags
     */
    type: select({
      label: 'Tag Type (标签类型)',
      options: [
        { label: 'Product Series (产品系列)', value: 'PRODUCT_SERIES' },
        { label: 'Function Type (功能类型)', value: 'FUNCTION_TYPE' },
        { label: 'Scene Type (场景类型)', value: 'SCENE_TYPE' },
        { label: 'Spec (规格)', value: 'SPEC' },
        { label: 'Color (颜色)', value: 'COLOR' },
        { label: 'Custom (自定义)', value: 'CUSTOM' },
      ],
      defaultValue: 'CUSTOM',
      ui: {
        displayMode: 'select',
        description: 'Tag type for grouping and filtering | 用于分组和筛选的标签类型',
      },
    }),

    /**
     * Display Order
     *
     * 显示排序
     *
     * Lower numbers appear first
     */
    order: integer({
      label: 'Display Order (显示顺序)',
      defaultValue: 0,
      ui: {
        description: 'Display order (lower number appears first) | 显示顺序（数字越小越靠前）',
      },
    }),

    /**
     * Media Count (Virtual Field)
     *
     * 媒体数量（虚拟字段）
     *
     * Shows the number of media files using this tag
     * Calculated dynamically via GraphQL resolver
     */
    mediaCount: virtual({
      label: 'Media Count (媒体数量)',
      field: graphql.field({
        type: graphql.Int,
        async resolve(item: any, _args, context) {
          const count = await context.query.Media.count({
            where: {
              tags: { some: { id: { equals: item.id } } },
            },
          })
          return count
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
        description: 'Number of media files using this tag | 使用此标签的媒体文件数量',
      },
    }),

    /**
     * Timestamps
     *
     * 时间戳
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
    }),
  },

  /**
   * Access Control
   *
   * 访问控制
   * - query: 公开访问 (前端需要读取媒体标签)
   * - create/update/delete: 需要登录
   */
  access: {
    operation: {
      query: () => true,
      create: ({ session }: any) => !!session,
      update: ({ session }: any) => !!session,
      delete: ({ session }: any) => !!session,
    },
  },

  /**
   * Hooks - Auto-generate slug from name and type
   *
   * 钩子 - 自动根据名称和类型生成 slug
   */
  hooks: {
    resolveInput: async ({ resolvedData, item }) => {
      // Only auto-generate if slug is not manually provided or is empty
      const hasManualSlug = resolvedData.slug && resolvedData.slug.trim() !== ''

      // If creating a new item or updating, and name or type has changed
      if (!hasManualSlug && (resolvedData.name || resolvedData.type)) {
        const itemData = item as any
        const name = resolvedData.name ?? itemData?.name
        const type = resolvedData.type ?? itemData?.type ?? 'CUSTOM'

        if (name) {
          const generatedSlug = generateSlugFromTypeAndName(type, name)
          if (generatedSlug) {
            resolvedData.slug = generatedSlug
          }
        }
      }

      return resolvedData
    },

    validateInput: async ({ resolvedData, addValidationError }) => {
      // Ensure slug is not empty after processing
      if (!resolvedData.slug || resolvedData.slug.trim() === '') {
        addValidationError('Slug 不能为空，请填写英文名称以自动生成')
      }
    },
  },

  /**
   * UI Configuration
   *
   * UI 配置
   */
  ui: {
    listView: {
      initialColumns: ['name', 'type', 'mediaCount', 'order'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
    labelField: 'slug',
    description: 'Media tags - Flat multi-dimensional tag system',
  },
})
