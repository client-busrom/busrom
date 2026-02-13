// @ts-nocheck
/**
 * IconListFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { IconListNode } from './node'

export const IconListFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/icon-list/feature.client#IconListFeatureClient',
    nodes: [
      {
        node: IconListNode,
        type: IconListNode.getType(),
      },
    ],
  },
  key: 'iconList',
})
