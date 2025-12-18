// @ts-nocheck
/**
 * CarouselFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { CarouselNode } from './node'

export const CarouselFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/carousel/feature.client#CarouselFeatureClient',
    nodes: [
      {
        node: CarouselNode,
        type: CarouselNode.getType(),
      },
    ],
  },
  key: 'carousel',
})
