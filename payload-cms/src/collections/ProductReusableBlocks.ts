import type { CollectionConfig } from 'payload'

export const ProductReusableBlocks: CollectionConfig = {
  slug: 'product-reusable-blocks',
  labels: {
    singular: {
      en: 'Product Detail Block',
      zh: '产品链接复用块',
    },
    plural: {
      en: 'Product Detail Blocks',
      zh: '产品链接复用块',
    },
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'category', 'status', 'updatedAt'],
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
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Basic Info',
            zh: '基本信息',
          },
          fields: [
            {
              name: 'slug',
              type: 'text',
              label: {
                en: 'Slug',
                zh: '标识',
              },
              required: true,
              unique: true,
              admin: {
                description: {
                  en: 'Unique identifier (e.g., "warranty-info", "shipping-details")',
                  zh: '唯一标识符（例如："warranty-info", "shipping-details"）',
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
                  en: 'Associate this block with a product category',
                  zh: '将此区块关联到产品分类',
                },
              },
            },
            {
              name: 'title',
              type: 'textarea',
              label: {
                en: 'Title',
                zh: '标题',
              },
              localized: true,
            },
          ],
        },
        {
          label: {
            en: 'Content',
            zh: '内容',
          },
          fields: [
            {
              name: 'contentTranslation',
              type: 'richText',
              label: {
                en: 'Content',
                zh: '富文本内容',
              },
              localized: true,
              admin: {
                description: {
                  en: 'Rich text content for this product block',
                  zh: '此产品区块的富文本内容',
                },
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
        components: {
          Field: '@/components/fields/TranslationCenter',
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
      },
    },
  ],
  timestamps: true,
}
