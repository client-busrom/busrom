/**
 * CtaButtonFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { CtaButtonNode } from './node'

export const CtaButtonFeature = createServerFeature({
  key: 'ctaButton',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/cta-button/feature.client#CtaButtonFeatureClient',
      nodes: [
        {
          node: CtaButtonNode,
          type: CtaButtonNode.getType(),
        },
      ],
    }
  },
})
