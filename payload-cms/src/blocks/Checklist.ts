/**
 * Checklist Block
 *
 * Displays a list of items with checkmarks
 */

import type { Block } from 'payload'

export const Checklist: Block = {
  slug: 'checklist',
  interfaceName: 'ChecklistBlock',
  labels: {
    singular: {
      en: '✓ Checklist',
      zh: '✓ 检查列表',
    },
    plural: {
      en: 'Checklists',
      zh: '检查列表',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title (Optional)',
        zh: '标题（可选）',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: {
        en: 'Items',
        zh: '项目',
      },
      minRows: 1,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          label: {
            en: 'Text',
            zh: '文本',
          },
        },
        {
          name: 'checked',
          type: 'checkbox',
          label: {
            en: 'Checked',
            zh: '已选中',
          },
          defaultValue: true,
        },
      ],
    },
    {
      name: 'style',
      type: 'select',
      label: {
        en: 'Style',
        zh: '样式',
      },
      defaultValue: 'checkmark',
      options: [
        { label: 'Checkmark', value: 'checkmark' },
        { label: 'Bullet', value: 'bullet' },
        { label: 'Number', value: 'number' },
      ],
    },
  ],
}
