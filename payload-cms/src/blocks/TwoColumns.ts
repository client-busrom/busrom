/**
 * Two Columns Layout Block
 *
 * 两栏布局，类似 Keystone document layout
 */

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { getNestedFeatures } from '../lexical-features/shared/features'

export const TwoColumns: Block = {
  slug: 'twoColumns',
  interfaceName: 'TwoColumnsBlock',
  labels: {
    singular: {
      en: 'Two Columns',
      zh: '两栏布局',
    },
    plural: {
      en: 'Two Columns',
      zh: '两栏布局',
    },
  },
  fields: [
    {
      name: 'leftColumn',
      type: 'richText',
      label: {
        en: 'Left Column',
        zh: '左栏内容',
      },
      required: true,
      editor: lexicalEditor({
        features: getNestedFeatures,
      }),
    },
    {
      name: 'rightColumn',
      type: 'richText',
      label: {
        en: 'Right Column',
        zh: '右栏内容',
      },
      required: true,
      editor: lexicalEditor({
        features: getNestedFeatures,
      }),
    },
    {
      name: 'columnRatio',
      type: 'select',
      label: {
        en: 'Column Ratio',
        zh: '列宽比例',
      },
      defaultValue: '1:1',
      options: [
        { label: '1:1 (Equal)', value: '1:1' },
        { label: '2:1 (Left Wider)', value: '2:1' },
        { label: '1:2 (Right Wider)', value: '1:2' },
        { label: '3:1 (Left Much Wider)', value: '3:1' },
        { label: '1:3 (Right Much Wider)', value: '1:3' },
      ],
    },
    {
      name: 'gap',
      type: 'select',
      label: {
        en: 'Gap Between Columns',
        zh: '列间距',
      },
      defaultValue: 'normal',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Normal', value: 'normal' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'verticalAlign',
      type: 'select',
      label: {
        en: 'Vertical Alignment',
        zh: '垂直对齐',
      },
      defaultValue: 'top',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
  ],
}
