/**
 * CaseStudies Global - Case Studies Configuration
 *
 * 用途: 首页应用案例区块配置
 * - 直接选择要展示的应用案例（applications）
 * - 每个应用案例展示3张图片：
 *   - 如果场景图集分组>=3，随机选3组，每组随机选1张
 *   - 如果场景图集分组<3，打散所有图片随机选3张
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const CaseStudies: GlobalConfig = {
  slug: 'case-studies',
  label: {
    en: 'Case Studies',
    zh: '应用案例',
  },
  admin: {
    group: {
      en: 'Homepage',
      zh: '首页管理',
    },
  },
  // versions: true,
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

    // ==================================================================
    // 🌐 Localized Content
    // ==================================================================
    {
      name: 'title',
      type: 'textarea',
      label: {
        en: 'Title',
        zh: '标题',
      },
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
    },

    // ==================================================================
    // 📊 Applications Selection
    // ==================================================================
    {
      name: 'applications',
      type: 'relationship',
      relationTo: 'applications',
      hasMany: true,
      label: {
        en: 'Applications',
        zh: '应用案例',
      },
      admin: {
        description: {
          en: 'Select applications to display. Each application will show 3 images from its scene gallery.',
          zh: '选择要展示的应用案例。每个案例将从场景图集中展示3张图片。',
        },
      },
      filterOptions: {
        status: { equals: 'published' },
      },
    },
  ],
}
