/**
 * HeroFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { HeroNode } from './node'
import { HeroPlugin } from './plugin'

export const HeroFeatureClient = createClientFeature({
  nodes: [HeroNode],
  plugins: [
    {
      Component: HeroPlugin,
      position: 'normal',
    },
  ],
})
