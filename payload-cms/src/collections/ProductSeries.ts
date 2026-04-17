/**
 * ProductSeries Collection
 *
 * Represents a series or collection of related products
 * Migrated from Keystone ProductSeries schema
 *
 * Key improvements in Payload:
 * - Native localization (no JSON workarounds)
 * - Built-in rich text with Lexical editor
 * - Simplified content structure
 * - Tabbed admin interface
 */

import type { CollectionConfig } from 'payload'

export const ProductSeries: CollectionConfig = {
  slug: 'product-series',
  labels: {
    singular: {
      en: 'Series Integration Page',
      zh: '产品详解整合页',
    },
    plural: {
      en: 'Series Integration Pages',
      zh: '产品详解整合页',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'order'],
    group: {
      en: 'Product Center',
      zh: '产品管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ==================================================================
        // Tab 1: Basic Information
        // ==================================================================
        {
          label: {
            en: 'Basic Info',
            zh: '基本信息',
          },
          fields: [
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              label: {
                en: 'Slug',
                zh: 'URL标识',
              },
              admin: {
                description: {
                  en: 'URL-friendly identifier (e.g., "elite-door-handle-series")',
                  zh: 'URL友好标识符（如 "elite-door-handle-series"）',
                },
              },
              index: true,
            },
            {
              name: 'name',
              type: 'textarea',
              required: true,
              localized: true,
              label: {
                en: 'Series Name',
                zh: '系列名称',
              },
              admin: {
                description: {
                  en: 'Product series name (localized)',
                  zh: '产品系列名称（多语言）',
                },
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Short Description',
                zh: '简短描述',
              },
              admin: {
                description: {
                  en: 'Brief series description (localized)',
                  zh: '简短的系列描述（多语言）',
                },
              },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              label: {
                en: 'Category',
                zh: '分类',
              },
              admin: {
                description: {
                  en: 'Primary category for this product series',
                  zh: '该产品系列的主分类',
                },
              },
              filterOptions: {
                type: {
                  equals: 'PRODUCT',
                },
              },
            },
            {
              name: 'seriesTemplate',
              type: 'relationship',
              relationTo: 'series-templates',
              label: {
                en: 'Series Template',
                zh: '关联产品详解页模版',
              },
              admin: {
                description: {
                  en: 'Select the rich text content template for this series',
                  zh: '为该产品系列选择关联的内容模版页性',
                },
              },
            },
          ],
        },


        // ==================================================================
        // Tab 3: Images
        // ==================================================================
        {
          label: {
            en: 'Images',
            zh: '图片',
          },
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Featured Image',
                zh: '特色图片',
              },
              admin: {
                description: {
                  en: 'Main image for this series',
                  zh: '该系列的主图',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
          ],
        },

        // ==================================================================
        // Tab 4: Products
        // ==================================================================
        {
          label: {
            en: 'Products',
            zh: '产品列表',
          },
          fields: [
            {
              name: 'products',
              type: 'join',
              collection: 'products',
              on: 'series',
              label: {
                en: 'Products',
                zh: '包含产品',
              },
              admin: {
                description: {
                  en: 'Products in this series',
                  zh: '该系列下的产品',
                },
              },
            },
          ],
        },
      ],
    },

    // ==================================================================
    // Sidebar Fields
    // ==================================================================
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
        { label: { en: 'Archived', zh: '已归档' }, value: 'archived' },
      ],
      label: {
        en: 'Status',
        zh: '状态',
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: {
        en: 'Display Order',
        zh: '显示顺序',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Lower number = higher priority',
          zh: '数字越小优先级越高',
        },
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Is Featured',
        zh: '是否推荐',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // IndexNow submission for SEO (to be implemented)
        if (operation === 'create' || operation === 'update') {
          // await submitToIndexNow(`/product-series/${doc.slug}`)
        }
      },
    ],
  },
}
