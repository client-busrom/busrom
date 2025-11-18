/**
 * Page Model - Unified Page Management (统一页面管理)
 *
 * Unified model for managing both template-based pages and free-form landing pages.
 * All pages use Document Editor for content, ensuring consistency and flexibility.
 *
 * Page Types:
 * 1. TEMPLATE: Fixed template pages (e.g., FAQ, About Us, Services)
 *    - Structure is pre-built by admin using Component Blocks
 *    - Operators only edit text content and replace images
 *    - Cannot be freely deleted (isSystem flag)
 *
 * 2. FREEFORM: Free-form landing pages (e.g., promotions, campaigns)
 *    - Operators can freely create and edit structure
 *    - Full access to Document Editor and Component Blocks
 *    - Can be freely created and deleted
 *
 * Features:
 * - Unified Document Editor for all content
 * - 24-language support via translation table
 * - Component Blocks for rich layouts
 * - SEO managed via separate SeoSetting model
 * - Draft-Publish workflow
 */

import { list, graphql } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  json,
  relationship,
  timestamp,
  integer,
  virtual,
} from '@keystone-6/core/fields'
import { publicReadAccess } from '../lib/permissions/access-control'

export const Page = list({
  fields: {
    // ==================================================================
    // 🔑 Core Fields (核心字段)
    // ==================================================================

    /**
     * Slug (URL-friendly identifier)
     *
     * Unique identifier for CMS and API reference
     */
    slug: text({
      label: 'Slug (页面标识)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'CMS内部标识。例如: service-overview, faq, summer-promotion-2024',
      },
    }),

    /**
     * Path (完整URL路径)
     *
     * Full URL path for frontend routing
     * Must start with / and match Next.js route structure
     */
    path: text({
      label: 'Path (URL路径)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: '完整URL路径，用于前端路由匹配。例如: /service/one-stop-shop, /about-us/story, /summer-sale-2024。必须以/开头。',
      },
    }),

    /**
     * Page Type (页面类型)
     *
     * Determines how the page is managed and rendered
     */
    pageType: select({
      type: 'enum',
      options: [
        { label: '📋 Template Page (固定模板页)', value: 'TEMPLATE' },
        { label: '🎨 Freeform Page (自由落地页)', value: 'FREEFORM' },
      ],
      defaultValue: 'FREEFORM',
      validation: { isRequired: true },
      label: 'Page Type (页面类型)',
      ui: {
        displayMode: 'segmented-control',
        description: '模板页: 固定结构,运营只改文字和图片 | 自由页: 完全自由创建和编辑',
      },
    }),

    /**
     * Template Name (模板名称)
     *
     * Only used for TEMPLATE pages
     * Tells frontend which template component to use for rendering
     */
    template: text({
      label: 'Template Name (模板名称)',
      ui: {
        description: '仅用于模板页。例如: SERVICE_OVERVIEW, FAQ, ABOUT_US, OEM_ODM',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Title (JSON with custom tabbed editor)
    // ==================================================================

    /**
     * Page Title (页面标题) - Multilingual
     */
    title: json({
      label: 'Page Title (页面标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '页面主标题,支持24种语言自动翻译',
      },
    }),

    // ==================================================================
    // 📄 Content Translations (Document Editor for all languages)
    // ==================================================================

    /**
     * Content Translations (内容翻译)
     *
     * Each language's content is stored in a separate translation record.
     * All pages (TEMPLATE and FREEFORM) use Document Editor with Component Blocks.
     *
     * - TEMPLATE pages: Admin pre-builds structure, operators edit content
     * - FREEFORM pages: Operators freely create and edit structure
     */
    contentTranslations: relationship({
      label: 'Content Translations (内容翻译)',
      ref: 'PageContentTranslation.page',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['locale', 'updatedAt'],
        inlineCreate: { fields: ['locale'] },
        inlineEdit: { fields: ['locale', 'content'] },
        linkToItem: true,
        inlineConnect: true,
        description: '点击语言卡片编辑该语言的内容 (使用 Document Editor)',
      },
    }),

    /**
     * Virtual Field: Display list of translated locales
     */
    translatedLocales: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, _args, context) {
          const translations = await context.query.PageContentTranslation.findMany({
            where: {
              page: { id: { equals: item.id as string } },
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
    // 🖼️ Hero Section Configuration (顶部配置)
    // ==================================================================

    /**
     * Hero Media Tags (顶部图片标签)
     *
     * Select media tags to provide images for the hero waterfall animation.
     * Frontend will query all media with these tags to create the waterfall effect.
     */
    heroMediaTags: relationship({
      ref: 'MediaTag',
      label: 'Hero Media Tags (顶部图片标签)',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'slug'],
        inlineConnect: true,
        description: '选择媒体标签,前端将查询这些标签下的所有图片用于顶部瀑布流动效',
      },
    }),

    /**
     * Virtual Field: Preview selected media
     */
    heroMediaPreview: virtual({
      field: graphql.field({
        type: graphql.list(graphql.object<{ id: string; url: string; filename: string }>()({
          name: 'PageHeroMediaPreview',
          fields: {
            id: graphql.field({ type: graphql.nonNull(graphql.String) }),
            url: graphql.field({ type: graphql.nonNull(graphql.String) }),
            filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
          },
        })),
        async resolve(item, _args, context) {
          // Get the media tag IDs for this page
          const page = await context.query.Page.findOne({
            where: { id: item.id as string },
            query: 'heroMediaTags { id }',
          })

          if (!page?.heroMediaTags || page.heroMediaTags.length === 0) {
            return []
          }

          const tagIds = page.heroMediaTags.map((tag: any) => tag.id)

          // Query media files with these tags
          const mediaFiles = await context.query.Media.findMany({
            where: {
              tags: {
                some: {
                  id: { in: tagIds },
                },
              },
            },
            query: 'id filename file { url } variants',
            take: 100,
          })

          return mediaFiles.map((media: any) => ({
            id: media.id,
            filename: media.filename,
            url: media.variants?.thumbnail || media.file?.url || '',
          }))
        },
      }),
      ui: {
        views: './custom-fields/HeroMediaPreview',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        listView: { fieldMode: 'hidden' },
        query: '{ id url filename }',
      },
    }),

    /**
     * Hero Text Overlay (顶部叠加文字)
     *
     * Multilingual text that fades in after the waterfall animation.
     * Displayed over the hero section.
     */
    heroText: json({
      label: 'Hero Text Overlay (顶部叠加文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '图片瀑布流动效之后渐显的多语言文字',
      },
    }),

    /**
     * Hero Subtitle (顶部副标题)
     *
     * Optional subtitle text that appears below the hero text
     */
    heroSubtitle: json({
      label: 'Hero Subtitle (顶部副标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '可选的副标题文字 (可选)',
      },
    }),

    // ==================================================================
    // ⚙️ System Settings (系统设置)
    // ==================================================================

    /**
     * System Page (系统页面)
     *
     * System pages cannot be deleted (only content editable)
     * Typically used for TEMPLATE pages
     */
    isSystem: checkbox({
      defaultValue: false,
      label: 'System Page (系统页面)',
      ui: {
        description: '勾选后此页面不可删除,只能编辑内容。用于重要的模板页面。',
      },
    }),

    /**
     * Note: SEO 配置统一在 SeoSetting 模型中管理
     * 通过 slug 关联到具体页面
     */

    // ==================================================================
    // 📋 Publishing Status (发布状态)
    // ==================================================================

    /**
     * Status (发布状态)
     */
    status: select({
      type: 'string',
      options: [
        { label: '📝 Draft (草稿)', value: 'DRAFT' },
        { label: '✅ Published (已发布)', value: 'PUBLISHED' },
        { label: '🔒 Archived (归档)', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      validation: { isRequired: true },
      label: 'Status (发布状态)',
      ui: {
        displayMode: 'segmented-control',
        description: '草稿状态不会在前端显示',
      },
    }),

    /**
     * Published At (发布时间)
     */
    publishedAt: timestamp({
      label: 'Published At (发布时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: '内容发布到线上的时间',
      },
    }),

    /**
     * Note: Sitemap 配置统一在 SeoSetting 模型中管理
     * 通过页面匹配规则关联到具体页面
     */

    /**
     * Display Order (显示顺序)
     */
    order: integer({
      label: 'Display Order (显示顺序)',
      defaultValue: 0,
      ui: {
        description: '显示顺序（数字越小越靠前）',
      },
    }),

    // ==================================================================
    // ⚙️ System Fields (系统字段)
    // ==================================================================

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
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

    /**
     * Author (作者)
     */
    author: relationship({
      ref: 'User',
      label: 'Author (作者)',
      ui: {
        displayMode: 'select',
        description: '页面创建者/最后编辑者',
      },
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: () => true, // Frontend needs to read
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    // Item-level: Prevent deletion of system pages
    item: {
      delete: ({ item }) => !item.isSystem,
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['slug', 'pageType', 'template', 'translatedLocales', 'status', 'order', 'updatedAt'],
      initialSort: { field: 'order', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'slug',
    label: 'Pages',
    description: '统一页面管理 - 包含固定模板页和自由落地页',
  },

  /**
   * Hooks
   */
  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      // Validate slug format
      if (resolvedData.slug) {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        if (!slugRegex.test(resolvedData.slug)) {
          addValidationError('Slug must be lowercase with hyphens only (e.g., service-overview)')
        }
      }

      // Validate path format
      if (resolvedData.path) {
        // Must start with /
        if (!resolvedData.path.startsWith('/')) {
          addValidationError('Path must start with / (e.g., /service/one-stop-shop)')
        }

        // Valid path format: /segment or /segment/segment
        const pathRegex = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/
        if (!pathRegex.test(resolvedData.path)) {
          addValidationError('Path must be lowercase with hyphens, using / as separator (e.g., /service/one-stop-shop)')
        }
      }

      // Validate TEMPLATE pages must have template name
      if (resolvedData.pageType === 'TEMPLATE' && !resolvedData.template) {
        addValidationError('Template pages must have a template name (e.g., SERVICE_OVERVIEW)')
      }
    },

    /**
     * Publishing Logic
     */
    resolveInput: async ({ operation, resolvedData, item }) => {
      if (operation === 'update' && resolvedData.status === 'PUBLISHED') {
        const wasPublished = item?.status === 'PUBLISHED'
        const isPublishing = !wasPublished

        if (isPublishing) {
          resolvedData.publishedAt = new Date()
          console.log(`✅ [Page] Publishing page: ${item?.slug || 'unknown'}`)
        }
      }

      return resolvedData
    },

    /**
     * After Operation Hook
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item?.slug) {
        console.log(`🔄 [Page] Cache cleared for: ${item.slug}`)
      }

      // ActivityLog: Log all operations
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'Page', item, undefined, originalItem)
      }
    },
  },
})
