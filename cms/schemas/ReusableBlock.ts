/**
 * ReusableBlock Model - 复用块
 *
 * 存储可复用的Document JSON内容片段。
 * 通过引用key的方式在文档中使用，修改源块后所有引用处都会更新。
 *
 * Features:
 * - 多语言支持（通过 ReusableBlockContentTranslation 关系表）
 * - 主表-翻译表架构（与 Product/ProductSeries 相同）
 * - 一个 key 对应多个语言版本
 */

import { list, graphql } from '@keystone-6/core'
import { text, select, timestamp, relationship, virtual } from '@keystone-6/core/fields'
import { publicReadAccess } from '../lib/permissions/access-control'

export const ReusableBlock = list({
  fields: {
    // ==================================================================
    // 🔑 基本信息
    // ==================================================================

    /**
     * Key - 唯一标识符
     * 用于在 Document 中引用此复用块
     */
    key: text({
      label: 'Key (唯一标识)',
      isIndexed: 'unique',
      validation: { isRequired: true },
      ui: {
        description: 'Unique identifier (e.g., "global-footer", "contact-form") | 唯一标识符，用于引用',
      },
    }),

    /**
     * Name - 显示名称
     */
    name: text({
      label: 'Name (名称)',
      validation: { isRequired: true },
      ui: {
        description: 'Display name for this block | 复用块的显示名称',
      },
    }),

    /**
     * Category - 分类
     */
    category: select({
      label: 'Category (分类)',
      options: [
        { label: 'Footer', value: 'footer' },
        { label: 'Form', value: 'form' },
        { label: 'CTA Section', value: 'cta' },
        { label: 'Navigation', value: 'navigation' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
      ui: {
        description: 'Category for organizing blocks | 用于组织复用块的分类',
      },
    }),

    // ==================================================================
    // 📄 多语言内容翻译（关系表方式）
    // ==================================================================

    /**
     * Content Translations - 内容翻译
     * 每个语言对应一条 ReusableBlockContentTranslation 记录
     */
    contentTranslations: relationship({
      label: 'Content Translations (内容翻译)',
      ref: 'ReusableBlockContentTranslation.reusableBlock',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['locale', 'updatedAt'],
        inlineCreate: { fields: ['locale'] },
        inlineEdit: { fields: ['locale', 'content'] },
        linkToItem: true,
        inlineConnect: true,
        description: 'Click language card to edit rich text content | 点击语言卡片编辑富文本内容',
      },
    }),

    /**
     * Virtual Field: 快速访问指定语言的内容
     */
    contentByLocale: virtual({
      field: graphql.field({
        type: graphql.object<{ locale: string; content: any }>()({
          name: 'ReusableBlockContentByLocale',
          fields: {
            locale: graphql.field({ type: graphql.String }),
            content: graphql.field({ type: graphql.JSON }),
          },
        }),
        args: {
          locale: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(item, { locale }, context) {
          const translations = await context.query.ReusableBlockContentTranslation.findMany({
            where: {
              reusableBlock: { id: { equals: item.id as string } },
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
     * Virtual Field: 显示已翻译的语言列表
     */
    translatedLocales: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const translations = await context.query.ReusableBlockContentTranslation.findMany({
            where: {
              reusableBlock: { id: { equals: item.id as string } },
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
    // ⚙️ 系统字段
    // ==================================================================

    /**
     * Status - 状态
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
        description: 'Only PUBLISHED blocks can be used in documents | 只有已发布状态的复用块可以在文档中使用',
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
   * GraphQL 配置
   */
  graphql: {
    plural: 'ReusableBlocks',
  },

  /**
   * 访问控制
   */
  access: publicReadAccess('ReusableBlock'),

  /**
   * UI 配置
   */
  ui: {
    listView: {
      initialColumns: ['key', 'name', 'translatedLocales', 'category', 'status', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'key',
    label: 'Reusable Blocks | 可复用块',
    singular: 'Reusable Block | 可复用块',
    plural: 'Reusable Blocks | 可复用块',
    description: '🔗 Reusable Blocks - Content blocks that can be referenced across multiple documents',
  },
})
