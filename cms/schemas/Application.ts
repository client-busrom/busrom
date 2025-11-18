/**
 * Application Model - Application Cases/Project Showcases
 *
 * Features:
 * - 24-language support with hybrid multilingual approach
 * - JSON fields for short text (name, shortDescription)
 * - Relational table for rich text description
 * - Soft delete (status: PUBLISHED/DRAFT/ARCHIVED)
 * - Multiple images support
 * - Featured image
 */

import { list, graphql } from '@keystone-6/core'
import { text, json, select, relationship, timestamp, virtual } from '@keystone-6/core/fields'
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'
import { publicReadAccess } from '../lib/permissions/access-control'

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
    // 🌐 Multi-language Fields: Relational Approach (Rich Text Content)
    // ==================================================================

    /**
     * Content Body Translations (Relational table - for rich text)
     *
     * Each language's rich text content is stored in a separate ApplicationContentTranslation record.
     * Operators click on a language card to enter the corresponding Document Editor.
     */
    contentTranslations: relationship({
      label: 'Content Translations (内容翻译)',
      ref: 'ApplicationContentTranslation.application',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['locale', 'updatedAt'],
        inlineCreate: { fields: ['locale'] },
        inlineEdit: { fields: ['locale', 'content'] },
        linkToItem: true,
        inlineConnect: true,
        description: 'Click language card to edit rich text content (点击语言卡片编辑富文本内容)',
      },
    }),

    /**
     * Virtual Field: Quick access to content by locale
     *
     * Used in GraphQL API queries
     */
    contentByLocale: virtual({
      field: graphql.field({
        type: graphql.object<{ locale: string; content: any }>()({
          name: 'ApplicationContentByLocale',
          fields: {
            locale: graphql.field({ type: graphql.String }),
            content: graphql.field({ type: graphql.JSON }),
          },
        }),
        args: {
          locale: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(item, { locale }, context) {
          const translations = await context.query.ApplicationContentTranslation.findMany({
            where: {
              application: { id: { equals: item.id as string } },
              locale: { equals: locale },
            },
            query: 'locale content',
          })
          return translations[0] || { locale, content: null }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    /**
     * Virtual Field: Display list of translated locales
     *
     * Shows completed translations in list view (e.g., EN ✅ ZH ✅ ES)
     */
    translatedLocales: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const translations = await context.query.ApplicationContentTranslation.findMany({
            where: {
              application: { id: { equals: item.id as string } },
            },
            query: 'locale',
          })
          const locales = translations.map((t: any) => String(t.locale))
          return JSON.stringify(locales)
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        views: './custom-fields/TranslatedLocalesDisplay',
      },
    }),

    // ==================================================================
    // 🖼️ Media & Relationships
    // ==================================================================

    /**
     * Main Image (Featured) - with filtered selector
     */
    mainImage: json({
      label: 'Main Image (主图)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Main/featured image for this application case | 应用案例的主图',
      },
    }),

    /**
     * Gallery Images - with filtered selector
     */
    images: json({
      label: 'Gallery Images (图集)',
      ui: {
        views: './custom-fields/MultipleMediaField',
        description: 'Additional images showcasing this application | 展示该应用的更多图片',
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
   * Access Control - Disable physical deletion
   */
  access: publicReadAccess('Application'),

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
      initialColumns: ['slug', 'translatedLocales', 'status', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
    labelField: 'slug',
  },
})
