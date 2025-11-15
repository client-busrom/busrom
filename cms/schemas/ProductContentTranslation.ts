/**
 * ProductContentTranslation Model
 *
 * Relational table for storing rich text content (contentBody) in 24 languages.
 * Each record represents one language version of a Product's content.
 *
 * Why separate table instead of JSON?
 * - JSON approach: Good for short text (name, description) - all 24 languages in one form
 * - Relational approach: Good for rich text - edit one language at a time with full Document Editor
 *
 * Features:
 * - One record per Product per locale (uniqueness enforced by hooks)
 * - Full Document Editor with formatting toolbar
 * - Optional AI translation buttons
 * - Cascade delete when Product is deleted
 */

import { list } from '@keystone-6/core'
import { text, relationship, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { publicReadAccess } from '../lib/permissions/access-control'
import { componentBlocks } from '../component-blocks'

export const ProductContentTranslation = list({
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
     * Product (Relationship to parent record)
     */
    product: relationship({
      label: 'Product (产品)',
      ref: 'Product.contentTranslations',
      ui: {
        displayMode: 'cards',
        cardFields: ['sku'],
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
  access: publicReadAccess('ProductContentTranslation'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['locale', 'product', 'updatedAt'],
      initialSort: { field: 'locale', direction: 'ASC' },
    },
    labelField: 'locale',

    // Hidden from main menu (only accessible through Product)
    isHidden: true,
  },

  /**
   * Hooks - Ensure Uniqueness and Auto-link Parent
   *
   * Each Product can only have ONE translation per locale
   */
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      // Auto-link parent Product when created via inline create
      if (operation === 'create' && !resolvedData.product && context.req) {
        // Extract product ID from referer URL
        const referer = context.req.headers.referer || ''
        const productMatch = referer.match(/\/products\/([a-f0-9-]+)/)

        if (productMatch && productMatch[1]) {
          const productId = productMatch[1]
          console.log('[ProductContentTranslation] Auto-linking to product:', productId)
          resolvedData.product = { connect: { id: productId } }
        }
      }

      return resolvedData
    },

    validateInput: async ({ resolvedData, addValidationError, context, operation, item }) => {
      // CREATE: Check if translation already exists for this locale
      if (operation === 'create' && resolvedData.locale && resolvedData.product) {
        const productId = resolvedData.product.connect?.id

        if (!productId) {
          addValidationError('Product is required')
          return
        }

        const existing = await context.query.ProductContentTranslation.findMany({
          where: {
            locale: { equals: resolvedData.locale },
            product: { id: { equals: productId } },
          },
        })

        if (existing.length > 0) {
          addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this product. Please choose a different language or edit the existing translation.`)
        }
      }

      // UPDATE: Check if locale was changed, ensure new locale doesn't exist
      if (operation === 'update' && resolvedData.locale && item) {
        const currentItem = await context.query.ProductContentTranslation.findOne({
          where: { id: item.id },
          query: 'locale product { id }',
        })

        if (currentItem && currentItem.locale !== resolvedData.locale) {
          const existing = await context.query.ProductContentTranslation.findMany({
            where: {
              locale: { equals: resolvedData.locale },
              product: { id: { equals: currentItem.product.id } },
            },
          })

          if (existing.length > 0) {
            addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this product. Please choose a different language or edit the existing translation.`)
          }
        }
      }
    },
  },
})
