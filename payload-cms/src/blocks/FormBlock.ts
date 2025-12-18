/**
 * Form Block
 *
 * References a FormConfig for embedding forms in content
 */

import type { Block } from 'payload'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlockType',
  labels: {
    singular: {
      en: '📝 Form',
      zh: '📝 表单',
    },
    plural: {
      en: 'Forms',
      zh: '表单',
    },
  },
  fields: [
    {
      name: 'formConfig',
      type: 'relationship',
      relationTo: 'form-configs',
      required: true,
      label: {
        en: 'Select Form',
        zh: '选择表单',
      },
      admin: {
        description: {
          en: 'Choose which form to display',
          zh: '选择要显示的表单',
        },
      },
    },
    {
      name: 'displayTitle',
      type: 'checkbox',
      label: {
        en: 'Display Form Title',
        zh: '显示表单标题',
      },
      defaultValue: true,
    },
  ],
}
