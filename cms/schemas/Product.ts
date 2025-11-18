/**
 * Product Schema Example - With Multilingual Editors
 *
 * This is an EXAMPLE showing how to use the custom multilingual editors.
 * To use this in your project:
 *
 * 1. Rename this file to Product.ts (replace the existing one)
 * 2. Update schema.ts to import this version
 * 3. Restart Keystone CMS
 *
 * NOTE: This is a simplified example. The production Product.ts has more fields.
 */

import { list, graphql } from '@keystone-6/core'
import { text, json, select, relationship, timestamp, checkbox, integer, virtual } from '@keystone-6/core/fields'
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'
import { publicReadAccess } from '../lib/permissions/access-control'

export const Product = list({
  fields: {
    /**
     * SKU - Product model code (not unique, one model can have multiple products)
     */
    sku: text({
      label: 'SKU (产品型号)',
      validation: { isRequired: true },
      ui: {
        description: 'Product model code | 产品型号编码 (e.g., "GDH-001")',
      },
    }),

    /**
     * Slug - URL-friendly identifier (auto-generated from product name if empty)
     */
    slug: text({
      label: 'Slug (URL标识)',
      validation: { isRequired: false },
      isIndexed: 'unique',
      ui: {
        description: 'URL-friendly version (auto-generated from name if empty) | URL友好标识 (留空时自动生成)',
      },
    }),

    // ==================================================================
    // 🌐 Multilingual Fields: NAME (JSON format with custom editor)
    // ==================================================================
    name: json({
      label: 'Product Name (产品名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Product name in all 24 languages with auto-translation | 产品名称（支持24种语言自动翻译）',
      },
    }),

    // ==================================================================
    // 🌐 Multilingual Fields: SHORT DESCRIPTION (JSON format with custom editor)
    // ==================================================================
    shortDescription: json({
      label: 'Short Description (简短描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONDocumentField',
        description: 'Brief product description in all 24 languages with auto-translation | 简短产品描述（支持24种语言自动翻译）',
      },
    }),

    // ==================================================================
    // 🌐 Multilingual Fields: FULL DESCRIPTION (JSON format with custom editor)
    // ==================================================================
    description: json({
      label: 'Full Description (完整描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONDocumentField',
        description: 'Detailed product description in all 24 languages with auto-translation | 详细产品描述（支持24种语言自动翻译）',
      },
    }),

    // ==================================================================
    // 📄 Content Body Translations (Relational Approach)
    // ==================================================================

    /**
     * Content Body Translations (Relational table - for rich text)
     *
     * Each language's rich text content is stored in a separate translation record.
     * Operators click on a language card to enter the corresponding Document Editor.
     */
    contentTranslations: relationship({
      label: 'Content Translations (内容翻译)',
      ref: 'ProductContentTranslation.product',
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
     *   products(where: { sku: { equals: "GDH-001-SS" } }) {
     *     contentByLocale(locale: "zh") {
     *       locale
     *       content
     *     }
     *   }
     * }
     */
    contentByLocale: virtual({
      field: graphql.field({
        type: graphql.object<{ locale: string; content: any }>()({
          name: 'ProductContentByLocale',
          fields: {
            locale: graphql.field({ type: graphql.String }),
            content: graphql.field({ type: graphql.JSON }),
          },
        }),
        args: {
          locale: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(item, { locale }, context) {
          const translations = await context.query.ProductContentTranslation.findMany({
            where: {
              product: { id: { equals: item.id as string } },
              locale: { equals: locale },
            },
            query: 'locale content',
          })

          const translation = translations[0]
          return translation || { locale, content: null }
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
          const translations = await context.query.ProductContentTranslation.findMany({
            where: {
              product: { id: { equals: item.id as string } },
            },
            query: 'locale',
          })

          // Extract locale strings from translation objects
          const locales = translations.map((t: any) => String(t.locale))

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
    // Non-multilingual fields
    // ==================================================================

    /**
     * Product Attributes - Multilingual Key-Value Pairs
     */
    attributes: json({
      label: 'Product Attributes (产品属性)',
      defaultValue: {},
      ui: {
        views: './custom-fields/ProductAttributesMultilingualField.tsx',
        description: 'Product attributes in all 24 languages with auto-translation | 产品属性（支持24种语言自动翻译）',
      },
    }),

    /**
     * Product Specifications - Multilingual product variants (colors, sizes, etc.)
     */
    specifications: json({
      label: 'Product Specifications (产品规格)',
      defaultValue: {},
      ui: {
        views: './custom-fields/ProductSpecificationsField',
        description: 'Product specifications with variants (colors, sizes, etc.) | 产品规格(颜色、尺寸等变体)',
      },
    }),

    /**
     * Show Image - Display image for product list (with filtered selector)
     */
    showImage: json({
      label: 'Show Image (展示图片)',
      defaultValue: null,
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Product list display image | 产品列表展示图片',
      },
    }),

    /**
     * Main Images - Product detail page images (with filtered selector)
     */
    mainImage: json({
      label: 'Main Images (产品主图)',
      defaultValue: null,
      ui: {
        views: './custom-fields/MultipleMediaField',
        description: 'Product detail page images (gallery with hover carousel) | 产品详情页主图(用于详情页及列表悬停轮播)',
      },
    }),

    /**
     * Product Series
     */
    series: relationship({
      label: 'Product Series (产品系列)',
      ref: 'ProductSeries.products',
      many: false,
      ui: {
        displayMode: 'select',
        description: 'Product series this product belongs to | 产品所属系列',
      },
    }),

    /**
     * Featured Flag
     */
    isFeatured: checkbox({
      label: 'Is Featured (是否推荐)',
      defaultValue: false,
      ui: {
        description: 'Show this product in featured sections | 在推荐位展示此产品',
      },
    }),

    /**
     * Display Order
     */
    order: integer({
      label: 'Display Order (显示顺序)',
      defaultValue: 0,
      ui: {
        description: 'Display order (lower number appears first) | 显示顺序（数字越小越靠前）',
      },
    }),

    /**
     * Status - Product publication status with soft delete
     */
    status: select({
      label: 'Status (状态)',
      options: [
        { label: 'Published (已发布)', value: 'PUBLISHED' },
        { label: 'Draft (草稿)', value: 'DRAFT' },
        { label: 'Archived (已归档/软删除)', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      ui: {
        displayMode: 'segmented-control',
        description: 'Product status | 产品状态',
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
     * Duplicate Product Action Button
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
        views: './custom-fields/DuplicateProductButton',
      },
    }),
  },

  /**
   * GraphQL Configuration
   */
  graphql: {
    plural: 'Products',
  },

  /**
   * Access Control - RBAC System
   * Requires Product:create, Product:read, Product:update, Product:delete permissions
   */
  // Public read access - website visitors can view products
  access: publicReadAccess('Product'),

  /**
   * Hooks - IndexNow Integration & ActivityLog
   */
  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      // IndexNow: Only submit on create or update of PUBLISHED products
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          // Build product URL using SKU
          const productUrl = buildFullUrl(`/shop/${item.sku}`)

          // Submit to IndexNow (non-blocking)
          await submitUrlToIndexNow(productUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
          // Don't throw error to prevent blocking the operation
        }
      }

      // ActivityLog: Log all operations
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'Product', item, undefined, originalItem)
      }
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['sku', 'showImage', 'series', 'isFeatured', 'status'],
      initialSort: { field: 'order', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'sku',
    searchFields: ['sku', 'slug'],
    // Enable card view in list (user can toggle between table and card view)
    itemView: {
      defaultFieldMode: 'edit',
    },
  },
})
