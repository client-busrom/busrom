/**
 * Hero Block
 *
 * Large hero section with image and text
 */

import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: {
      en: '🎯 Hero',
      zh: '🎯 英雄横幅',
    },
    plural: {
      en: 'Heroes',
      zh: '英雄横幅',
    },
  },
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
      name: 'subtitle',
      type: 'textarea',
      label: {
        en: 'Subtitle',
        zh: '副标题',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Background Image',
        zh: '背景图片',
      },
    },
    {
      name: 'ctaText',
      type: 'text',
      label: {
        en: 'CTA Button Text',
        zh: '按钮文字',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      label: {
        en: 'CTA Button URL',
        zh: '按钮链接',
      },
    },
    {
      name: 'height',
      type: 'select',
      label: {
        en: 'Height',
        zh: '高度',
      },
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full Screen', value: 'fullscreen' },
      ],
    },
  ],
}
