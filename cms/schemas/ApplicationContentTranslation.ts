/**
 * ApplicationContentTranslation Model
 *
 * Relational table for storing rich text content in 24 languages.
 * Each record represents one language version of an Application's content.
 *
 * Features:
 * - One record per Application per locale (uniqueness enforced by hooks)
 * - Full Document Editor with formatting toolbar
 * - Optional AI translation buttons
 * - Cascade delete when Application is deleted
 */

import { list } from '@keystone-6/core'
import { text, relationship, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { componentBlocks } from '../component-blocks'
import { publicReadAccess } from '../lib/permissions/access-control'

export const ApplicationContentTranslation = list({
  fields: {
    /**
     * Locale (Language Code)
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
     * Application (Relationship to parent record)
     */
    application: relationship({
      label: 'Application (应用)',
      ref: 'Application.contentTranslations',
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
  access: publicReadAccess('ApplicationContentTranslation'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['locale', 'application', 'updatedAt'],
      initialSort: { field: 'locale', direction: 'ASC' },
    },
    labelField: 'locale',
    isHidden: true,
  },

  /**
   * Hooks - Ensure Uniqueness
   */
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation === 'create' && !resolvedData.application && context.req) {
        const referer = context.req.headers.referer || ''
        const applicationMatch = referer.match(/\/applications\/([a-f0-9-]+)/)

        if (applicationMatch && applicationMatch[1]) {
          const applicationId = applicationMatch[1]
          console.log('[ApplicationContentTranslation] Auto-linking to application:', applicationId)
          resolvedData.application = { connect: { id: applicationId } }
        }
      }

      return resolvedData
    },

    validateInput: async ({ resolvedData, addValidationError, context, operation, item }) => {
      if (operation === 'create' && resolvedData.locale && resolvedData.application) {
        const applicationId = resolvedData.application.connect?.id

        if (!applicationId) {
          addValidationError('Application is required')
          return
        }

        const existing = await context.query.ApplicationContentTranslation.findMany({
          where: {
            locale: { equals: resolvedData.locale },
            application: { id: { equals: applicationId } },
          },
        })

        if (existing.length > 0) {
          addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this application.`)
        }
      }

      if (operation === 'update' && resolvedData.locale && item) {
        const currentItem = await context.query.ApplicationContentTranslation.findOne({
          where: { id: item.id },
          query: 'locale application { id }',
        })

        if (currentItem && currentItem.locale !== resolvedData.locale) {
          const existing = await context.query.ApplicationContentTranslation.findMany({
            where: {
              locale: { equals: resolvedData.locale },
              application: { id: { equals: currentItem.application.id } },
            },
          })

          if (existing.length > 0) {
            addValidationError(`❌ Translation for locale "${resolvedData.locale}" already exists for this application.`)
          }
        }
      }
    },
  },
})
