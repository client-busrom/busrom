/**
 * ReusableBlockContentTranslation - 复用块内容翻译表
 *
 * 存储复用块在不同语言下的富文本内容
 * 采用与 Product/ProductSeries 相同的翻译表架构
 */

import { list } from '@keystone-6/core'
import { relationship, select, timestamp } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '../lib/languages'
import { componentBlocks } from '../component-blocks'
import { publicReadAccess } from '../lib/permissions/access-control'

export const ReusableBlockContentTranslation = list({
  fields: {
    /**
     * 关联的复用块主记录
     */
    reusableBlock: relationship({
      label: 'Reusable Block (复用块)',
      ref: 'ReusableBlock.contentTranslations',
      many: false,
      ui: {
        displayMode: 'select',
        description: 'The reusable block this translation belongs to | 此翻译所属的复用块',
      },
    }),

    /**
     * 语言代码
     */
    locale: select({
      label: 'Language (语言)',
      options: SUPPORTED_LANGUAGES.map(lang => ({
        label: `${LANGUAGE_FLAGS[lang]} ${LANGUAGE_NAMES[lang]}`,
        value: lang,
      })),
      defaultValue: 'en',
      validation: { isRequired: true },
      ui: {
        displayMode: 'select',
        description: 'Language for this translation | 此翻译的语言',
      },
    }),

    /**
     * 富文本内容 - Document Editor with Translation Features
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
        description: 'Rich text content for this language | 该语言的富文本内容',
      },
    }),

    /**
     * 时间戳
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
    plural: 'ReusableBlockContentTranslations',
  },

  /**
   * 访问控制
   */
  access: publicReadAccess('ReusableBlockContentTranslation'),

  /**
   * UI 配置
   */
  ui: {
    listView: {
      initialColumns: ['reusableBlock', 'locale', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
    labelField: 'locale',
    label: 'Reusable Block Translations',
    singular: 'Reusable Block Translation',
    plural: 'Reusable Block Translations',
    description: '复用块的多语言内容翻译',
  },
})
