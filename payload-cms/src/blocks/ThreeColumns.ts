/**
 * Three Columns Layout Block
 *
 * 三栏布局
 */

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { getNestedFeatures } from '../lexical-features/shared/features'

export const ThreeColumns: Block = {
  slug: 'threeColumns',
  interfaceName: 'ThreeColumnsBlock',
  labels: {
    singular: {
      en: 'Three Columns',
      zh: '三栏布局',
    },
    plural: {
      en: 'Three Columns',
      zh: '三栏布局',
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
      editor: lexicalEditor({ features: getNestedFeatures }),
    },
    {
      name: 'centerColumn',
      type: 'richText',
      label: {
        en: 'Center Column',
        zh: '中栏内容',
      },
      required: true,
      editor: lexicalEditor({ features: getNestedFeatures }),
    },
    {
      name: 'rightColumn',
      type: 'richText',
      label: {
        en: 'Right Column',
        zh: '右栏内容',
      },
      required: true,
      editor: lexicalEditor({ features: getNestedFeatures }),
    },
    {
      name: 'columnRatio',
      type: 'select',
      label: {
        en: 'Column Ratio',
        zh: '列宽比例',
      },
      defaultValue: '1:1:1',
      options: [
        { label: '1:1:1 (Equal)', value: '1:1:1' },
        { label: '2:1:1 (Left Wider)', value: '2:1:1' },
        { label: '1:2:1 (Center Wider)', value: '1:2:1' },
        { label: '1:1:2 (Right Wider)', value: '1:1:2' },
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
  ],
}
