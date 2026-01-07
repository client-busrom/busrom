/**
 * CaseStudies Global - Case Studies Configuration
 *
 * 用途: 首页应用案例区块配置
 * - 选择和排序应用分类（type=APPLICATION）
 * - API自动为每个分类返回3个随机案例
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
    // 📊 Application Categories (Sortable)
    // ==================================================================
    // Note: Keystone uses SortableApplicationCategoriesField (JSON with sortable IDs, type=APPLICATION only)
    // For now, we use relationship array for simplicity
    // TODO: Implement custom sortable field with filtering if needed
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: {
        en: 'Application Categories',
        zh: '应用分类',
      },
      admin: {
        description: {
          en: 'Select and order application categories (type=APPLICATION). API will automatically return 3 random case study items per category.',
          zh: '选择并排序应用分类（type=APPLICATION）。API将自动为每个分类返回3个随机案例项目。',
        },
      },
    },
  ],
}
