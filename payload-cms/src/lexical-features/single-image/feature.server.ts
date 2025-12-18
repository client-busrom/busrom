/**
 * SingleImageFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { SingleImageNode } from './node'

export const SingleImageFeature = createServerFeature({
  key: 'singleImage',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/single-image/feature.client#SingleImageFeatureClient',
      nodes: [
        {
          node: SingleImageNode,
          type: SingleImageNode.getType(),
        },
      ],
    }
  },
})
