
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
    description: {
      en: 'Select FAQ categories and specific questions to display in a structured way.',
      zh: '结构化选择展示 FAQ 分类及具体问题。',
    },
    components: {
      Block: '@/blocks/previews/FaqSelectionPreview#FaqSelectionPreview',
    },
  },
  fields: FaqSelectionFields,
}
