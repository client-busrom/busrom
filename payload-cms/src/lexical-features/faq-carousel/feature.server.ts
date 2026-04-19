// @ts-nocheck
import { createServerFeature } from '@payloadcms/richtext-lexical'
import { FaqCarouselNode } from './node'

export const FaqCarouselFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/faq-carousel/feature.client#FaqCarouselFeatureClient',
    nodes: [
      {
        node: FaqCarouselNode,
        type: FaqCarouselNode.getType(),
      },
    ],
  },
  key: 'faqCarousel',
})
