/**
 * Blog Model - Blog Posts/Articles
 *
 * Features:
 * - 24-language support with hybrid multilingual approach
 * - JSON fields for short text (title, excerpt)
 * - Relational table for rich text content
 * - Soft delete (status: PUBLISHED/DRAFT/ARCHIVED)
 * - Category support
 * - Featured image
 */

import { list, graphql } from '@keystone-6/core'
import { text, json, select, relationship, timestamp, virtual } from '@keystone-6/core/fields'
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'
import { publicReadAccess } from '../lib/permissions/access-control'

export const Blog = list({
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
        description: 'URL-friendly version | URL友好标识 (e.g., "how-to-install-glass-standoff")',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Fields: JSON Approach (Short Text)
    // ==================================================================

    /**
     * Title (Multilingual JSON)
     */
    title: json({
      label: 'Blog Title (博客标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Blog title in all 24 languages with auto-translation | 博客标题（支持24种语言自动翻译）',
      },
    }),

    /**
     * Excerpt (Multilingual JSON)
     */
    excerpt: json({
      label: 'Excerpt (摘要)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Short excerpt/summary in all 24 languages | 简短摘要（支持24种语言）',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Fields: Relational Approach (Rich Text Content)
    // ==================================================================

    /**
     * Content Body Translations (Relational table)
     *
     * Each language's rich text content is stored in a separate BlogContentTranslation record.
     * Operators click on a language card to enter the corresponding Document Editor.
     */
    contentTranslations: relationship({
      label: 'Content Translations (内容翻译)',
      ref: 'BlogContentTranslation.blog',
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
          name: 'BlogContentByLocale',
          fields: {
            locale: graphql.field({ type: graphql.String }),
            content: graphql.field({ type: graphql.JSON }),
          },
        }),
        args: {
          locale: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(item, { locale }, context) {
          const translations = await context.query.BlogContentTranslation.findMany({
            where: {
              blog: { id: { equals: item.id as string } },
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
          const translations = await context.query.BlogContentTranslation.findMany({
            where: {
              blog: { id: { equals: item.id as string } },
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
     * Cover Image - with filtered selector
     */
    coverImage: json({
      label: 'Cover Image (封面图片)',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: 'Blog cover image | 博客封面图片',
      },
    }),

    /**
     * Categories (Multi-select)
     */
    categories: relationship({
      label: 'Categories (分类)',
      ref: 'Category',
      many: true,
      ui: {
        displayMode: 'select',
        description: 'Select one or more categories (type: BLOG) | 选择一个或多个分类（类型：博客）',
      },
    }),

    /**
     * Author
     */
    author: text({
      label: 'Author (作者)',
      defaultValue: 'Busrom Team',
      ui: {
        description: 'Author name or team name | 作者姓名或团队名称',
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
      },
    }),

    /**
     * Published Date
     */
    publishedAt: timestamp({
      label: 'Published At (发布时间)',
      ui: {
        description: 'Publication date (visible to public when status is PUBLISHED) | 发布日期（状态为已发布时对外可见）',
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
    plural: 'Blogs',
  },

  /**
   * Access Control - Disable physical deletion
   */
  access: publicReadAccess('Blog'),

  /**
   * Hooks - IndexNow Integration & ActivityLog
   */
  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      // IndexNow: Only submit on create or update of PUBLISHED blogs
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          // Build blog URL using slug
          const blogUrl = buildFullUrl(`/about-us/blog/${item.slug}`)

          // Submit to IndexNow (non-blocking)
          await submitUrlToIndexNow(blogUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
          // Don't throw error to prevent blocking the operation
        }
      }

      // ActivityLog: Log all operations
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'Blog', item, undefined, originalItem)
      }
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['slug', 'translatedLocales', 'author', 'status', 'publishedAt'],
      initialSort: { field: 'publishedAt', direction: 'DESC' },
    },
    labelField: 'slug',
    label: 'Blogs | 博客',
    singular: 'Blog | 博客',
    plural: 'Blogs | 博客',
  },
})
