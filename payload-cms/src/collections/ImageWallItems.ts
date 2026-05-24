/**
 * ImageWallItems Collection - Preloader Image Wall Items
 *
 * Each item represents one image in the preloader image wall.
 * Supports manual image selection or random selection from an Application's scene gallery.
 */

import type { CollectionConfig } from 'payload'

export const ImageWallItems: CollectionConfig = {
  slug: 'image-wall-items',
  labels: {
    singular: {
      en: 'Image Wall Item',
      zh: '图片墙项',
    },
    plural: {
      en: 'Image Wall Items',
      zh: '图片墙项',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'updatedAt'],
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    afterRead: [
      async ({ doc, req: { payload } }) => {
        if (!doc.image) return doc
        const { getApplicationImage } = await import('@/utilities/getApplicationImage')
        const resolved = await getApplicationImage(payload, doc.image)
        return {
          ...doc,
          imageResolved: resolved,
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Name',
        zh: '名称',
      },
      required: true,
      admin: {
        description: {
          en: 'e.g., Layer 1 (Top Left), Layer 7 (Center Main)',
          zh: '例如：图层 1（左上角）、图层 7（中心主图）',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      label: {
        en: 'Order',
        zh: '排序',
      },
      defaultValue: 1,
      min: 1,
      max: 100,
      admin: {
        description: {
          en: 'Display order in the image wall (1-7)',
          zh: '图片墙中的显示顺序（1-7）',
        },
      },
    },
    {
      name: 'image',
      type: 'json',
      label: {
        en: 'Image',
        zh: '图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/ApplicationImagePicker',
        },
        description: {
          en: 'Choose manually from media or randomly from a case gallery (Application).',
          zh: '可手动从媒体库选择，或从案例图集中随机选择。',
        },
      },
    },
  ],
}
