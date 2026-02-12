/**
 * Image Gallery Block
 *
 * Displays multiple images in a gallery grid
 * Migrated from Keystone component-blocks/components/image-gallery.tsx
 */

import type { Block } from 'payload'

export const ImageGallery: Block = {
  slug: 'imageGallery',
  interfaceName: 'ImageGalleryBlock',
  labels: {
    singular: {
      en: '🖼️ Image Gallery',
      zh: '🖼️ 图片画廊',
    },
    plural: {
      en: 'Image Galleries',
      zh: '图片画廊',
    },
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: {
        en: 'Images',
        zh: '图片',
      },
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
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
    },
    {
      name: 'columns',
      type: 'select',
      label: {
        en: 'Columns',
        zh: '列数',
      },
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
  ],
}
