/**
 * Application Model - Application Cases/Project Showcases
 *
 * Features:
 * - 24-language support with hybrid multilingual approach
 * - JSON fields for short text (name, shortDescription, description)
 * - Soft delete (status: PUBLISHED/DRAFT/ARCHIVED)
 * - Scene gallery: multiple scene groups, each containing multiple images
 */

import { list, graphql } from '@keystone-6/core'
import { text, json, select, relationship, timestamp, virtual } from '@keystone-6/core/fields'
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'

export const Application = list({
  fields: {
    // ==================================================================
    // 🔑 Core Fields
    // ==================================================================

    /**
     * Slug (URL-friendly identifier)
     */
    slug: text({
      label: 'Slug (URL标识)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'URL-friendly version | URL友好标识 (e.g., "commercial-building-glass-railing")',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Fields: JSON Approach (Short Text)
    // ==================================================================

    /**
     * Application Name (Multilingual JSON)
     */
    name: json({
      label: 'Application Name (应用名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Application name in all 24 languages with auto-translation | 应用名称（支持24种语言自动翻译）',
      },
    }),

    /**
     * Short Description (Multilingual JSON)
     */
    shortDescription: json({
      label: 'Short Description (简短描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONDocumentField',
        description: 'Brief description in all 24 languages with auto-translation | 简短描述（支持24种语言自动翻译）',
      },
    }),

    /**
     * Full Description (Multilingual JSON)
     */
    description: json({
      label: 'Full Description (完整描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONDocumentField',
        description: 'Detailed description in all 24 languages with auto-translation | 详细描述（支持24种语言自动翻译）',
      },
    }),

    // ==================================================================
    // 🖼️ Scene Gallery
    // ==================================================================

    /**
     * Scene Gallery - Multiple scene groups, each containing multiple images
     *
     * Data structure: [{ id: string, name: string, images: [{ id: string }] }]
     * Each scene group can contain multiple images for showcasing different scenarios
     */
    sceneGallery: json({
      label: 'Scene Gallery (场景图集)',
      defaultValue: [],
      ui: {
        views: './custom-fields/SceneGalleryField',
        description: 'Manage scene image groups. Each scene can contain multiple images | 管理场景图集，每个场景可包含多张图片',
      },
    }),


    /**
     * Category
     */
    category: relationship({
      label: 'Category (分类)',
      ref: "Category",
      many: false,
      ui: {
        displayMode: "select",
        description: 'Application category this series belongs to | 应用案例所属分类',
      },
    }),
     
     

    // ==================================================================
    // ⚙️ System Fields
    // ==================================================================

    /**
     * Status (Soft Delete)
     */
    status: select({
      label: 'Status (状态)',
      options: [
        { label: 'Published (已发布)', value: 'PUBLISHED' },
        { label: 'Draft (草稿)', value: 'DRAFT' },
        { label: 'Archived (归档)', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      ui: {
        displayMode: 'segmented-control',
        description: 'Application status | 应用状态',
      },
    }),

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
    }),

    /**
     * Duplicate Action Button
     */
    duplicate: virtual({
      label: 'Duplicate (复制)',
      field: graphql.field({
        type: graphql.String,
        resolve() {
          return null
        },
      }),
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
        views: './custom-fields/DuplicateItemButton',
      },
    }),
  },

  /**
   * GraphQL Configuration
   */
  graphql: {
    plural: 'Applications',
  },

  /**
   * Access Control - Allow creation for seeding
   */
  access: {
    operation: {
      query: () => true,
      create: () => true, // Allow creation for seeding
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    filter: {
      query: ({ session }) => {
        // Public can only see PUBLISHED applications
        if (!session) {
          return { status: { equals: 'PUBLISHED' } }
        }
        // Authenticated users can see all
        return true
      },
    },
  },

  /**
   * Hooks - IndexNow Integration & ActivityLog
   */
  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      // IndexNow: Only submit on create or update of PUBLISHED applications
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          // Build application URL using slug
          const appUrl = buildFullUrl(`/service/application/${item.slug}`)

          // Submit to IndexNow (non-blocking)
          await submitUrlToIndexNow(appUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
          // Don't throw error to prevent blocking the operation
        }
      }

      // ActivityLog: Log all operations
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'Application', item, undefined, originalItem)
      }
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['slug', 'category', 'status', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
    labelField: 'slug',
    label: 'Applications | 应用案例',
    singular: 'Application | 应用案例',
    plural: 'Applications | 应用案例',
  },
})
