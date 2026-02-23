/**
 * Products Collection
 *
 * Product catalog management
 * Migrated from Keystone Product schema
 *
 * Key improvements in Payload:
 * - Native localization (no JSON workarounds for multilingual fields)
 * - Built-in rich text with Lexical editor
 * - Simplified image handling
 * - Tab UI for better organization
 */

import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: {
      en: 'Product',
      zh: '产品',
    },
    plural: {
      en: 'Products',
      zh: '产品',
    },
  },
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'name', 'series', 'status', 'isFeatured'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
  },
  access: {
    read: () => true, // Public read
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },
  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // ==================================================================
    // Tab Layout for better organization
    // ==================================================================
    {
      type: 'tabs',
      tabs: [
        // ----------------------------------------------------------
        // Tab 1: Basic Info
        // ----------------------------------------------------------
        {
          label: {
            en: 'Basic Info',
            zh: '基本信息',
          },
          fields: [
            {
              name: 'sku',
              type: 'text',
              required: true,
              label: {
                en: 'SKU',
                zh: '产品型号',
              },
              admin: {
                description: {
                  en: 'Product model code (e.g., "GDH-001")',
                  zh: '产品型号代码（如 "GDH-001"）',
                },
              },
              index: true,
            },
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
                  en: 'URL-friendly identifier (auto-generated if empty)',
                  zh: 'URL友好标识符（留空时自动生成）',
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
                en: 'Product Name',
                zh: '产品名称',
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Short Description',
                zh: '简短描述',
              },
              admin: {
                description: {
                  en: 'Brief product description for listings',
                  zh: '用于列表展示的简短产品描述',
                },
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Description',
                zh: '详细描述',
              },
              admin: {
                description: {
                  en: 'Detailed product description',
                  zh: '详细的产品描述',
                },
              },
            },
            {
              name: 'series',
              type: 'relationship',
              relationTo: 'product-series',
              label: {
                en: 'Product Series',
                zh: '产品系列',
              },
              admin: {
                description: {
                  en: 'Series this product belongs to',
                  zh: '该产品所属的系列',
                },
              },
            },
            {
              name: 'productAttributes',
              type: 'richText',
              localized: true,
              label: {
                en: 'Product Attributes/Highlights',
                zh: '产品属性/核心亮点',
              },
              admin: {
                description: {
                  en: 'Rich text for specific product attributes. You can use Document Templates to insert common ones.',
                  zh: '用于特定产品属性的富文本。可以使用"文档模板"插入通用内容。',
                },
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 2: Content Translation (Rich Text)
        // ----------------------------------------------------------
        {
          label: {
            en: 'Content',
            zh: '内容',
          },
          fields: [
            {
              name: 'contentTranslation',
              type: 'richText',
              localized: true,
              label: {
                en: 'Content',
                zh: '富文本内容',
              },
              admin: {
                description: {
                  en: 'Rich text content - use language tabs above to switch locales',
                  zh: '富文本内容 - 使用上方的语言选项卡切换语言',
                },
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 3: Specifications (Multilingual JSON)
        // ----------------------------------------------------------
        {
          label: {
            en: 'Specifications',
            zh: '规格',
          },
          fields: [
            {
              name: 'specifications',
              type: 'json',
              localized: true,
              label: {
                en: 'Product Specifications',
                zh: '产品规格',
              },
              admin: {
                description: {
                  en: 'Product variants (colors, sizes, etc.)',
                  zh: '产品变体（颜色、尺寸等）',
                },
                components: {
                  Field: '@/components/fields/ProductSpecificationsField',
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 4: Images
        // ----------------------------------------------------------
        {
          label: {
            en: 'Images',
            zh: '图片',
          },
          fields: [
            {
              name: 'showImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Show Image',
                zh: '展示图片',
              },
              admin: {
                description: {
                  en: 'Product list display image',
                  zh: '产品列表展示图片',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
            {
              name: 'mainImage',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              label: {
                en: 'Main Images',
                zh: '产品主图',
              },
              admin: {
                description: {
                  en: 'Product detail page images (gallery with hover carousel)',
                  zh: '产品详情页图片（图库轮播）',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
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
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-generate slug from name if empty
        if (operation === 'create' && !data?.slug && data?.name) {
          const name = typeof data.name === 'string' ? data.name : data.name?.en || data.name?.zh || ''
          data.slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return data
      },
    ],
  },
}
