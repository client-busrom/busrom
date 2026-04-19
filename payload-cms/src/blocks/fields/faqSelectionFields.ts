
import { Field } from 'payload'

export const FaqSelectionFields: Field[] = [
  {
    name: 'categories',
    type: 'array',
    label: {
      en: 'FAQ Display Categories',
      zh: '要展示的 FAQ 分类',
    },
    minRows: 1,
    labels: {
      singular: { en: 'Category', zh: '分类' },
      plural: { en: 'Categories', zh: '分类' },
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            label: {
              en: 'Source Category',
              zh: '来源分类',
            },
            required: true,
            filterOptions: {
              type: { equals: 'FAQ' },
            },
            admin: {
              width: '50%',
            },
          },
          {
            name: 'icon',
            type: 'text',
            label: {
              en: 'Display Icon',
              zh: '展示图标',
            },
            admin: {
              width: '50%',
              components: {
                Field: '@/components/fields/IconPicker/index#IconPicker',
              },
            },
          },
        ],
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: {
          en: 'Display Image',
          zh: '展示图片',
        },
        admin: {
          description: {
            en: 'Visual representative for this FAQ category.',
            zh: '此 FAQ 分类的视觉展示图。',
          },
        },
      },
      {
        name: 'cta',
        type: 'group',
        label: {
          en: 'CTA Button',
          zh: '行动按钮',
        },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'label',
                type: 'text',
                label: { en: 'Button Label', zh: '按钮文字' },
                admin: { width: '50%' },
              },
              {
                name: 'icon',
                type: 'text',
                label: { en: 'Button Icon', zh: '按钮图标' },
                admin: {
                  width: '50%',
                  components: {
                    Field: '@/components/fields/IconPicker/index#IconPicker',
                  },
                },
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'url',
                type: 'text',
                label: { en: 'Link URL', zh: '链接地址' },
                admin: { width: '70%' },
              },
              {
                name: 'newTab',
                type: 'checkbox',
                label: { en: 'Open in New Tab', zh: '新标签页打开' },
                defaultValue: true,
                admin: { width: '30%', style: { marginTop: '35px' } },
              },
            ],
          },
        ],
      },
      {
        name: 'questions',
        type: 'array',
        label: {
          en: 'Selected FAQs',
          zh: '在这个分类下挑选的具体问题',
        },
        minRows: 1,
        fields: [
          {
            name: 'faqItem',
            type: 'relationship',
            relationTo: 'faq-items',
            label: {
              en: 'FAQ Item',
              zh: '常见问题条目',
            },
            required: true,
          },
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: {
              en: 'Question Image (Optional)',
              zh: '问题的配图 (可选)',
            },
          },
        ],
      },
    ],
  },
]
