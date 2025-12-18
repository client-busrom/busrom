/**
 * MainForm Global - Main Form Configuration
 *
 * 用途: 首页主表单配置
 * - 关联到FormConfig（动态表单配置）
 * - 或使用placeholder字段（向后兼容）
 * - 按钮文字、设计文字、图片
 * - 支持24语言
 */

import type { GlobalConfig } from 'payload'

export const MainForm: GlobalConfig = {
  slug: 'main-form',
  label: {
    en: 'Main Form',
    zh: '主表单配置',
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

    // ==================================================================
    // 🔗 Form Configuration Relationship
    // ==================================================================
    {
      name: 'formConfig',
      type: 'relationship',
      relationTo: 'form-configs',
      label: {
        en: 'Form Configuration',
        zh: '表单配置',
      },
      admin: {
        description: '选择要使用的表单配置。如果选择了，将使用 FormConfig 的字段配置；如果不选，则使用下方的占位符配置。',
      },
    },

    // ==================================================================
    // 📝 Design Text
    // ==================================================================
    {
      name: 'designTextLeft',
      type: 'text',
      label: {
        en: 'Design Text - Left',
        zh: '设计文字-左',
      },
      localized: true,
      admin: {
        description: '例如: "Premium Architectural Glass Hardware"',
      },
    },
    {
      name: 'designTextRight',
      type: 'text',
      label: {
        en: 'Design Text - Right',
        zh: '设计文字-右',
      },
      localized: true,
      admin: {
        description: '例如: "Customized Structure and Color"',
      },
    },

    // ==================================================================
    // 🖼️ Images
    // ==================================================================
    {
      name: 'image1',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 1',
        zh: '图片1',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image 2',
        zh: '图片2',
      },
      admin: {
        components: {
          Field: '@/components/fields/MediaPicker',
        },
      },
    },
  ],
}
