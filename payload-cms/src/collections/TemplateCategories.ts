/**
 * TemplateCategories Collection
 *
 * Manages document template categories dynamically.
 * Admins can add/edit/delete categories from the CMS UI
 * without needing code changes.
 */

import type { CollectionConfig } from 'payload'

export const TemplateCategories: CollectionConfig = {
  slug: 'template-categories',
  labels: {
    singular: {
      en: 'Template Category',
      zh: '模版库分类集合',
    },
    plural: {
      en: 'Template Categories',
      zh: '模版库分类集合',
    },
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'order'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.isAdmin === true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Auto-generate bilingual label from localized name field
        // Format: "中文名 | English Name"
        const payload = req.payload
        const locale = req.locale || 'en'
        const docId = originalDoc?.id || data.id

        let enName = ''
        let zhName = ''

        if (operation === 'create') {
          if (locale === 'zh') {
            zhName = data.name || ''
          } else {
            enName = data.name || ''
          }
        } else if (operation === 'update' && docId) {
          // Fetch both locale versions from DB
          try {
            const [enDoc, zhDoc] = await Promise.all([
              payload.findByID({ collection: 'template-categories', id: docId, locale: 'en' }),
              payload.findByID({ collection: 'template-categories', id: docId, locale: 'zh' }),
            ])
            enName = (enDoc as any)?.name || ''
            zhName = (zhDoc as any)?.name || ''
          } catch {
            // fallback
          }

          // Override with current update data
          if (locale === 'en' && data.name) enName = data.name
          if (locale === 'zh' && data.name) zhName = data.name
        }

        // Build label: prefer "zh | en", fallback to whichever is available
        if (zhName && enName && zhName !== enName) {
          data.label = `${zhName} | ${enName}`
        } else {
          data.label = zhName || enName || data.name || ''
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Category Name',
        zh: '分类名称',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: {
        en: 'Display Label',
        zh: '显示标签',
      },
      admin: {
        hidden: true,
        description: {
          en: 'Auto-generated bilingual label (do not edit manually)',
          zh: '自动生成的双语标签（请勿手动编辑）',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: {
        en: 'Slug',
        zh: '标识',
      },
      admin: {
        description: {
          en: 'Unique identifier (e.g., "product-intro", "faq")',
          zh: '唯一标识符（例如："product-intro"、"faq"）',
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
      },
    },
    {
      name: 'templates',
      type: 'join',
      collection: 'document-templates',
      on: 'category',
      label: {
        en: 'Document Templates',
        zh: '页面板块模板库',
      },
      admin: {
        description: {
          en: 'Templates belonging to this category',
          zh: '属于此分类的页面板块模板',
        },
      },
    },
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
  ],
  timestamps: true,
}
