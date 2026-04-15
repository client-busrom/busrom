/**
 * Fluid Layout Block - Special layout for text wrapping and content wrapping images
 * 
 * 方案三实现：专用流式/环绕布局区块
 */

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { getNestedFeatures } from '../lexical-features/shared/features'

export const FluidLayout: Block = {
  slug: 'fluidLayout',
  interfaceName: 'FluidLayoutBlock',
  labels: {
    singular: {
      en: 'Fluid Layout',
      zh: '流式/环绕布局',
    },
    plural: {
      en: 'Fluid Layouts',
      zh: '流式/环绕布局',
    },
  },
  fields: [
    {
      name: 'layoutType',
      type: 'select',
      label: {
        en: 'Layout Style',
        zh: '布局模式',
      },
      defaultValue: 'sideBySide',
      admin: {
        description: {
          en: 'Side by Side is better for lists/grid feel. Float is better for stories where text wraps below the image.',
          zh: '“左右分栏”适合列表或对比感；“文字环绕”适合长篇叙述，文字会延伸到图片下方。',
        },
      },
      options: [
        { label: { en: 'Side by Side (Equal Height)', zh: '左右分栏 (两侧对齐)' }, value: 'sideBySide' },
        { label: { en: 'Text Wrap (Float)', zh: '文字环绕 (流式排版)' }, value: 'float' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Image',
        zh: '配图',
      },
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: {
        en: 'Image Position',
        zh: '图片位置',
      },
      defaultValue: 'right',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'imageWidth',
      type: 'select',
      label: {
        en: 'Image Width (%)',
        zh: '图片占比 (%)',
      },
      defaultValue: '50',
      options: [
        { label: '25%', value: '25' },
        { label: '33%', value: '33' },
        { label: '40%', value: '40' },
        { label: '50%', value: '50' },
        { label: '60%', value: '60' },
        { label: '75%', value: '75' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: {
        en: 'Content',
        zh: '文字内容',
      },
      required: true,
      editor: lexicalEditor({
        features: getNestedFeatures,
      }),
    },
  ],
}
