import type { CollectionConfig } from 'payload'

export const SeriesReusableBlocks: CollectionConfig = {
  slug: 'series-reusable-blocks',
  labels: {
    singular: { en: 'Series Block', zh: '产品详解复用块' },
    plural: { en: 'Series Blocks', zh: '产品详解复用块' },
  },
  admin: {
    useAsTitle: 'slug',
    group: { en: 'Product Center', zh: '产品管理' },
    defaultColumns: ['slug', 'title', 'status', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Basic Info', zh: '基本信息' },
          fields: [
            {
              name: 'slug',
              type: 'text',
              label: { en: 'Slug', zh: '标识' },
              required: true,
              unique: true,
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
              name: 'title',
              type: 'textarea',
              label: { en: 'Title', zh: '标题' },
              localized: true,
            },
          ],
        },
        {
          label: { en: 'Content', zh: '内容' },
          fields: [
            {
              name: 'contentTranslation',
              type: 'richText',
              label: { en: 'Content', zh: '富文本内容' },
              localized: true,
              admin: {
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },
      ],
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
        position: 'sidebar',
        disableListColumn: true,
      },
    },
  ],
  timestamps: true,
}
