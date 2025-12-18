/**
 * MarqueeLinks Feature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { MarqueeLinksNode } from './node'
import { MarqueeLinksPlugin } from './plugin'

export const MarqueeLinksFeatureClient = createClientFeature({
  nodes: [MarqueeLinksNode],
  plugins: [
    {
      Component: MarqueeLinksPlugin,
      position: 'normal',
    },
  ],
})
