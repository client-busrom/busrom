/**
 * Product Series Carousel Schema (Singleton)
 *
 * Manages the product series carousel/slider configuration on homepage
 * Each carousel item contains: title, image, scene image, button text, and link
 */

import { list } from '@keystone-6/core'
import { text, integer, select, checkbox, timestamp, json } from '@keystone-6/core/fields'

export const ProductSeriesCarousel = list({
  access: {
    operation: {
      query: () => true, // Public access for frontend
      create: () => true,
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
  },

  isSingleton: true,
  graphql: { plural: 'ProductSeriesCarousels' },

  fields: {
    /**
     * Internal Label
     */
    internalLabel: text({
      label: 'Internal Label (内部标签)',
      defaultValue: 'Product Series Carousel Configuration',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'Admin-only label for identifying this configuration',
      },
    }),

    /**
     * Carousel Items (Multilingual)
     * Multilingual carousel items with drag & drop support
     */
    items: json({
      label: 'Carousel Items (轮播项) - Multilingual',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualCarouselItemsField',
        description: 'Multilingual carousel items. Each language has its own items with drag-to-reorder, visibility toggle, title, images, button text, and link. Supports auto-translation.',
      },
    }),

    /**
     * Auto-play Settings
     */
    autoPlay: checkbox({
      label: 'Auto Play (自动播放)',
      defaultValue: true,
      ui: {
        description: 'Automatically rotate carousel items',
      },
    }),

    autoPlaySpeed: integer({
      label: 'Auto Play Speed (ms) (自动播放速度)',
      defaultValue: 5000,
      validation: { min: 1000, max: 10000 },
      ui: {
        description: 'Time in milliseconds between slide transitions (1000-10000)',
      },
    }),

    /**
     * Status
     */
    status: select({
      label: 'Status (状态)',
      type: 'enum',
      options: [
        { label: 'Active (启用)', value: 'ACTIVE' },
        { label: 'Inactive (禁用)', value: 'INACTIVE' },
      ],
      defaultValue: 'ACTIVE',
      ui: {
        displayMode: 'segmented-control',
        description: 'Enable or disable this carousel section',
      },
    }),

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
    }),
  },

  ui: {
    labelField: 'internalLabel',
    listView: { defaultFieldMode: 'read' },
    description: 'Product Series Carousel - Homepage carousel configuration (singleton). Multilingual support: each language has its own carousel items with title, image, scene image, button text, and link URL. Supports auto-translation and drag-to-reorder.',
  },
})
