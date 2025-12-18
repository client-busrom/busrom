/**
 * Carousel Block
 *
 * Image carousel/slider
 */

import type { Block } from 'payload'

export const Carousel: Block = {
  slug: 'carousel',
  interfaceName: 'CarouselBlock',
  labels: {
    singular: {
      en: '🎠 Carousel',
      zh: '🎠 轮播图',
    },
    plural: {
      en: 'Carousels',
      zh: '轮播图',
    },
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: {
        en: 'Slides',
        zh: '幻灯片',
      },
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: {
            en: 'Image',
            zh: '图片',
          },
        },
        {
          name: 'caption',
          type: 'text',
          label: {
            en: 'Caption',
            zh: '说明',
          },
        },
        {
          name: 'link',
          type: 'text',
          label: {
            en: 'Link (Optional)',
            zh: '链接（可选）',
          },
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: {
        en: 'Auto Play',
        zh: '自动播放',
      },
      defaultValue: true,
    },
    {
      name: 'interval',
      type: 'number',
      label: {
        en: 'Interval (seconds)',
        zh: '间隔（秒）',
      },
      defaultValue: 5,
      min: 1,
      max: 30,
    },
  ],
}
