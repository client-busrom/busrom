/**
 * CtaButtonFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { CtaButtonNode } from './node'
import { CtaButtonPlugin } from './plugin'

export const CtaButtonFeatureClient = createClientFeature({
  nodes: [CtaButtonNode],
  plugins: [
    {
      Component: CtaButtonPlugin,
      position: 'normal',
    },
  ],
})
