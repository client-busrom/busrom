/**
 * BlogContentTranslation Model
 *
 * Relational table for storing rich text content (contentBody) in 24 languages.
 * Each record represents one language version of a Blog's content.
 *
 * Why separate table instead of JSON?
 * - JSON approach: Good for short text (title, excerpt) - all 24 languages in one form
 * - Relational approach: Good for rich text - edit one language at a time with full Document Editor
 *
 * Features:
 * - One record per Blog per locale (uniqueness enforced by hooks)
 * - Full Document Editor with formatting toolbar
 * - Optional AI translation buttons
 * - Cascade delete when Blog is deleted
 */

import { list } from '@keystone-6/core'
import { text, relationship, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { componentBlocks } from '../component-blocks'
import { publicReadAccess } from '../lib/permissions/access-control'

export const BlogContentTranslation = list({
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
     * Blog (Relationship to parent record)
     */
    blog: relationship({
      label: 'Blog (博客)',
      ref: 'Blog.contentTranslations',
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
  access: publicReadAccess('BlogContentTranslation'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['locale', 'blog', 'updatedAt'],
      initialSort: { field: 'locale', direction: 'ASC' },
    },
    labelField: 'locale',

    // Hidden from main menu (only accessible through Blog)
    isHidden: true,
  },

  /**
   * Hooks - Ensure Uniqueness and Auto-link Parent
   *
   * Each Blog can only have ONE translation per locale
   */
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      // Auto-link parent Blog when created via inline create
      if (operation === 'create' && !resolvedData.blog && context.req) {
        // Extract blog ID from referer URL
        const referer = context.req.headers.referer || ''
        const blogMatch = referer.match(/\/blogs\/([a-f0-9-]+)/)

        if (blogMatch && blogMatch[1]) {
          const blogId = blogMatch[1]
          console.log('[BlogContentTranslation] Auto-linking to blog:', blogId)
          resolvedData.blog = { connect: { id: blogId } }
        }
      }

      return resolvedData
    },

    validateInput: async ({ resolvedData, addValidationError, context, operation, item }) => {
      // CREATE: Check if translation already exists for this locale
      if (operation === 'create' && resolvedData.locale && resolvedData.blog) {
        const blogId = resolvedData.blog.connect?.id

        if (!blogId) {
          addValidationError('Blog is required')
          return
        }

        const existing = await context.query.BlogContentTranslation.findMany({
          where: {
            locale: { equals: resolvedData.locale },
            blog: { id: { equals: blogId } },
          },
        })

        if (existing.length > 0) {
          addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this blog. Please choose a different language or edit the existing translation.`)
        }
      }

      // UPDATE: Check if locale was changed, ensure new locale doesn't exist
      if (operation === 'update' && resolvedData.locale && item) {
        const currentItem = await context.query.BlogContentTranslation.findOne({
          where: { id: item.id },
          query: 'locale blog { id }',
        })

        if (currentItem && currentItem.locale !== resolvedData.locale) {
          const existing = await context.query.BlogContentTranslation.findMany({
            where: {
              locale: { equals: resolvedData.locale },
              blog: { id: { equals: currentItem.blog.id } },
            },
          })

          if (existing.length > 0) {
            addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this blog. Please choose a different language or edit the existing translation.`)
          }
        }
      }
    },
  },
})
