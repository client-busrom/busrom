// @ts-nocheck
/**
 * IconListFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { IconListNode } from './node'
import { IconListPlugin } from './plugin'

export const IconListFeatureClient = createClientFeature({
  nodes: [IconListNode],
  plugins: [
    {
      Component: IconListPlugin,
      position: 'normal',
    },
  ],
})
