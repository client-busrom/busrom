/**
 * CTA Button Block
 *
 * Call-to-action button with link
 */

import type { Block } from 'payload'

export const CtaButton: Block = {
  slug: 'ctaButton',
  interfaceName: 'CtaButtonBlock',
  labels: {
    singular: {
      en: '🔘 CTA Button',
      zh: '🔘 行动按钮',
    },
    plural: {
      en: 'CTA Buttons',
      zh: '行动按钮',
    },
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
      label: {
        en: 'Button Text',
        zh: '按钮文字',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: {
        en: 'Link URL',
        zh: '链接地址',
      },
    },
    {
      name: 'style',
      type: 'select',
      label: {
        en: 'Button Style',
        zh: '按钮样式',
      },
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
      ],
    },
    {
      name: 'size',
      type: 'select',
      label: {
        en: 'Button Size',
        zh: '按钮大小',
      },
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
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
