import { list } from '@keystone-6/core';
import { text, timestamp, select, json } from '@keystone-6/core/fields';

export const WhyChooseBusrom = list({
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
  graphql: { plural: 'WhyChooseBusromConfigs' },

  fields: {
    internalLabel: text({
      label: 'Internal Label',
      defaultValue: 'Why Choose Busrom Configuration',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    title: json({
      label: 'Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    title2: json({
      label: 'Title 2',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    // View More Button
    viewMoreButtonText: json({
      label: 'View More Button Text (查看更多按钮文字)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: '例如: "VIEW MORE INFORMATION"',
      },
    }),

    viewMoreButtonUrl: text({
      label: 'View More Button URL (查看更多按钮链接)',
      ui: {
        description: '例如: "/about-us" 或 "https://example.com/about"',
      },
    }),

    // Reason 1
    reason1Title: json({
      label: 'Reason 1 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason1Description: json({
      label: 'Reason 1 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason1Image: json({
      label: 'Reason 1 - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Reason 2
    reason2Title: json({
      label: 'Reason 2 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason2Description: json({
      label: 'Reason 2 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason2Image: json({
      label: 'Reason 2 - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Reason 3
    reason3Title: json({
      label: 'Reason 3 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason3Description: json({
      label: 'Reason 3 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason3Image: json({
      label: 'Reason 3 - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Reason 4
    reason4Title: json({
      label: 'Reason 4 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason4Description: json({
      label: 'Reason 4 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason4Image: json({
      label: 'Reason 4 - Image',
      ui: {
        views: './custom-fields/SingleMediaField',
        description: '选择图片后将显示预览',
      },
    }),

    // Reason 5
    reason5Title: json({
      label: 'Reason 5 - Title',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason5Description: json({
      label: 'Reason 5 - Description',
      ui: { views: './custom-fields/MultilingualJSONField' },
    }),

    reason5Image: json({
      label: 'Reason 5 - Image',
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
  },
});
