/**
 * Sidebar Layout Block
 *
 * 侧边栏布局 (主内容 + 侧边栏)
 */

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { getNestedFeatures } from '../lexical-features/shared/features'

export const Sidebar: Block = {
  slug: 'sidebar',
  interfaceName: 'SidebarBlock',
  labels: {
    singular: {
      en: 'Sidebar Layout',
      zh: '侧边栏布局',
    },
    plural: {
      en: 'Sidebar Layouts',
      zh: '侧边栏布局',
    },
  },
  fields: [
    {
      name: 'sidebarPosition',
      type: 'select',
      label: {
        en: 'Sidebar Position',
        zh: '侧边栏位置',
      },
      defaultValue: 'right',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'mainContent',
      type: 'richText',
      label: {
        en: 'Main Content',
        zh: '主要内容',
      },
      required: true,
      editor: lexicalEditor({ features: getNestedFeatures }),
    },
    {
      name: 'sidebarContent',
      type: 'richText',
      label: {
        en: 'Sidebar Content',
        zh: '侧边栏内容',
      },
      required: true,
      editor: lexicalEditor({ features: getNestedFeatures }),
    },
    {
      name: 'sidebarWidth',
      type: 'select',
      label: {
        en: 'Sidebar Width',
        zh: '侧边栏宽度',
      },
      defaultValue: 'medium',
      options: [
        { label: 'Small (25%)', value: 'small' },
        { label: 'Medium (33%)', value: 'medium' },
        { label: 'Large (40%)', value: 'large' },
      ],
    },
    {
      name: 'gap',
      type: 'select',
      label: {
        en: 'Gap',
        zh: '间距',
      },
      defaultValue: 'normal',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Normal', value: 'normal' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'sidebarStyle',
      type: 'select',
      label: {
        en: 'Sidebar Style',
        zh: '侧边栏样式',
      },
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Bordered', value: 'bordered' },
        { label: 'Background', value: 'background' },
        { label: 'Card', value: 'card' },
      ],
    },
  ],
}
