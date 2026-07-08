/**
 * Categories Collection - Reusable Categorization System
 *
 * General-purpose category system for:
 * - Product categories
 * - Application categories
 * - Blog categories
 * - FAQ categories
 *
 * Supports:
 * - Hierarchical categories (parent-child relationships)
 * - 24-language translations
 * - Soft delete
 */

import type { CollectionConfig } from 'payload'
import { syncM2M, cleanupM2M } from '../hooks/syncM2M'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      zh: '分类结构管理',
    },
    plural: {
      en: 'Categories',
      zh: '分类结构管理',
    },
  },
  admin: {
    useAsTitle: 'adminLabel',
    defaultColumns: ['adminLabel', 'name', 'type', 'order', 'status'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    // 1. afterRead: Ensure 'children' relationship field is populated from existing 'parent' pointers
    // This handles legacy data and cases where children were added from the child side.
    afterRead: [
      async ({ doc, req }) => {
        // Optimization: Skip heavy children population during translation saves or syncs
        if (req?.context?.isTranslationSave || req?.context?.isSyncing) {
          return doc
        }

        const { payload } = req
        if (!payload || !doc?.id) return doc

        try {
          const childrenResult = await payload.find({
            collection: 'categories',
            where: {
              parent: { equals: doc.id },
            },
            depth: 0,
            limit: 1000,
          })
          doc.children = childrenResult.docs.map((c) => c.id)
        } catch (e) {
          console.error(`Error populating children for category ${doc.id}:`, e)
        }
        return doc
      },
    ],
    // 2. beforeChange: generate fullTitle for admin UI and slug from English name
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        const { payload } = req
        const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing

        // [AUTO-PRESERVE STATUS] If status is missing from the update (e.g. background patches),
        // explicitly set it to the current value to prevent database resets.
        if (operation === 'update' && !data.status && originalDoc?.status) {
          data.status = originalDoc.status
        }

        if (operation === 'update' && !data.publishedAt && originalDoc?.publishedAt) {
          data.publishedAt = originalDoc.publishedAt
        }

        // Optimization: fullTitle only uses 'en'. 
        // Only re-calculate if English name, parent or slug is being changed.
        const isNameChanging = 'name' in data
        const isParentChanging = 'parent' in data
        const isSlugChanging = 'slug' in data
        const isCreate = operation === 'create'

        // Determine if we should skip
        let shouldSkip = !isNameChanging && !isParentChanging && !isSlugChanging && !isCreate

        if (isNameChanging && !isCreate) {
          const currentLocale = req.locale || 'en'
          // If we are updating a specific locale that is NOT en, and parent/slug aren't changing, we can skip
          if (currentLocale !== 'en' && !isParentChanging && !isSlugChanging) {
            // However, if data.name is an object (all-locales update), we check if en is inside
            if (typeof data.name === 'object' && data.name !== null) {
              if (!('en' in data.name)) {
                shouldSkip = true
              }
            } else {
              // It's a single-locale update and it's not en
              shouldSkip = true
            }
          }
        }

        if (shouldSkip) {
          return data
        }

        // For partial updates (like bulk edit or plugin updates), we need the full picture
        const targetDoc = { ...originalDoc, ...data }

        const getName = (doc: any) => {
          if (!doc) return ''
          const nameObj = doc.name || {}
          
          let name = 'Untitled'

          // Force English name extraction
          if (typeof nameObj === 'object' && nameObj !== null) {
            name = nameObj.en || doc.slug || 'Untitled'
          } else if (typeof nameObj === 'string') {
            // If it's a string, we hope it's English, but we can't be sure unless we have the full object
            // To be safe, when we fetch parent, we'll force locale: 'en'
            name = nameObj || doc.slug || 'Untitled'
          }
          
          return name
        }

        const currentName = getName(targetDoc)
        let fullTitle = currentName

        if (targetDoc.parent) {
          try {
            const parent = await payload.findByID({
              collection: 'categories',
              id: typeof targetDoc.parent === 'object' ? targetDoc.parent.id : targetDoc.parent,
              depth: 0,
              locale: 'en', // FORCE English locale for parent lookup
              select: {
                fullTitle: true,
                name: true,
              },
            })
            if (parent) {
              const parentTitle = (parent as any).fullTitle || getName(parent)
              fullTitle = `${parentTitle} > ${currentName}`
            }
          } catch (e) {
            console.error('Error fetching parent category for fullTitle:', e)
          }
        }
        data.fullTitle = fullTitle

        // [AUTO SLUG] Only generate slug from English name. Prevent translations from overwriting it.
        if (!isTranslation) {
          const nameObj = data.name || originalDoc?.name

          if (nameObj) {
            let nameToSlugify = ''

            if (typeof nameObj === 'object' && nameObj?.en) {
              nameToSlugify = nameObj.en
            } else if (req.locale === 'en' || req.locale === 'all' || !req.locale) {
              nameToSlugify = typeof nameObj === 'string' ? nameObj : ''
            }

            if (nameToSlugify) {
              data.slug = nameToSlugify
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
            }
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'fullTitle',
      type: 'text',
      label:{
        en: 'Full Title',
        zh: '完整标题',
      },
      admin: {
        hidden: true,
      },
      index: true,
    },
    // ==================================================================
    // Multi-language Name
    // ==================================================================
    {
      name: 'name',
      type: 'textarea',
      label: {
        en: 'Category Name',
        zh: '分类名称',
      },
      validate: (val, { operation }) => {
        if (operation === 'create' && (!val || val.length === 0)) {
          return 'Category Name is required'
        }
        return true
      },
      localized: true,
    },
    {
      name: 'adminLabel',
      type: 'textarea',
      label: {
        en: 'Admin Identification',
        zh: '内部管理标识',
      },
      admin: {
        description: {
          en: 'Friendly name for internal management (not used in URLs)',
          zh: '仅供内部管理查看，不影响公开 URL',
        },
      },
    },
    // ==================================================================
    // Description
    // ==================================================================
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
      admin: {
        description: {
          en: 'Localized description of this category',
          zh: '此分类的多语言描述',
        },
      },
    },

    // ==================================================================
    // Category Type
    // ==================================================================
    {
      name: 'type',
      type: 'select',
      label: {
        en: 'Category Type',
        zh: '分类类型',
      },
      required: true,
      options: [
        { label: { en: 'Page', zh: '页面' }, value: 'PAGE' },
        { label: { en: 'Product', zh: '产品' }, value: 'PRODUCT' },
        { label: { en: 'Blog', zh: '博客' }, value: 'BLOG' },
        { label: { en: 'Application', zh: '应用' }, value: 'APPLICATION' },
        { label: { en: 'FAQ', zh: '常见问题' }, value: 'FAQ' },
      ],
    },

    // ==================================================================
    // Hierarchy
    // ==================================================================
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: {
        en: 'Parent Category',
        zh: '父分类',
      },
      filterOptions: ({ data, id }) => {
        const filter: any = {}
        if (data?.type) {
          filter.type = { equals: data.type }
        }
        if (id) {
          filter.id = { not_equals: id }
        }
        return filter
      },
      admin: {
        description: {
          en: 'Select a parent category to build the hierarchy. The breadcrumb title at the top will update automatically after saving.',
          zh: '选择父级分类以建立层级关系。保存后，顶部的面包屑标题会自动更新。',
        },
      },
    },
    {
      name: 'children',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: {
        en: 'Sub-categories',
        zh: '管理子分类',
      },
      filterOptions: ({ data, id }) => {
        const filter: any = {}
        if (data?.type) {
          filter.type = { equals: data.type }
        }
        if (id) {
          filter.id = { not_equals: id }
        }
        return filter
      },
      admin: {
        readOnly: true,
        description: {
          en: 'This list is automatically managed. To change a category\'s parent, please edit that specific sub-category.',
          zh: '此列表由系统自动维护。如需修改层级关系，请直接进入对应的子分类修改其【Parent/父分类】。',
        },
      },
    },

    // ==================================================================
    // System Fields
    // ==================================================================
    {
      name: 'order',
      type: 'number',
      label: {
        en: 'Display Order',
        zh: '显示顺序',
      },
      defaultValue: 0,
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
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      defaultValue: 'draft',
      options: [
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
        { label: { en: 'Archived', zh: '归档' }, value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        disableListColumn: true,
      },
    },
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
      label: {
        en: 'Shop Visibility',
        zh: 'Shop 列表展示',
      },
      type: 'collapsible',
      admin: {
        condition: (data) => data?.type === 'PRODUCT',
        position: 'sidebar',
        disableListColumn: true,
      },
      fields: [
        {
          name: 'showInShop',
          type: 'checkbox',
          defaultValue: true,
          label: {
            en: 'Featured in Shop Tabs',
            zh: '在 Shop 顶部标签展示',
          },
        },
        {
          name: 'shopTabOrder',
          type: 'number',
          defaultValue: 0,
          label: {
            en: 'Tab Sort Order',
            zh: '标签显示排序',
          },
          admin: {
            description: {
              en: 'Determines the position of this category in the Shop top navigation',
              zh: '控制该分类在 Shop 页面顶部导航栏的位置',
            },
          },
        },
      ],
    },
    // ==================================================================
    // Shop Product Management (Category managing products)
    // ==================================================================
    {
      name: 'shopProducts',
      type: 'join',
      collection: 'products',
      on: 'category',
      label: {
        en: 'Linked Products',
        zh: '关联的产品',
      },
      admin: {
        condition: (data) => data?.type === 'PRODUCT',
        description: {
          en: 'Read-only list of products belonging to this category. To sort them, edit the shopOrder on the products themselves.',
          zh: '属于此分类的产品列表（只读视图）。若要调整排序，请前往具体产品详情中修改其 shopOrder（排序权重）。',
        },
      },
    },
    // ==================================================================
    // Blog Management (Category managing blog posts)
    // ==================================================================
    {
      name: 'blogPosts',
      type: 'join',
      collection: 'blogs',
      on: 'categories',
      label: {
        en: 'Linked Blogs',
        zh: '关联的文章',
      },
      admin: {
        condition: (data) => data?.type === 'BLOG',
        description: {
          en: 'Read-only list of blog posts belonging to this category.',
          zh: '属于此分类的文章列表（只读视图）。若要调整文章的排序规则或归属，请前往具体文章详情。',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Technical Slug',
        zh: '技术标识 (自动生成)',
      },
      validate: async (val: string | any, { data, req, id }: any) => {
        if (!val) return true
        let type = data?.type
        if (!type && id) {
          const existing = await req.payload.findByID({
            collection: 'categories',
            id,
            depth: 0,
            req,
          })
          type = existing?.type
        }
        if (!type) return true
        try {
          const results = await req.payload.find({
            collection: 'categories',
            where: {
              and: [
                { slug: { equals: val } },
                { type: { equals: type } },
                ...(id ? [{ id: { not_equals: id } }] : []),
              ],
            },
            limit: 1,
            depth: 0,
            req,
          })
          if (results.docs.length > 0) {
            return req.locale === 'zh' 
              ? '该 URL 标识在当前分类类型下已存在' 
              : 'Slug must be unique within the same category type'
          }
        } catch (e) {
          return true
        }
        return true
      },
      admin: {
        readOnly: true,
        description: {
          en: 'This is automatically generated from the English Name.',
          zh: '此字段根据英文名称自动生成。',
        },
      },
    },
    // ==================================================================
    // Breadcrumbs (Manual override for Nested Docs Plugin)
    // ==================================================================
    {
      name: 'breadcrumbs',
      type: 'array',
      label: {
        en: 'Hierarchy Breadcrumbs (Auto-generated)',
        zh: '层级面包屑 (系统自动生成)',
      },
      localized: false,
      admin: {
        readOnly: true,
        description: {
          en: 'This list is automatically managed by the system. Do not edit manually.',
          zh: '此列表由系统自动维护。请勿手动修改此处的数值。',
        },
      },
      fields: [
        {
          name: 'doc',
          type: 'relationship',
          relationTo: 'categories',
          admin: {
            disabled: true,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'url',
              type: 'text',
              label: {
                en: 'URL Path',
                zh: 'URL 路径',
              },
              admin: {
                width: '50%',
              },
            },
            {
              name: 'label',
              type: 'text',
              label: {
                en: 'Label',
                zh: '标签名称',
              },
              admin: {
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
