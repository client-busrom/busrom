
import type { Block } from 'payload'
import { FaqSelectionFields } from './fields/faqSelectionFields'

export const FaqSelection: Block = {
  slug: 'faqSelection',
  interfaceName: 'FaqSelectionBlock',
  labels: {
    singular: {
      en: '🔍 FAQ Selection',
      zh: '🔍 FAQ 智能选择',
    },
    plural: {
      en: 'FAQ Selections',
      zh: 'FAQ 智能选择',
    },
  },
  admin: {
    components: {
      Block: '@/blocks/previews/FaqSelectionPreview#FaqSelectionPreview',
    },
  },
  fields: FaqSelectionFields,
}
