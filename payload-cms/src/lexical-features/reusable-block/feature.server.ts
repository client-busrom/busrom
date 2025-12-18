/**
 * ReusableBlock Feature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { ReusableBlockNode } from './node'

export const ReusableBlockFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/reusable-block/feature.client#ReusableBlockFeatureClient',
    nodes: [
      {
        node: ReusableBlockNode,
        type: ReusableBlockNode.getType(),
      },
    ],
  },
  key: 'reusableBlock',
})
