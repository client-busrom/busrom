import { list } from '@keystone-6/core';
import { text, relationship, timestamp, select, json } from '@keystone-6/core/fields';

export const SeriesIntro = list({
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

  fields: {
    internalLabel: text({
      label: 'Internal Label',
      validation: { isRequired: true },
    }),

    // Relationship to ProductSeries
    productSeries: relationship({
      label: 'Product Series',
      ref: 'ProductSeries',
      ui: {
        displayMode: 'select',
        inlineConnect: true,
      },
    }),

    title: json({
      label: 'Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    description: json({
      label: 'Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    // Images via MediaTag (randomly selected based on tags)
    images: json({
      label: 'Images (基于标签随机选择)',
      defaultValue: { tags: [], images: [] },
      ui: {
        views: './custom-fields/TagBasedRandomImagesField',
        description: '选择标签后,从匹配的图片中随机选择5张。可以预览选中的图片。',
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
    listView: {
      initialColumns: ['internalLabel', 'productSeries', 'status', 'updatedAt'],
      defaultFieldMode: 'read',
    },
  },
});
