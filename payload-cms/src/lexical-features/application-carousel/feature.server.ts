// @ts-nocheck
/**
 * ApplicationCarouselFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { ApplicationCarouselNode } from './node'

export const ApplicationCarouselFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/application-carousel/feature.client#ApplicationCarouselFeatureClient',
    nodes: [
      {
        node: ApplicationCarouselNode,
        type: ApplicationCarouselNode.getType(),
      },
    ],
  },
  key: 'applicationCarousel',
})
