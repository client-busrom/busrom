
// @ts-nocheck
import { createServerFeature } from '@payloadcms/richtext-lexical'
import { FaqSelectionNode } from './node'

export const FaqSelectionFeatureDefinition = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/faq-selection/feature.client#FaqSelectionFeatureClient',
    nodes: [
      {
        node: FaqSelectionNode,
        type: FaqSelectionNode.getType(),
      },
    ],
  },
  key: 'faqSelection',
})
