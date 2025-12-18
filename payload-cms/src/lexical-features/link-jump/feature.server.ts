/**
 * LinkJumpFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { LinkJumpNode } from './node'

export const LinkJumpFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/link-jump/feature.client#LinkJumpFeatureClient',
    nodes: [
      {
        node: LinkJumpNode,
        type: LinkJumpNode.getType(),
      },
    ],
  },
  key: 'linkJump',
})
