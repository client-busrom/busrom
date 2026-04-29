import type { Field, GroupField, RadioField } from 'payload'

interface CreateWidgetOptions {
  name: string
  label: string
  isOverride?: boolean
  subFields?: any[]
}

/**
 * Creates a three-state control field group for Knowledge Base widgets.
 */
export const createKBWidgetField = ({
  name,
  label,
  isOverride = false,
  subFields = [],
}: CreateWidgetOptions): Field => {
  const baseFields: Field[] = []

  if (isOverride) {
    baseFields.push({
      name: 'mode',
      type: 'radio',
      label: '显示模式',
      defaultValue: 'inherit',
      options: [
        { label: '继承全局 (Inherit)', value: 'inherit' },
        { label: '个性化覆盖 (Override)', value: 'override' },
        { label: '强制关闭 (Disable)', value: 'disable' },
      ],
      admin: {
        layout: 'horizontal',
      },
    } as RadioField)
  }

  baseFields.push({
    name: 'config',
    type: 'group',
    label: '具体配置',
    admin: {
      condition: isOverride ? (_: any, siblingData: any) => siblingData?.mode === 'override' : undefined,
      hideGutter: true,
    },
    fields: subFields as Field[],
  } as GroupField)

  return {
    name,
    label,
    type: 'group',
    fields: baseFields,
    admin: {
      hideGutter: isOverride,
    }
  } as GroupField
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
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: '图标类名',
          admin: { 
            components: { Field: '@/components/fields/IconPicker' },
            description: '例如: fab fa-twitter'
          },
        },
        {
          name: 'url',
          type: 'text',
          label: '链接模板',
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
      label: '标题',
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
      label: '标题',
      localized: true,
    },
    {
      name: 'socials',
      type: 'array',
      label: '社交链接',
      fields: [
        { 
          name: 'icon', 
          type: 'text', 
          label: '图标', 
          admin: { 
            components: { Field: '@/components/fields/IconPicker' },
            description: '例如: fab fa-linkedin'
          } 
        },
        { name: 'url', type: 'text', label: '链接' },
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
  }
}
