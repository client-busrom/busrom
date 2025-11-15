import { list } from '@keystone-6/core';
import { text, timestamp, select, json } from '@keystone-6/core/fields';

export const BrandValue = list({
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
  graphql: { plural: 'BrandValueConfigs' },

  fields: {
    internalLabel: text({
      label: 'Internal Label',
      defaultValue: 'Brand Value Configuration',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    title: json({
      label: 'Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    subtitle: json({
      label: 'Subtitle',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    // Param1
    param1Title: json({
      label: 'Param1 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    param1Description: json({
      label: 'Param1 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    param1Image: json({
      label: 'Param1 - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Param2
    param2Title: json({
      label: 'Param2 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    param2Description: json({
      label: 'Param2 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    param2Image: json({
      label: 'Param2 - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Slogan
    sloganTitle: json({
      label: 'Slogan - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    sloganDescription: json({
      label: 'Slogan - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    sloganImage: json({
      label: 'Slogan - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Value
    valueTitle: json({
      label: 'Value - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    valueDescription: json({
      label: 'Value - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    valueImage: json({
      label: 'Value - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Vision
    visionTitle: json({
      label: 'Vision - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    visionDescription: json({
      label: 'Vision - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    visionImage: json({
      label: 'Vision - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
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
  },
});
