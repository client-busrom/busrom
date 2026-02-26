import type { CollectionConfig } from 'payload'

export const SeriesTemplates: CollectionConfig = {
  slug: 'series-templates',
  labels: {
    singular: { en: 'Series Template', zh: '产品详解模版页' },
    plural: { en: 'Series Templates', zh: '产品详解模版页' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: { en: 'Product Center', zh: '产品中心' },
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
      label: { en: 'Identifier Name', zh: '识别名称' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: { en: 'Category', zh: '所属分类' },
      filterOptions: {
        type: { equals: 'PRODUCT' },
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { en: 'Rich Text Content', zh: '富文本内容' },
      admin: {
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
