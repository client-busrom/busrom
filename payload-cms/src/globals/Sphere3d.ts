/**
 * Sphere3d Global - 3D Sphere Configuration
 *
 * 用途: 首页3D球体展示区块配置（预留）
 */

import type { GlobalConfig } from 'payload'

export const Sphere3d: GlobalConfig = {
  slug: 'sphere-3d',
  label: {
    en: '3D Sphere',
    zh: '3D球体',
  },
  admin: {
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // Status
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '发布状态',
      },
      defaultValue: 'draft',
      options: [
        { label: 'Draft | 草稿', value: 'draft' },
        { label: 'Published | 已发布', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Configuration
    {
      name: 'enabled',
      type: 'checkbox',
      label: {
        en: 'Enabled',
        zh: '启用',
      },
      defaultValue: false,
    },
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        zh: '标题',
      },
      localized: true,
    },
    {
      name: 'modelUrl',
      type: 'text',
      label: {
        en: '3D Model URL',
        zh: '3D模型URL',
      },
      admin: {
        description: '3D模型文件地址',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: {
        en: 'Background Color',
        zh: '背景色',
      },
      defaultValue: '#000000',
    },
  ],
}
