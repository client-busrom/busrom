/**
 * HeroFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { HeroNode } from './node'

export const HeroFeature = createServerFeature({
  key: 'hero',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/hero/feature.client#HeroFeatureClient',
      nodes: [
        {
          node: HeroNode,
          type: HeroNode.getType(),
        },
      ],
    }
  },
})
