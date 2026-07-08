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
import { autoIndexHook } from '../hooks/autoIndex'
import { autoIndexDeleteHook } from '../hooks/autoIndexDelete'
import { createNotifyIndexNowEndpoint } from '../endpoints/notifyIndexNow'


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
    pagination: { defaultLimit: 100 },
    useAsTitle: 'name',
    listSearchableFields: ['name', 'slug'],
    defaultColumns: ['name', 'slug', 'status', 'order'],
    components: {
    },
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
  endpoints: [
    {
      path: '/:id/notify-google',
      method: 'post',
      handler: async (req) => {
        const { payload, user, routeParams } = req
        if (!user) return new Response('Unauthorized', { status: 401 })

        const id = routeParams?.id
        if (!id) return new Response('Missing ID', { status: 400 })

        try {
          // 1. Fetch the doc to get slug
          const doc = await payload.findByID({
            collection: 'product-series',
            id: id as string,
            depth: 0,
          })

          if (!doc || doc.status !== 'published') {
            return new Response(JSON.stringify({ error: 'Only published series can be indexed.' }), { status: 400 })
          }

          const { notifyGoogleOfUpdate } = await import('../lib/google-indexing')
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

          // Only notify Google of the primary (en) URL to stay within the 200/day quota.
          const url = `${siteUrl}/products/${doc.slug}`
          const res = await notifyGoogleOfUpdate(url)

          try {
            await payload.create({
              collection: 'indexing-logs',
              req,
              overrideAccess: true,
              data: {
                targetUrl: url,
                engine: 'google',
                action: 'update',
                status: res?.success ? 'success' : (res?.message?.includes('Credentials') || res?.message?.includes('Key') ? 'failed_keys' : 'failed_network'),
                triggerUser: user.id,
                rawResponse: res,
              }
            })
          } catch (e) {
            console.error('Failed to write SEO log in notify-google:', e)
          }

          return new Response(JSON.stringify({ success: res?.success, result: res, url }), { status: res?.success ? 200 : 500 })
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 })
        }
      },
    },
    {
      path: '/:id/notify-indexnow',
      method: 'post',
      handler: createNotifyIndexNowEndpoint('product-series'),
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          label: { en: 'Status', zh: '状态' },
          defaultValue: 'draft',
          options: [
            { label: { en: 'Published', zh: '已发布' }, value: 'published' },
            { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
            { label: { en: 'Archived', zh: '归档' }, value: 'archived' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'publishedAt',
          type: 'date',
          label: { en: 'Published At', zh: '发布时间' },
          admin: {
            width: '42%',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'isSystem',
          type: 'checkbox',
          label: { en: 'System Page', zh: '系统页面' },
          defaultValue: false,
          admin: {
            width: '25%',
            description: { en: 'System pages cannot be deleted', zh: '系统页面无法删除' },
          },
        },
      ],
    },
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
      name: 'indexNow',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/IndexNowButton',
        },
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
        disableListColumn: true,
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
        disableListColumn: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing

        if (operation === 'update' && !data.status && originalDoc?.status) {
          data.status = originalDoc.status
        }
        
        if (operation === 'update' && !data.publishedAt && originalDoc?.publishedAt) {
          data.publishedAt = originalDoc.publishedAt
        }

        if (isTranslation) return data

        const nameObj = data.name || originalDoc?.name;
        
        if (nameObj) {
          let nameToSlugify = '';

          if (typeof nameObj === 'object' && nameObj.en) {
            nameToSlugify = nameObj.en;
          } else if (req.locale === 'en' || req.locale === 'all' || !req.locale) {
            nameToSlugify = typeof nameObj === 'string' ? nameObj : '';
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
    afterChange: [autoIndexHook('product-series')],
    afterDelete: [autoIndexDeleteHook('product-series')],
  },
}
