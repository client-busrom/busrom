/**
 * Image Gallery Block
 *
 * Displays multiple images in a gallery grid
 * Supports two source types per item:
 *   1. Direct media upload (default)
 *   2. Application reference (randomly picks one image from the application's scene gallery at API time)
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
          name: 'sourceType',
          type: 'select',
          label: {
            en: 'Source Type',
            zh: '来源类型',
          },
          defaultValue: 'media',
          options: [
            { label: { en: 'Media (Direct Upload)', zh: '媒体（直接上传）' }, value: 'media' },
            { label: { en: 'Application (Random Image)', zh: '案例图集（随机图片）' }, value: 'application' },
          ],
          admin: {
            description: {
              en: 'Choose image source: direct media or random from an Application scene gallery',
              zh: '选择图片来源：直接选择媒体，或从案例图集中随机取一张',
            },
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, siblingData) => !siblingData?.sourceType || siblingData?.sourceType === 'media',
          },
        },
        {
          name: 'application',
          type: 'relationship',
          relationTo: 'applications',
          label: {
            en: 'Application',
            zh: '案例图集',
          },
          admin: {
            condition: (_, siblingData) => siblingData?.sourceType === 'application',
            description: {
              en: 'Select an Application. One random image from its scene gallery will be used.',
              zh: '选择一个案例图集。系统将从其场景图集中随机取一张图片使用。',
            },
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
