import type { CollectionConfig } from 'payload'

export const NotFoundPages: CollectionConfig = {
  slug: 'not-found-pages',
  labels: {
    singular: {
      en: '404 Page Config',
      zh: '404 页面配置',
    },
    plural: {
      en: '404 Page Configs',
      zh: '404 页面配置',
    },
  },
  admin: {
    useAsTitle: 'pageType',
    defaultColumns: ['pageType', 'text'],
    group: {
      en: 'System',
      zh: '系统设置',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
    {
      name: 'pageType',
      type: 'select',
      label: {
        en: 'Page Type',
        zh: '页面类型 (Page Type)',
      },
      required: true,
      unique: true,
      options: [
        { label: { en: 'Other Subpages', zh: '其他子页' }, value: 'other' },
        { label: { en: 'Product Details', zh: '产品详解页' }, value: 'product_details' },
        { label: { en: 'Product Links', zh: '产品链接页' }, value: 'product_links' },
        { label: { en: 'Knowledge Base', zh: '知识库页' }, value: 'knowledge_base' },
      ],
      admin: {
        description: {
          en: 'Which 404 scenario this configuration applies to.',
          zh: '此 404 配置适用的场景。',
        },
      },
    },
    {
      name: 'text',
      type: 'textarea',
      label: {
        en: '404 Text',
        zh: '404 文本',
      },
      localized: true,
      required: true,
      defaultValue: 'Oops! Page not found.',
    },
    {
      name: 'buttonText',
      type: 'text',
      label: {
        en: 'Button Text',
        zh: '按钮文本',
      },
      localized: true,
      required: true,
      defaultValue: 'Back to Home',
    },
    {
      name: 'buttonLink',
      type: 'text',
      label: {
        en: 'Button Link',
        zh: '按钮跳转链接',
      },
      required: true,
      defaultValue: '/',
      admin: {
        components: {
          Field: '@/components/fields/SmartLinkField#SmartLinkField',
        },
      },
    },
    {
      name: 'mediaSelection',
      type: 'radio',
      label: {
        en: 'Media Selection',
        zh: '配图选择模式',
      },
      required: true,
      defaultValue: 'manual',
      options: [
        { label: { en: 'Manual Select', zh: '手动选择' }, value: 'manual' },
        { label: { en: 'Random from Case Gallery', zh: '案例图集随机' }, value: 'random' },
      ],
    },
    {
      name: 'manualMedia',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      label: {
        en: 'Manual Media',
        zh: '手动选择配图/视频',
      },
      admin: {
        condition: (data) => data?.mediaSelection === 'manual',
      },
    },
    {
      name: 'applications',
      type: 'relationship',
      relationTo: 'applications',
      hasMany: true,
      label: {
        en: 'Associated Applications (Case Gallery)',
        zh: '关联案例图集 (Applications)',
      },
      admin: {
        condition: (data) => data?.mediaSelection === 'random',
        description: {
          en: 'Randomly select media from these Applications.',
          zh: '将从这些关联的案例图集中随机提取配图。',
        },
      },
    },
  ],
}
