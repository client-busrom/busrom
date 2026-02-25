// @ts-nocheck
/**
 * ProductReusableBlock Feature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { ProductReusableBlockNode } from './node'

export const ProductReusableBlockFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/product-reusable-block/feature.client#ProductReusableBlockFeatureClient',
    nodes: [
      {
        node: ProductReusableBlockNode,
        type: ProductReusableBlockNode.getType(),
      },
    ],
  },
  key: 'productReusableBlock',
})
