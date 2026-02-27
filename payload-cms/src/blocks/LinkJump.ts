/**
 * Link Jump Block
 *
 * Displays a link with icon for quick navigation
 */

import type { Block } from 'payload'

export const LinkJump: Block = {
  slug: 'linkJump',
  interfaceName: 'LinkJumpBlock',
  labels: {
    singular: {
      en: '🔗 Link Jump',
      zh: '🔗 快速链接',
    },
    plural: {
      en: 'Link Jumps',
      zh: '快速链接',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      required: true,
      label: {
        en: 'Title',
        zh: '标题',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: {
        en: 'URL',
        zh: '链接地址',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Icon (Optional)',
        zh: '图标（可选）',
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      label: {
        en: 'Open in New Tab',
        zh: '在新标签页打开',
      },
      defaultValue: false,
    },
  ],
}
