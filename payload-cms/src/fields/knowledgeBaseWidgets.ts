import type { Field, GroupField, RadioField } from 'payload'

interface CreateWidgetOptions {
  name: string
  label: string
  isOverride?: boolean
  subFields?: any[]
}

/**
 * Creates flattened fields for Knowledge Base widgets to ensure better persistence and translation support.
 */
export const createKBWidgetField = ({
  name,
  label,
  isOverride = false,
  subFields = [],
}: {
  name: string
  label: string | { en: string; zh: string }
  isOverride?: boolean
  subFields?: any[]
}): Field[] => {
  const prefix = `kb_${name}_`
  const fields: Field[] = []

  // Helper to handle localized labels
  const getLocalizedLabel = (suffixEn: string, suffixZh: string) => {
    if (typeof label === 'string') {
      return `${label} - ${suffixZh}`
    }
    return {
      en: `${label.en} - ${suffixEn}`,
      zh: `${label.zh} - ${suffixZh}`,
    }
  }

  if (isOverride) {
    fields.push({
      name: `${prefix}mode`,
      type: 'radio',
      label: getLocalizedLabel('Display Mode', '显示模式'),
      defaultValue: 'inherit',
      options: [
        { label: { en: 'Inherit Global', zh: '继承全局' }, value: 'inherit' },
        { label: { en: 'Personalized Override', zh: '个性化覆盖' }, value: 'override' },
        { label: { en: 'Force Disable', zh: '强制关闭' }, value: 'disable' },
      ],
      admin: {
        layout: 'horizontal',
      },
    } as RadioField)
  }

  // Flatten subfields with prefix and condition
  const flattenedSubFields = subFields.map(field => {
    return {
      ...field,
      name: `${prefix}${field.name}`,
      admin: {
        ...field.admin,
        condition: isOverride ? (data: any) => data?.[`${prefix}mode`] === 'override' : undefined,
      }
    } as Field
  })

  fields.push(...flattenedSubFields)

  return fields
}

/**
 * Common sub-fields for different widgets based on KnowledgeBaseSettings.ts
 */
export const KB_WIDGET_SUBFIELDS: Record<string, any> = {
  toc: [
    {
      name: 'title',
      type: 'text',
      label: '目录标题',
      localized: true,
      defaultValue: 'Table of Contents',
    },
  ],
  share: [
    {
      name: 'title',
      type: 'text',
      label: '分享标题',
      localized: true,
    },
    {
      name: 'networks',
      type: 'array',
      label: '分享平台',
      labels: {
        singular: { en: 'Network', zh: '分享平台' },
        plural: { en: 'Networks', zh: '分享平台' },
      },
      admin: {
        initValues: {
          icon: 'fab fa-twitter',
        },
      },
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: '图标类名',
          required: true,
          admin: { 
            components: { Field: '@/components/fields/IconPicker' },
            description: '例如: fab fa-twitter'
          },
        },
        {
          name: 'url',
          type: 'text',
          label: '链接模板',
          required: true,
          admin: {
            description: '使用 {{URL}} 和 {{TITLE}} 作为占位符。例如：https://twitter.com/intent/tweet?url={{URL}}&text={{TITLE}}'
          }
        }
      ]
    },
  ],
  search_box: [
    {
      name: 'placeholder',
      type: 'text',
      label: '搜索提示文案',
      localized: true,
    }
  ],
  category_list: [
    {
      name: 'title',
      type: 'text',
      label: '列表标题',
      localized: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: '要展示的分类',
      filterOptions: { type: { equals: 'BLOG' } }
    }
  ],
  recommendations: (maxRows?: number): any[] => [
    {
      name: 'title',
      type: 'text',
      label: '模块标题',
      localized: true,
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      maxRows: maxRows,
      label: '手动选择推荐文章',
    },
    {
      name: 'logic',
      type: 'select',
      label: '自动推荐逻辑 (若未手动选择)',
      options: [
        { label: '同分类', value: 'category' },
        { label: '最新发布', value: 'latest' },
      ],
      defaultValue: 'category',
    }
  ],
  follow_us: [
    {
      name: 'title',
      type: 'text',
      label: '模块标题',
      localized: true,
    },
    {
      name: 'socials',
      type: 'array',
      label: '社交链接',
      labels: {
        singular: { en: 'Social Link', zh: '社交链接' },
        plural: { en: 'Social Links', zh: '社交链接' },
      },
      admin: {
        initValues: {
          icon: 'fab fa-linkedin',
        }
      },
      fields: [
        { 
          name: 'icon', 
          type: 'text', 
          label: '图标', 
          required: true,
          admin: { 
            components: { Field: '@/components/fields/IconPicker' },
            description: '例如: fab fa-linkedin'
          } 
        },
        { name: 'url', type: 'text', label: '链接', required: true },
      ]
    }
  ],
  bottom_categories: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: '底部展示分类',
      filterOptions: { type: { equals: 'BLOG' } }
    }
  ],
  pagination: (isOverride: boolean): any[] => {
    const fields: any[] = [
      {
        name: 'type',
        type: 'select',
        label: '跳转逻辑',
        defaultValue: 'auto',
        options: [
          { label: '自动推算 (Auto)', value: 'auto' },
          { label: '手动指定 (Manual)', value: 'manual' },
        ],
      }
    ]
    if (isOverride) {
      fields.push({
        name: 'prev_post',
        type: 'relationship',
        relationTo: 'blogs',
        label: '上一篇',
        admin: { condition: (_: any, siblingData: any) => siblingData?.type === 'manual' }
      })
      fields.push({
        name: 'next_post',
        type: 'relationship',
        relationTo: 'blogs',
        label: '下一篇',
        admin: { condition: (_: any, siblingData: any) => siblingData?.type === 'manual' }
      })
    }
    return fields
  },
  bottom_recommended: [
    {
      name: 'title',
      type: 'text',
      label: '模块标题',
      localized: true,
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      maxRows: 3,
      label: '手动选择推荐文章 (最多3篇)',
    },
    {
      name: 'logic',
      type: 'select',
      label: '自动推荐逻辑 (若未手动选择)',
      options: [
        { label: '同分类', value: 'category' },
        { label: '最新发布', value: 'latest' },
      ],
      defaultValue: 'category',
    }
  ]
}
