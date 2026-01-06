/**
 * MediaCategories Collection
 *
 * Categories for organizing media files
 * Migrated from Keystone MediaCategory schema
 */

import type { CollectionConfig } from 'payload'

export const MediaCategories: CollectionConfig = {
  slug: 'media-categories',
  labels: {
    singular: {
      en: 'Media Category',
      zh: '媒体分类',
    },
    plural: {
      en: 'Media Categories',
      zh: '媒体分类',
    },
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'name', 'mediaCount'],
    group: {
      en: 'Media Library',
      zh: '媒体库',
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },
  versions: {
    maxPerDoc: 10,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Name (Slug) | 名称 (标识)',
      admin: {
        description: 'Internal identifier (e.g., "product-images") | 内部标识符（如 "product-images"）',
      },
      index: true,
    },
    {
      name: 'displayName',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Display Name | 显示名称',
      admin: {
        description: 'User-friendly name shown in UI | 在界面中显示的友好名称',
        components: {
          Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description | 描述',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon | 图标',
      admin: {
        description: 'Icon name or emoji | 图标名称或 emoji',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Color | 颜色',
      admin: {
        description: 'Color code for UI display (e.g., #3498db) | UI显示的颜色代码',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Order | 排序',
      admin: {
        description: 'Display order in lists | 列表中的显示顺序',
      },
    },
  ],
}
