// @ts-nocheck
/**
 * MarqueeLinks Feature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { MarqueeLinksNode } from './node'

export const MarqueeLinksFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/marquee-links/feature.client#MarqueeLinksFeatureClient',
    nodes: [
      {
        node: MarqueeLinksNode,
        type: MarqueeLinksNode.getType(),
      },
    ],
  },
  key: 'marqueeLinks',
})
