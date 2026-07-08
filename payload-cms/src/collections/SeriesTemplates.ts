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
    group: { en: 'Product Center', zh: '产品管理' },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'translationCenter',
          type: 'ui',
          admin: {
            width: '100%',
            components: {
              Field: '@/components/fields/TranslationCenter',
            },
          },
        },
      ],
    },
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
          admin: { width: '33%' },
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Identifier Name', zh: '识别名称' },
      admin: {
        width: '100%',
        components: {
          Field: '@/components/fields/StableTextField',
        },
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: { en: 'Category', zh: '所属分类' },
      filterOptions: {
        type: { equals: 'PRODUCT' },
      },
      admin: {
        width: '100%',
      },
    },
    {
      name: 'googleIndexing',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/fields/GoogleIndexingButton',
        },
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
  ],
  timestamps: true,
}
