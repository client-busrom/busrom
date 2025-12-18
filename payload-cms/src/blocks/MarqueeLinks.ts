/**
 * Marquee Links Block
 *
 * Scrolling/Marquee links with icons
 */

import type { Block } from 'payload'

export const MarqueeLinks: Block = {
  slug: 'marqueeLinks',
  interfaceName: 'MarqueeLinksBlock',
  labels: {
    singular: {
      en: '🎪 Marquee Links',
      zh: '🎪 滚动链接',
    },
    plural: {
      en: 'Marquee Links',
      zh: '滚动链接',
    },
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: {
        en: 'Links',
        zh: '链接',
      },
      minRows: 1,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: {
            en: 'Title',
            zh: '标题',
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
      ],
    },
    {
      name: 'speed',
      type: 'select',
      label: {
        en: 'Scroll Speed',
        zh: '滚动速度',
      },
      defaultValue: 'medium',
      options: [
        { label: 'Slow', value: 'slow' },
        { label: 'Medium', value: 'medium' },
        { label: 'Fast', value: 'fast' },
      ],
    },
  ],
}
