// @ts-nocheck
/**
 * ProductCarouselFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { ProductCarouselNode } from './node'

export const ProductCarouselFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/product-carousel/feature.client#ProductCarouselFeatureClient',
    nodes: [
      {
        node: ProductCarouselNode,
        type: ProductCarouselNode.getType(),
      },
    ],
  },
  key: 'productCarousel',
})
