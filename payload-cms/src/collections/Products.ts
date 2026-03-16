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

// 内存锁：确保同一个分类的 shopProducts 更新是串行的，防止高并发覆盖
const categoryUpdateQueue: Record<string, Promise<void>> = {}

const runSequentially = async (categoryId: string, task: () => Promise<void>) => {
  // 获取该分类的当前任务链
  const previousTask = categoryUpdateQueue[categoryId] || Promise.resolve()
  
  // 创建新任务并挂在链条上
  const currentTask = (async () => {
    try {
      await previousTask
      await task()
    } catch (e) {
      console.error(`[Category Sync Queue Error]:`, e)
    }
  })()
  
  categoryUpdateQueue[categoryId] = currentTask
  
  // 运行后清理，防止内存积压
  currentTask.finally(() => {
    if (categoryUpdateQueue[categoryId] === currentTask) {
      delete categoryUpdateQueue[categoryId]
    }
  })
  
  return currentTask
}

const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  const getCatId = (c: any) => (c && typeof c === 'object' ? c.id : c)
  const newCatId = getCatId(doc.category)
  const oldCatId = getCatId(previousDoc?.category)

  if (operation === 'update' && newCatId === oldCatId) return

  // 1. 处理旧分类移除
  if (oldCatId) {
    await runSequentially(oldCatId, async () => {
      try {
        const oldCat: any = await payload.findByID({ collection: 'categories', id: oldCatId, depth: 0 })
        if (oldCat) {
          const currentProducts = (oldCat.shopProducts || []).map((p: any) => getCatId(p))
          const updatedProducts = currentProducts.filter((id: any) => id !== doc.id)
          if (currentProducts.length !== updatedProducts.length) {
            await payload.update({
              collection: 'categories',
              id: oldCatId,
              data: { shopProducts: updatedProducts } as any,
            })
          }
        }
      } catch (e: any) {
        console.warn(`[Products Hook] Remove error:`, e.message)
      }
    })
  }

  // 2. 处理新分类添加
  if (newCatId) {
    await runSequentially(newCatId, async () => {
      try {
        const newCat: any = await payload.findByID({ collection: 'categories', id: newCatId, depth: 0 })
        if (newCat) {
          const currentProducts = (newCat.shopProducts || []).map((p: any) => getCatId(p))
          if (!currentProducts.includes(doc.id)) {
            await payload.update({
              collection: 'categories',
              id: newCatId,
              data: { shopProducts: [...currentProducts, doc.id] } as any,
            })
          }
        }
      } catch (e: any) {
        console.warn(`[Products Hook] Add error:`, e.message)
      }
    })
  }
}

const afterDeleteHook: CollectionAfterDeleteHook = async ({ req: { payload }, id, doc }) => {
  const getCatId = (c: any) => (c && typeof c === 'object' ? c.id : c)
  const catId = getCatId(doc.category)
  if (!catId) return

  await runSequentially(catId, async () => {
    try {
      const cat: any = await payload.findByID({ collection: 'categories', id: catId, depth: 0 })
      if (cat) {
        const currentProducts = (cat.shopProducts || []).map((p: any) => getCatId(p))
        const updatedProducts = currentProducts.filter((pId: any) => pId !== id)
        if (currentProducts.length !== updatedProducts.length) {
          await payload.update({
            collection: 'categories',
            id: catId,
            data: { shopProducts: updatedProducts } as any,
          })
        }
      }
    } catch (e: any) {
      console.warn(`[Products Hook] Delete sync error:`, e.message)
    }
  })
}


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
    defaultColumns: ['sku', 'name', 'series', 'status', 'isFeatured'],
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
        en: 'Global Display Order',
        zh: '全局显示顺序',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Generic order for this document in all lists',
          zh: '该文档在所有列表中的通用顺序',
        },
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
          name: 'shopOrder',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Sort Weight (Shop)',
            zh: 'Shop 列表排序权重',
          },
          admin: {
            description: {
              en: 'Higher number = appears first in the shop list',
              zh: '数字越大在列表页排名越靠前',
            },
          },
        },
      ],
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
    afterChange: [afterChangeHook],
    afterDelete: [afterDeleteHook],
  },
}
