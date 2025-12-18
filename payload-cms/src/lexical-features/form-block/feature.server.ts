/**
 * FormBlock Feature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { FormBlockNode } from './node'

export const FormBlockFeature = createServerFeature({
  feature: {
    ClientFeature: '@/lexical-features/form-block/feature.client#FormBlockFeatureClient',
    nodes: [
      {
        node: FormBlockNode,
        type: FormBlockNode.getType(),
      },
    ],
  },
  key: 'formBlock',
})
