// @ts-nocheck
/**
 * Demo HR Feature - Server Side
 * 官方示例：https://payloadcms.com/docs/rich-text/custom-features
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { HorizontalRuleNode } from './HorizontalRuleNode'

export const DemoHRFeature = createServerFeature({
  key: 'demoHR',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/demo-hr/feature.client#DemoHRFeatureClient',
      nodes: [
        {
          node: HorizontalRuleNode,
          type: HorizontalRuleNode.getType(),
        },
      ],
    }
  },
})
