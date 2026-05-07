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
import { formatSlug } from '../hooks/formatSlug'

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
    useAsTitle: 'fullTitle',
    defaultColumns: ['fullTitle', 'type', 'order', 'status'],
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
      async ({ doc, req: { payload } }) => {
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
    // 2. beforeChange: Synchronize bi-directional relationships
    beforeChange: [
      async ({ data, req, originalDoc, context }) => {
        // Prevent infinite recursion during sync
        if (context.isSyncing) return data

        const { payload } = req

        // --- Part A: Handle fullTitle generation ---
        const getName = (doc: any) => {
          if (!doc) return ''
          if (doc.name && typeof doc.name === 'object') {
            return doc.name.en || doc.name.zh || doc.slug || 'Untitled'
          }
          return doc.name || doc.slug || 'Untitled'
        }

        const currentName = getName(data)
        let fullTitle = currentName

        if (data.parent) {
          try {
            const parent = await payload.findByID({
              collection: 'categories',
              id: typeof data.parent === 'object' ? data.parent.id : data.parent,
              depth: 0,
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

        // --- Part B: Handle bi-directional sync (Child -> Parent) ---
        // If parent field changed on this document, we don't need to do much here
        // because the afterRead hook on the parent side will pick it up,
        // but to keep DB data consistent if we're storing children array:
        
        // --- Part C: Handle bi-directional sync (Parent -> Child) ---
        // If this document is being updated and 'children' array exists (from the UI)
        if (originalDoc && data.children !== undefined) {
          const newChildrenIds = (data.children || []).map((c: any) => typeof c === 'object' ? c.id : c)
          const oldChildrenIds = (originalDoc.children || []).map((c: any) => typeof c === 'object' ? c.id : c)

          // 1. Added children: Set their parent to this category
          const added = newChildrenIds.filter((id: any) => !oldChildrenIds.includes(id))
          for (const childId of added) {
            await payload.update({
              collection: 'categories',
              id: childId,
              data: { parent: originalDoc.id },
              // Use context to prevent infinite loop
              context: {
                isSyncing: true
              }
            })
          }

          // 2. Removed children: Set their parent to null
          const removed = oldChildrenIds.filter((id: any) => !newChildrenIds.includes(id))
          for (const childId of removed) {
            await payload.update({
              collection: 'categories',
              id: childId,
              data: { parent: null },
              context: {
                isSyncing: true
              }
            })
          }
        }

        return data
      },
    ],
    afterChange: [
      syncM2M('blogs', 'categories', 'blogPosts'),
    ],
    afterDelete: [
      cleanupM2M('blogs', 'categories', 'blogPosts'),
    ],
  },
  fields: [
    {
      name: 'fullTitle',
      type: 'text',
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
      required: true,
      localized: true,
      admin: {
        description: {
          en: 'Bilingual category name',
          zh: '双语分类名称',
        },
      },
    },
    {
      name: 'adminLabel',
      type: 'text',
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
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Technical Slug',
        zh: '技术标识 (自动生成)',
      },
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
      // Removed global uniqueness to support same name across different types
      // unique: true,
      validate: async (val: string | any, { data, req, id }: any) => {
        if (!val) return true
        
        let type = data?.type
        // Fallback to existing doc if type is not in data (partial update)
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
          // Fallback to true if query fails to avoid blocking saves
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
          en: 'Parent category for hierarchical structure (filtered by same type)',
          zh: '用于层级结构的父分类（仅显示相同类型的分类）',
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
        description: {
          en: 'Select existing categories to be sub-categories of this category',
          zh: '直接从此处选择已有的分类作为该分类的子分类',
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
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: {
        en: 'Product Links Management',
        zh: '属下产品链接管理',
      },
      filterOptions: {
        // Only allow products to be linked here
        status: { in: ['published', 'draft'] }
      },
      admin: {
        condition: (data) => data?.type === 'PRODUCT',
        description: {
          en: 'Manually manage and sort product links under this category for the Shop page. (Only products belonging to this category are shown)',
          zh: '手动管理并排序该分类下的产品链接（仅限属于该分类的产品，用于在此界面直接控制展示顺序）',
        },
      },
    },
    {
      name: 'shopProductsManager',
      type: 'ui',
      admin: {
        condition: (data) => data?.type === 'PRODUCT',
        components: {
          Field: '@/components/fields/CategoryProductManager#CategoryProductManager',
        },
      },
    },
    // ==================================================================
    // Blog Management (Category managing blog posts)
    // ==================================================================
    {
      name: 'blogPosts',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      label: {
        en: 'Associated Blogs Management',
        zh: '属下知识库管理',
      },
      filterOptions: {
        // Only allow blogs to be linked here
        status: { in: ['published', 'draft'] }
      },
      admin: {
        condition: (data) => data?.type === 'BLOG',
        description: {
          en: 'Manually manage and sort blog posts under this category. (Only blogs belonging to this category are shown)',
          zh: '手动管理并排序该分类下的文章（仅限属于该分类的文章，用于控制展示顺序）',
        },
      },
    },
    {
      name: 'blogPostsManager',
      type: 'ui',
      admin: {
        condition: (data) => data?.type === 'BLOG',
        components: {
          Field: '@/components/fields/CategoryBlogManager#CategoryBlogManager',
        },
      },
    },
  ],
  timestamps: true,
}
