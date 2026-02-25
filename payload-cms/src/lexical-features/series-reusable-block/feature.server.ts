// @ts-nocheck
/**
 * SeriesReusableBlock Feature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { SeriesReusableBlockNode } from './node'

export const SeriesReusableBlockFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/series-reusable-block/feature.client#SeriesReusableBlockFeatureClient',
    nodes: [
      {
        node: SeriesReusableBlockNode,
        type: SeriesReusableBlockNode.getType(),
      },
    ],
  },
  key: 'seriesReusableBlock',
})
