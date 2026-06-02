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

import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook
} from 'payload'
import { autoIndexHook } from '../hooks/autoIndex'
import { autoIndexDeleteHook } from '../hooks/autoIndexDelete'





export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: {
      en: 'Product Detail Page',
      zh: '产品链接整合页',
    },
    plural: {
      en: 'Product Detail Pages',
      zh: '产品链接整合页',
    },
  },
  admin: {
    useAsTitle: 'sku',
    listSearchableFields: ['adminLabel', 'sku', 'slug', 'name'],
    defaultColumns: ['adminLabel', 'shopOrder', 'order', 'sku', 'name', 'category', 'series', 'status'],
    group: {
      en: 'Products',
      zh: '产品管理',
    },
    description: {
      en: 'Manage product integration pages (including basic info, images, and SEO)',
      zh: '管理产品整合页（包含基本信息、图片和SEO）',
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
              name: 'adminLabel',
              type: 'text',
              admin: {
                position: 'sidebar',
              },
              label: {
                en: 'Internal Admin Label',
                zh: '内部管理标识',
              },
            },
            {
              name: 'name',
              type: 'textarea',
              required: true,
              localized: true,
              label: {
                en: 'Product Title',
                zh: '产品标题',
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
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              label: {
                en: 'Category',
                zh: '所属分类',
              },
              filterOptions: {
                type: {
                  equals: 'PRODUCT',
                },
              },
              admin: {
                description: {
                  en: 'Primary category for this product (helps in filtering attributes and templates)',
                  zh: '该产品的主分类（有助于筛选属性和模版）',
                },
              },
            },
            {
              name: 'slug',
              type: 'textarea',
              label: {
                en: 'Slug',
                zh: 'URL标识',
              },
              admin: {
                description: {
                  en: 'This slug is generated from the English product name. Do not modify manually unless necessary.',
                  zh: '这个 slug 由产品名称的英文(en)自动生成，非必要请不要手动修改。',
                },
              },
              index: true,
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 2: Attributes & Content (Linked)
        // ----------------------------------------------------------
        {
          label: {
            en: 'Attributes & Content',
            zh: '属性与内容整合',
          },
          fields: [
            {
              name: 'attributePage',
              type: 'relationship',
              relationTo: 'product-attributes',
              label: {
                en: 'Attribute Page',
                zh: '关联属性页',
              },
              filterOptions: ({ data }) => {
                if (data?.category) {
                  return {
                    category: {
                      equals: data.category,
                    },
                  }
                }
                return true
              },
              admin: {
                description: {
                  en: 'Select the attribute/specification page for this product (filtered by category)',
                  zh: '为该产品选择关联的属性/规格页（根据分类自动筛选）',
                },
              },
            },
            {
              name: 'contentTemplate',
              type: 'relationship',
              relationTo: 'product-templates',
              label: {
                en: 'Content Template',
                zh: '关联产品链接模版页',
              },
              filterOptions: ({ data }) => {
                if (data?.category) {
                  return {
                    category: {
                      equals: data.category,
                    },
                  }
                }
                return true
              },
              admin: {
                description: {
                  en: 'Select the rich text content template for this product (filtered by category)',
                  zh: '为该产品选择关联的链接内容模版页性（根据分类自动筛选）',
                },
              },
            },
            {
              name: 'linkedForm',
              type: 'relationship',
              relationTo: 'form-configs',
              label: {
                en: 'Linked Form',
                zh: '关联表单',
              },
              admin: {
                description: {
                  en: 'Select a form to display in the main content section (overrides form-block in template)',
                  zh: '选择在详情内容板块显示的表单（如果选择，将覆盖模版中的 form-block 标记）',
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 3: Images
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
                  zh: '产品链接页图片（图库轮播）',
                },
                components: {
                  Field: '@/components/fields/MediaPicker',
                  Cell: '@/components/fields/MediaThumbnailCell',
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
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
    {
      name: 'googleIndexing',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/GoogleIndexingButton',
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
      label: {
        en: 'Shop Management',
        zh: 'Shop 列表管理',
      },
      type: 'collapsible',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'shopVisibility',
          type: 'checkbox',
          defaultValue: true,
          label: {
            en: 'Show in Shop List',
            zh: '在 Shop 列表展示',
          },
          admin: {
            description: {
              en: 'Toggle visibility of this product in the Shop gallery',
              zh: '控制该产品是否出现在 Shop 列表页',
            },
          },
        },
        {
          name: 'isHot',
          type: 'checkbox',
          defaultValue: false,
          label: {
            en: 'Hot Brand',
            zh: '爆品 (Hot)',
          },
        },
        {
          name: 'isNew',
          type: 'checkbox',
          defaultValue: false,
          label: {
            en: 'New Arrival',
            zh: '新品 (New)',
          },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Global Display Order',
            zh: '全局显示顺序',
          },
          admin: {
            description: {
              en: 'Generic order for this document in all lists. Used as a secondary fallback if Shop Sort Weight is identical.',
              zh: '文档通用排序字段。当“Shop 排序权重”相同时，系统会参考此字段进行二次排序（数字越大越靠前）。',
            },
          },
        },
        {
          name: 'shopOrder',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Sort Weight (Shop)',
            zh: 'Shop 列表排序权重',
          },
          admin: {
            description: {
              en: 'Primary sort key for Shop gallery. Higher number = appears first. Fallback order: Shop Weight > Global Order > Update Time.',
              zh: 'Shop 列表页的主排序权重。数字越大排名越靠前。排序逻辑：Shop权重 > 全局显示顺序 > 更新时间。',
            },
          },
        },
      ],
    },

  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing
        if (isTranslation) return data

        // Only generate slug from English name. Prevent other locales from overwriting it.
        if (data.name) {
          let nameToSlugify = '';

          if (typeof data.name === 'object' && data.name.en) {
            nameToSlugify = data.name.en;
          } else if (req.locale === 'en' || req.locale === 'all' || !req.locale) {
            nameToSlugify = typeof data.name === 'string' ? data.name : '';
          }

          if (nameToSlugify) {
            data.slug = nameToSlugify
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
        }
        return data
      },
    ],
    afterChange: [autoIndexHook('products')],
    afterDelete: [autoIndexDeleteHook('products')],
  },
}
