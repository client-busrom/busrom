/**
 * LinkJumpFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { LinkJumpNode } from './node'
import { LinkJumpPlugin } from './plugin'

export const LinkJumpFeatureClient = createClientFeature({
  nodes: [LinkJumpNode],
  plugins: [
    {
      Component: LinkJumpPlugin,
      position: 'normal',
    },
  ],
})
