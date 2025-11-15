/**
 * ProductSeries Model - Product Collections/Series
 *
 * Represents a series or collection of related products.
 * Example: "Elite Glass Door Handle Series"
 *
 * Features:
 * - 24-language support with IMPROVED multilingual document editor
 * - Rich text descriptions (Real Document Editor in tabbed UI)
 * - Auto-translation support
 * - Featured images
 * - Soft delete
 */

import { list, graphql } from "@keystone-6/core";
import { text, json, select, relationship, timestamp, integer, virtual } from "@keystone-6/core/fields";
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'
import { publicReadAccess } from '../lib/permissions/access-control'

export const ProductSeries = list({
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
      isIndexed: "unique",
      ui: {
        description: 'URL-friendly version | URL友好标识 (e.g., "elite-door-handle-series")',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Name Field (JSON with custom tabbed editor)
    // ==================================================================

    name: json({
      label: 'Product Series Name (产品系列名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Product series name in all 24 languages with auto-translation | 产品系列名称（支持24种语言自动翻译）',
      },
    }),

    // ==================================================================
    // 📝 Multi-language Description Field (JSON with custom tabbed editor)
    // ==================================================================

    description: json({
      label: 'Series Description (系列描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Short description in all 24 languages | 系列简短描述（支持24种语言）',
      },
    }),

    // ==================================================================
    // 📄 Content Body Translations (NEW - Relational Approach)
    // ==================================================================

    /**
     * Content Body Translations (Relational table - for rich text)
     *
     * Each language's rich text content is stored in a separate translation record.
     * Operators click on a language card to enter the corresponding Document Editor.
     */
    contentTranslations: relationship({
      label: 'Content Translations (内容翻译)',
      ref: 'ProductSeriesContentTranslation.productSeries',
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
     *
     * Example:
     * query {
     *   productSeriesItems(where: { slug: { equals: "glass-standoff" } }) {
     *     contentByLocale(locale: "zh") {
     *       locale
     *       content
     *     }
     *   }
     * }
     */
    contentByLocale: virtual({
      field: graphql.field({
        type: graphql.object<{ locale: string; exists: boolean }>()({
          name: 'ContentTranslation',
          fields: {
            locale: graphql.field({ type: graphql.String }),
            exists: graphql.field({ type: graphql.Boolean }),
          },
        }),
        args: {
          locale: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(item, { locale }, context) {
          const translations = await context.query.ProductSeriesContentTranslation.findMany({
            where: {
              productSeries: { id: { equals: item.id as string } },
              locale: { equals: locale },
            },
            query: 'locale',
          })

          const translation = translations[0]
          return translation ? { locale, exists: true } : { locale, exists: false }
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
          const translations = await context.query.ProductSeriesContentTranslation.findMany({
            where: {
              productSeries: { id: { equals: item.id as string } },
            },
            query: 'locale',
          })
          console.log('[ProductSeries translatedLocales] Raw translations:', JSON.stringify(translations, null, 2));

          // Extract locale strings from translation objects
          const locales = translations.map((t: any) => {
            // t is an object like { locale: 'en' }
            return String(t.locale)
          })

          console.log('[ProductSeries translatedLocales] Final locales array:', locales)

          // Return as JSON string to avoid any object wrapping issues
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
     * Featured Image
     */
    featuredImage: json({
      label: 'Featured Image (特色图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Select an image',
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
        description: 'Product category this series belongs to | 系列所属产品分类',
      },
    }),

    /**
     * Products in this Series
     */
    products: relationship({
      label: 'Products (产品列表)',
      ref: "Product.series",
      many: true,
      ui: {
        description: 'Products in this series | 该系列包含的产品',
      },
    }),

    // ==================================================================
    // ⚙️ System Fields
    // ==================================================================

    /**
     * Display Order
     */
    order: integer({
      label: 'Display Order (显示顺序)',
      defaultValue: 0,
      ui: {
        description: "Display order (lower number appears first) | 显示顺序（数字越小越靠前）",
      },
    }),

    /**
     * Status
     */
    status: select({
      label: 'Status (状态)',
      options: [
        { label: "Published (已发布)", value: "PUBLISHED" },
        { label: "Draft (草稿)", value: "DRAFT" },
        { label: "Archived (归档)", value: "ARCHIVED" },
      ],
      defaultValue: "DRAFT",
      ui: {
        displayMode: "segmented-control",
        description: 'Series status | 系列状态',
      },
    }),

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: "now" },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
    }),
  },

  /**
   * GraphQL Configuration
   *
   * Specify plural name to avoid conflict (Series is both singular and plural)
   */
  graphql: {
    plural: "ProductSeriesItems",
  },

  /**
   * Access Control
   */
  access: publicReadAccess('ProductSeries'),

  /**
   * Hooks - IndexNow Integration & ActivityLog
   */
  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      // IndexNow: Only submit on create or update of ACTIVE product series
      if ((operation === 'create' || operation === 'update') && item?.status === 'ACTIVE') {
        try {
          // Build product series URL using slug
          const seriesUrl = buildFullUrl(`/product/${item.slug}`)

          // Submit to IndexNow (non-blocking)
          await submitUrlToIndexNow(seriesUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
          // Don't throw error to prevent blocking the operation
        }
      }

      // ActivityLog: Log all operations
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'ProductSeries', item, undefined, originalItem)
      }
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ["slug", "translatedLocales", "category", "order", "status"],
      initialSort: { field: "order", direction: "ASC" },
    },
    labelField: "slug",
  },
});
