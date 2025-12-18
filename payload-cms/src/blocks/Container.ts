/**
 * Container Block
 *
 * 容器布局，可以设置最大宽度、内边距、背景等
 */

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { getNestedFeatures } from '../lexical-features/shared/features'

export const Container: Block = {
  slug: 'container',
  interfaceName: 'ContainerBlock',
  labels: {
    singular: {
      en: 'Container',
      zh: '容器',
    },
    plural: {
      en: 'Containers',
      zh: '容器',
    },
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: {
        en: 'Content',
        zh: '内容',
      },
      required: true,
      editor: lexicalEditor({ features: getNestedFeatures }),
    },
    {
      name: 'maxWidth',
      type: 'select',
      label: {
        en: 'Max Width',
        zh: '最大宽度',
      },
      defaultValue: 'medium',
      options: [
        { label: 'Small (640px)', value: 'small' },
        { label: 'Medium (768px)', value: 'medium' },
        { label: 'Large (1024px)', value: 'large' },
        { label: 'XLarge (1280px)', value: 'xlarge' },
        { label: 'Full Width', value: 'full' },
      ],
    },
    {
      name: 'padding',
      type: 'select',
      label: {
        en: 'Padding',
        zh: '内边距',
      },
      defaultValue: 'normal',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Normal', value: 'normal' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: {
        en: 'Background Color',
        zh: '背景颜色',
      },
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Light Gray', value: 'light-gray' },
        { label: 'White', value: 'white' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
      ],
    },
    {
      name: 'border',
      type: 'checkbox',
      label: {
        en: 'Add Border',
        zh: '添加边框',
      },
      defaultValue: false,
    },
    {
      name: 'shadow',
      type: 'checkbox',
      label: {
        en: 'Add Shadow',
        zh: '添加阴影',
      },
      defaultValue: false,
    },
  ],
}
