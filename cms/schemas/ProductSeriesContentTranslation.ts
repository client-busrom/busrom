/**
 * ProductSeriesContentTranslation Model
 *
 * Relational table for storing rich text content (contentBody) in 24 languages.
 * Each record represents one language version of a ProductSeries's content.
 *
 * Why separate table instead of JSON?
 * - JSON approach: Good for short text (name, description) - all 24 languages in one form
 * - Relational approach: Good for rich text - edit one language at a time with full Document Editor
 *
 * Features:
 * - One record per ProductSeries per locale (uniqueness enforced by hooks)
 * - Full Document Editor with formatting toolbar
 * - Optional AI translation buttons
 * - Cascade delete when ProductSeries is deleted
 */

import { list } from '@keystone-6/core'
import { text, relationship, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { componentBlocks } from '../component-blocks'
import { publicReadAccess } from '../lib/permissions/access-control'

export const ProductSeriesContentTranslation = list({
  fields: {
    /**
     * Locale (Language Code)
     *
     * Select from 24 supported languages
     * Uses custom field that automatically disables already-used locales
     */
    locale: text({
      label: 'Language (语言)',
      validation: { isRequired: true },
      isIndexed: undefined,
      ui: {
        views: './custom-fields/LocaleSelectField',
        description: 'Select language (选择语言)',
      },
    }),

    /**
     * Content (Rich Text - Document Editor)
     *
     * IMPORTANT: Must use document({}) field type (not json!)
     * This provides the full Document Editor UI with formatting toolbar
     */
    content: document({
      label: 'Content (内容)',
      formatting: {
        inlineMarks: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          code: true,
          superscript: true,
          subscript: true,
          keyboard: true,
        },
        listTypes: {
          ordered: true,
          unordered: true,
        },
        alignment: {
          center: true,
          end: true,
        },
        headingLevels: [1, 2, 3, 4, 5, 6],
        blockTypes: {
          blockquote: true,
          code: true,
        },
        softBreaks: true,
      },
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [2, 1],
        [1, 2],
        [1, 1, 1],
        [1, 2, 1],
        [2, 1, 1],
        [1, 1, 2]
      ],
      componentBlocks,
      ui: {
        views: './custom-fields/DocumentEditorWithTranslation',
      },
    }),

    /**
     * Product Series (Relationship to parent record)
     */
    productSeries: relationship({
      label: 'Product Series (产品系列)',
      ref: 'ProductSeries.contentTranslations',
      ui: {
        displayMode: 'cards',
        cardFields: ['slug'],
        inlineConnect: true,
        hideCreate: true,
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
  },

  /**
   * Access Control
   * - 使用 publicReadAccess: 前端可公开读取,后台操作需要权限
   */
  access: publicReadAccess('ProductSeriesContentTranslation'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['locale', 'productSeries', 'updatedAt'],
      initialSort: { field: 'locale', direction: 'ASC' },
    },
    labelField: 'locale',

    // Hidden from main menu (only accessible through ProductSeries)
    isHidden: true,
  },

  /**
   * Hooks - Ensure Uniqueness and Auto-link Parent
   *
   * Each ProductSeries can only have ONE translation per locale
   */
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      // Auto-link parent ProductSeries when created via inline create
      if (operation === 'create' && !resolvedData.productSeries && context.req) {
        // Extract productSeries ID from referer URL
        const referer = context.req.headers.referer || ''
        const productSeriesMatch = referer.match(/\/product-series\/([a-f0-9-]+)/)

        if (productSeriesMatch && productSeriesMatch[1]) {
          const productSeriesId = productSeriesMatch[1]
          console.log('[ProductSeriesContentTranslation] Auto-linking to productSeries:', productSeriesId)
          resolvedData.productSeries = { connect: { id: productSeriesId } }
        }
      }

      return resolvedData
    },

    validateInput: async ({ resolvedData, addValidationError, context, operation, item }) => {
      // CREATE: Check if translation already exists for this locale
      if (operation === 'create' && resolvedData.locale && resolvedData.productSeries) {
        const productSeriesId = resolvedData.productSeries.connect?.id

        if (!productSeriesId) {
          addValidationError('Product Series is required')
          return
        }

        const existing = await context.query.ProductSeriesContentTranslation.findMany({
          where: {
            locale: { equals: resolvedData.locale },
            productSeries: { id: { equals: productSeriesId } },
          },
        })

        if (existing.length > 0) {
          addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this product series. Please choose a different language or edit the existing translation.`)
        }
      }

      // UPDATE: Check if locale was changed, ensure new locale doesn't exist
      if (operation === 'update' && resolvedData.locale && item) {
        const currentItem = await context.query.ProductSeriesContentTranslation.findOne({
          where: { id: item.id },
          query: 'locale productSeries { id }',
        })

        if (currentItem && currentItem.locale !== resolvedData.locale) {
          const existing = await context.query.ProductSeriesContentTranslation.findMany({
            where: {
              locale: { equals: resolvedData.locale },
              productSeries: { id: { equals: currentItem.productSeries.id } },
            },
          })

          if (existing.length > 0) {
            addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this product series. Please choose a different language or edit the existing translation.`)
          }
        }
      }
    },
  },
})
