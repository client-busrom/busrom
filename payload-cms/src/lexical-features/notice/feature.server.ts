// @ts-nocheck
/**
 * NoticeFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { NoticeNode } from './node'

export const NoticeFeature = createServerFeature({
  key: 'notice',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/notice/feature.client#NoticeFeatureClient',
      nodes: [
        {
          node: NoticeNode,
          type: NoticeNode.getType(),
        },
      ],
    }
  },
})
