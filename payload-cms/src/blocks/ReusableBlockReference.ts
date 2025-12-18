/**
 * Reusable Block Reference
 *
 * References a reusable content block
 */

import type { Block } from 'payload'

export const ReusableBlockReference: Block = {
  slug: 'reusableBlockReference',
  interfaceName: 'ReusableBlockReferenceType',
  labels: {
    singular: {
      en: '♻️ Reusable Block',
      zh: '♻️ 可复用块',
    },
    plural: {
      en: 'Reusable Blocks',
      zh: '可复用块',
    },
  },
  fields: [
    {
      name: 'reusableBlock',
      type: 'relationship',
      relationTo: 'reusable-blocks',
      required: true,
      label: {
        en: 'Select Reusable Block',
        zh: '选择可复用块',
      },
      admin: {
        description: {
          en: 'Choose a reusable block to insert',
          zh: '选择要插入的可复用块',
        },
      },
    },
  ],
}
