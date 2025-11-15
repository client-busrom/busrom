/**
 * MediaCategory Model - Flat Media Classification System
 *
 * 媒体主分类 - 扁平分类系统
 *
 * Features:
 * - ✅ Flat structure (no hierarchy, easy to extend)
 * - ✅ Multilingual fields (name, description) in JSON format
 * - ✅ Virtual field `mediaCount` (shows number of media in this category)
 * - ✅ Order field for sorting
 * - ✅ Optional icon field for UI display
 *
 * Predefined Categories (图片用途分类):
 * - 场景图 (Scene Photo)
 * - 白底图 (White Background)
 * - 合用图 (Composite Use)
 * - 通用图 (Common)
 * - 尺寸图 (Dimension Drawing)
 * - 实拍图 (Real Shot)
 *
 * Note: Easy to add more categories as needed without affecting existing structure
 * Product series classification uses MediaTag instead
 */

import { list } from '@keystone-6/core'
import { text, json, timestamp, integer, virtual } from '@keystone-6/core/fields'
import { graphql } from '@keystone-6/core'

export const MediaCategory = list({
  fields: {
    /**
     * Category Name (Multilingual)
     *
     * 分类名称（多语言）
     *
     * Stored as JSON with all 24 languages
     * Example: { "en": "Scene Photo", "zh": "场景图" }
     */
    name: json({
      label: 'Category Name (分类名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Category name in all 24 languages | 分类名称（支持24种语言）',
      },
    }),

    /**
     * Slug (URL-friendly identifier)
     *
     * Slug（URL 友好的标识符）
     *
     * Used for API filtering: /api/media?category=scene-photo
     */
    slug: text({
      label: 'Slug (URL标识)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'URL-friendly version | URL友好标识 (e.g., "scene-photo")',
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
     * Icon (Optional)
     *
     * 图标（可选）
     *
     * Icon name for UI display (e.g., "image", "photo", "file-image")
     */
    icon: text({
      label: 'Icon (图标)',
      ui: {
        description: 'Icon name for UI display | 图标名称（如 "image", "photo"）',
      },
    }),

    /**
     * Description (Multilingual)
     *
     * 描述（多语言）
     */
    description: json({
      label: 'Description (描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Category description in all 24 languages | 分类描述（支持24种语言）',
      },
    }),

    /**
     * Display Name (Virtual Field)
     *
     * 显示名称（虚拟字段）
     *
     * Shows the Chinese name for display purposes
     * Used as labelField for relationship selectors
     */
    displayName: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: any) {
          try {
            const nameObj = typeof item.name === 'string' ? JSON.parse(item.name) : item.name
            return nameObj?.en || nameObj?.zh || item.slug || 'Unnamed'
          } catch {
            return item.slug || 'Unnamed'
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    /**
     * Media Count (Virtual Field)
     *
     * 媒体数量（虚拟字段）
     *
     * Shows the number of media files in this category
     * Calculated dynamically via GraphQL resolver
     */
    mediaCount: virtual({
      label: 'Media Count (媒体数量)',
      field: graphql.field({
        type: graphql.Int,
        async resolve(item: any, _args, context) {
          const count = await context.query.Media.count({
            where: {
              primaryCategory: { id: { equals: item.id } },
            },
          })
          return count
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
        description: 'Number of media files in this category | 该分类下的媒体文件数量',
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
   * - query: 公开访问 (前端需要读取媒体分类)
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
   * UI Configuration
   *
   * UI 配置
   */
  ui: {
    listView: {
      initialColumns: ['name', 'slug', 'mediaCount', 'order'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
    labelField: 'displayName',
    description: 'Media category - Flat structure for image purpose classification',
  },
})
