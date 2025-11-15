/**
 * PageContentTranslation Model
 *
 * Relational table for storing page content in 24 languages using Document Editor.
 * Each record represents one language version of a Page's content.
 *
 * Supports both page types:
 * - TEMPLATE pages: Pre-structured content using Component Blocks (admin-built)
 * - FREEFORM pages: Freely editable rich text content
 *
 * Features:
 * - One record per Page per locale (uniqueness enforced by hooks)
 * - Full Document Editor with formatting toolbar
 * - Component Blocks for rich layouts
 * - Optional AI translation buttons
 * - Cascade delete when Page is deleted
 */

import { list } from '@keystone-6/core'
import { text, relationship, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { componentBlocks } from '../component-blocks'
import { publicReadAccess } from '../lib/permissions/access-control'

export const PageContentTranslation = list({
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
     *
     * For TEMPLATE pages:
     * - Admin pre-builds structure using Component Blocks
     * - Operators only edit text and replace images within blocks
     *
     * For FREEFORM pages:
     * - Operators freely create and edit structure
     * - Full access to all formatting and component blocks
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
        description: 'Use Component Blocks for rich layouts (Hero, CTA, Gallery, etc.)',
      },
    }),

    /**
     * Page (Relationship to parent record)
     */
    page: relationship({
      label: 'Page (页面)',
      ref: 'Page.contentTranslations',
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
   */
  access: publicReadAccess('PageContentTranslation'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['locale', 'page', 'updatedAt'],
      initialSort: { field: 'locale', direction: 'ASC' },
    },
    labelField: 'locale',

    // Hidden from main menu (only accessible through Page)
    isHidden: true,
  },

  /**
   * Hooks - Ensure Uniqueness and Auto-link Parent
   */
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      // Auto-link parent Page when created via inline create
      if (operation === 'create' && !resolvedData.page && context.req) {
        // Extract page ID from referer URL
        const referer = context.req.headers.referer || ''
        const pageMatch = referer.match(/\/pages\/([a-f0-9-]+)/)

        if (pageMatch && pageMatch[1]) {
          const pageId = pageMatch[1]
          console.log('[PageContentTranslation] Auto-linking to page:', pageId)
          resolvedData.page = { connect: { id: pageId } }
        }
      }

      return resolvedData
    },

    validateInput: async ({ resolvedData, addValidationError, context, operation, item }) => {
      // CREATE: Check if translation already exists for this locale
      if (operation === 'create' && resolvedData.locale && resolvedData.page) {
        const pageId = resolvedData.page.connect?.id

        if (!pageId) {
          addValidationError('Page is required')
          return
        }

        const existing = await context.query.PageContentTranslation.findMany({
          where: {
            locale: { equals: resolvedData.locale },
            page: { id: { equals: pageId } },
          },
        })

        if (existing.length > 0) {
          addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this page. Please choose a different language or edit the existing translation.`)
        }
      }

      // UPDATE: Check if locale was changed, ensure new locale doesn't exist
      if (operation === 'update' && resolvedData.locale && item) {
        const currentItem = await context.query.PageContentTranslation.findOne({
          where: { id: item.id },
          query: 'locale page { id }',
        })

        if (currentItem && currentItem.locale !== resolvedData.locale) {
          const existing = await context.query.PageContentTranslation.findMany({
            where: {
              locale: { equals: resolvedData.locale },
              page: { id: { equals: currentItem.page.id } },
            },
          })

          if (existing.length > 0) {
            addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this page. Please choose a different language or edit the existing translation.`)
          }
        }
      }
    },
  },
})
