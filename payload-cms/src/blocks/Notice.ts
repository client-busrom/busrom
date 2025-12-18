/**
 * Notice Block
 *
 * Displays notice/alert boxes with different types
 */

import type { Block } from 'payload'

export const Notice: Block = {
  slug: 'notice',
  interfaceName: 'NoticeBlock',
  labels: {
    singular: {
      en: '📢 Notice',
      zh: '📢 提示框',
    },
    plural: {
      en: 'Notices',
      zh: '提示框',
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: {
        en: 'Notice Type',
        zh: '提示类型',
      },
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        zh: '标题',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: {
        en: 'Content',
        zh: '内容',
      },
    },
  ],
}
