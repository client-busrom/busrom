/**
 * Sphere3d Global - 3D Globe Configuration
 *
 * 用途: 首页3D地球展示区块配置
 */

import type { GlobalConfig } from 'payload'

export const Sphere3d: GlobalConfig = {
  slug: 'sphere-3d',
  label: {
    en: '3D Globe',
    zh: '3D地球',
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
    // Translation Center
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/GlobalTranslationCenter',
        },
      },
    },
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
    // Title
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        zh: '标题',
      },
      localized: true,
      admin: {
        description: {
          en: 'e.g. GLOBAL NETWORK',
          zh: '例如：全球网络',
        },
      },
    },
    // Description - 暂时不使用本地化，避免数据库迁移问题
    {
      name: 'description',
      type: 'text',
      label: {
        en: 'Description',
        zh: '描述',
      },
      // localized: true, // 暂时禁用，等数据库迁移完成后再启用
      admin: {
        description: {
          en: 'e.g. Serving customers worldwide from Guangdong, China',
          zh: '例如：从中国广东服务全球客户',
        },
      },
    },
  ],
}
