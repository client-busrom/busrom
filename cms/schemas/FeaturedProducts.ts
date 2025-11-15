import { list } from '@keystone-6/core';
import { text, timestamp, select, json } from '@keystone-6/core/fields';

export const FeaturedProducts = list({
  /**
   * Access Control
   * - query: 公开访问 (前端需要读取)
   * - create: 允许(用于初始化 singleton)
   * - update: 需要登录
   * - delete: 禁止删除 (singleton)
   */
  access: {
    operation: {
      query: () => true,
      create: () => true, // 用于初始化
      update: ({ session }: any) => !!session,
      delete: () => false, // 禁止删除 singleton
    },
    filter: {
      query: ({ session }: any) => {
        // 已登录用户可以看到所有状态
        if (session) return true
        // 前端访客只能看到已发布的内容
        return { status: { equals: 'PUBLISHED' } }
      },
    },
  },
  isSingleton: true,
  graphql: { plural: 'FeaturedProductsConfigs' },

  fields: {
    internalLabel: text({
      label: 'Internal Label',
      defaultValue: 'Featured Products Configuration',
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

    viewAllButtonText: json({
      label: 'View All Button Text',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    // Categories to display (sortable ProductSeries IDs)
    categories: json({
      label: 'Product Series Categories',
      defaultValue: [],
      ui: {
        views: './custom-fields/SortableProductSeriesField',
        description: 'Select and sort product series with drag-and-drop. API will return 3 random products per series, each with 3 specs.',
      },
    }),

    // Status tracking
    status: select({
      label: 'Status',
      type: 'enum',
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Published', value: 'PUBLISHED' },
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
    description: 'Configure featured products section. API automatically selects 3 random products per series with 3 specs each.',
  },
});
