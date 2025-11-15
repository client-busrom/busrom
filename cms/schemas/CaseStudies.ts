import { list } from '@keystone-6/core';
import { text, timestamp, select, json } from '@keystone-6/core/fields';

export const CaseStudies = list({
  /**
   * Access Control
   * - query: 公开访问 (前端需要读取)
   * - create: 允许(用于 seeding)
   * - update: 需要登录
   * - delete: 禁止删除 (singleton/重要配置)
   */
  access: {
    operation: {
      query: () => true,
      create: () => true, // 允许 seeding
      update: ({ session }: any) => !!session,
      delete: () => false, // 禁止删除
    },
    filter: {
      query: ({ session }: any) => {
        // 已登录用户可以看到所有状态
        if (session) return true
        // 前端访客只能看到已发布的内容(如果有 status 字段)
        // 注意:有些schema可能没有status字段,需要检查
        return { status: { equals: 'PUBLISHED' } }
      },
    },
  },
  isSingleton: true,
  graphql: { plural: 'CaseStudiesConfigs' },

  fields: {
    internalLabel: text({
      label: 'Internal Label',
      defaultValue: 'Case Studies Configuration',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    title: json({
      label: 'Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    description: json({
      label: 'Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    // Categories to display (sortable Category IDs, type=APPLICATION only)
    categories: json({
      label: 'Application Categories',
      defaultValue: [],
      ui: {
        views: './custom-fields/SortableApplicationCategoriesField',
        description: 'Select and sort application categories with drag-and-drop. Only APPLICATION type categories are shown. API will return 3 random case study items per category.',
      },
    }),

    // Status tracking
    status: select({
      label: 'Status',
      type: 'enum',
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      ui: { displayMode: 'segmented-control' },
    }),

    publishedAt: timestamp({ label: 'Published At' }),
    updatedAt: timestamp({ label: 'Updated At', db: { updatedAt: true } }),
  },

  ui: {
    labelField: 'internalLabel',
    listView: { defaultFieldMode: 'read' },
    description: 'Configure case studies section. Select application categories (type=APPLICATION) and API will return 3 random case study items per category.',
  },
});
