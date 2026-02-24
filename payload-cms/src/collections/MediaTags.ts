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

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Tag Name',
        zh: '标签名称',
      },
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: { en: 'General', zh: '通用' }, value: 'general' },
        { label: { en: 'Product Series', zh: '产品系列' }, value: 'product_series' },
        { label: { en: 'Product Model', zh: '产品型号' }, value: 'product_model' },
        { label: { en: 'Scene', zh: '场景' }, value: 'scene' },
        { label: { en: 'Color', zh: '颜色' }, value: 'color' },
        { label: { en: 'Material', zh: '材质' }, value: 'material' },
        { label: { en: 'Style', zh: '风格' }, value: 'style' },
      ],
      label: {
        en: 'Tag Type',
        zh: '标签类型',
      },
      admin: {
        description: {
          en: 'Type of tag for grouping',
          zh: '标签分组类型',
        },
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'media-categories',
      label: {
        en: 'Category',
        zh: '所属分类',
      },
      admin: {
        description: {
          en: 'Optional category this tag belongs to',
          zh: '此标签所属的可选分类',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Description',
        zh: '描述',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: {
        en: 'Color',
        zh: '颜色',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Color code for UI display',
          zh: 'UI显示的颜色代码',
        },
      },
    },
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
  ],
}
