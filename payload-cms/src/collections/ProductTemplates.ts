import type { CollectionConfig } from 'payload'

export const ProductTemplates: CollectionConfig = {
  slug: 'product-templates',
  labels: {
    singular: {
      en: 'Product Template Page',
      zh: '产品链接模版页',
    },
    plural: {
      en: 'Product Template Pages',
      zh: '产品链接模版页',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: {
      en: 'Products',
      zh: '产品管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Identifier Name',
        zh: '识别名称',
      },
      admin: {
        description: {
          en: 'Internal name for this template (e.g., "Standard Glass Standoff Detail")',
          zh: '此模版的内部名称（例如："标准玻璃驳接件详情"）',
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
          en: 'Associate this template with a product category for easier filtering',
          zh: '将此模版页关联到产品分类，以便于筛选',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: {
        en: 'Rich Text Content',
        zh: '富文本内容',
      },
      admin: {
        description: {
          en: 'Rich text content for product details',
          zh: '用于产品详情的富文本内容',
        },
        components: {
          beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
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
