/**
 * Single Image Block
 *
 * Displays a single image with caption, alignment, and size options
 * Migrated from Keystone component-blocks/components/single-image.tsx
 */

import type { Block } from 'payload'

export const SingleImage: Block = {
  slug: 'singleImage',
  interfaceName: 'SingleImageBlock',
  labels: {
    singular: {
      en: '📷 Single Image',
      zh: '📷 单张图片',
    },
    plural: {
      en: 'Single Images',
      zh: '单张图片',
    },
  },
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
        zh: '图片说明',
      },
      admin: {
        placeholder: 'Enter image caption (optional)',
      },
    },
    {
      name: 'alignment',
      type: 'select',
      label: {
        en: 'Alignment',
        zh: '对齐方式',
      },
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'size',
      type: 'select',
      label: {
        en: 'Size',
        zh: '尺寸',
      },
      defaultValue: 'large',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full Width', value: 'full' },
      ],
    },
    {
      name: 'enableLink',
      type: 'checkbox',
      label: {
        en: 'Enable Link',
        zh: '启用链接',
      },
      defaultValue: false,
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: {
        en: 'Link URL',
        zh: '链接地址',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.enableLink,
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      label: {
        en: 'Open in New Tab',
        zh: '新标签页打开',
      },
      defaultValue: false,
      admin: {
        condition: (_, siblingData) => siblingData?.enableLink,
      },
    },
  ],
}
