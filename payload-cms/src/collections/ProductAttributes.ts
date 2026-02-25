import type { CollectionConfig } from 'payload'

export const ProductAttributes: CollectionConfig = {
  slug: 'product-attributes',
  labels: {
    singular: {
      en: 'Product Attribute Page',
      zh: '产品属性页',
    },
    plural: {
      en: 'Product Attribute Pages',
      zh: '产品属性页',
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
          en: 'Internal name for identification (e.g., "Glass Standoff Standard Attributes")',
          zh: '内部识别名称（例如："玻璃驳接件标准属性"）',
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
          en: 'Associate this attribute page with a product category for easier filtering',
          zh: '将此属性页关联到产品分类，以便于筛选',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Product Attributes',
            zh: '产品属性',
          },
          fields: [
            {
              name: 'productAttributes',
              type: 'json',
              localized: true,
              label: {
                en: 'Product Attributes',
                zh: '产品属性',
              },
              admin: {
                description: {
                  en: 'Excel-like grid for product attributes',
                  zh: '类 Excel 表格，用于填写产品属性',
                },
                components: {
                  Field: '@/components/fields/AttributesTableField',
                },
              },
            },
          ],
        },
        {
          label: {
            en: 'Specifications',
            zh: '产品规格',
          },
          fields: [
            {
              name: 'specifications',
              type: 'json',
              localized: true,
              label: {
                en: 'Product Specifications',
                zh: '产品规格',
              },
              admin: {
                description: {
                  en: 'Product variants specifications (colors, sizes, etc.)',
                  zh: '产品变体规格（颜色、尺寸等）',
                },
                components: {
                  Field: '@/components/fields/ProductSpecificationsField',
                },
              },
            },
          ],
        },
        {
          label: {
            en: 'Custom Attributes',
            zh: '自定义属性',
          },
          fields: [
            {
              name: 'customAttributes',
              type: 'json',
              localized: true,
              label: {
                en: 'Custom Attributes',
                zh: '自定义属性',
              },
              admin: {
                description: {
                  en: 'Excel-like grid for custom additional attributes',
                  zh: '类 Excel 表格，用于填写自定义额外属性',
                },
                components: {
                  Field: '@/components/fields/AttributesTableField',
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
  ],
  timestamps: true,
}
