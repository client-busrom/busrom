/**
 * MediaTags Collection
 *
 * Tags for filtering and organizing media files
 * Migrated from Keystone MediaTag schema
 */

import type { CollectionConfig } from 'payload'

export const MediaTags: CollectionConfig = {
  slug: 'media-tags',
  labels: {
    singular: {
      en: 'Media Tag',
      zh: '媒体标签',
    },
    plural: {
      en: 'Media Tags',
      zh: '媒体标签',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'category'],
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
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tag Name | 标签名称',
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'General | 通用', value: 'general' },
        { label: 'Product Series | 产品系列', value: 'product_series' },
        { label: 'Product Model | 产品型号', value: 'product_model' },
        { label: 'Scene | 场景', value: 'scene' },
        { label: 'Color | 颜色', value: 'color' },
        { label: 'Material | 材质', value: 'material' },
        { label: 'Style | 风格', value: 'style' },
      ],
      label: 'Tag Type | 标签类型',
      admin: {
        description: 'Type of tag for grouping | 标签分组类型',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'media-categories',
      label: 'Category | 所属分类',
      admin: {
        description: 'Optional category this tag belongs to | 此标签所属的可选分类',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description | 描述',
    },
    {
      name: 'color',
      type: 'text',
      label: 'Color | 颜色',
      admin: {
        description: 'Color code for UI display | UI显示的颜色代码',
      },
    },
  ],
}
