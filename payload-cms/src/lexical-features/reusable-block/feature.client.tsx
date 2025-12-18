// @ts-nocheck
/**
 * ReusableBlock Feature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { ReusableBlockNode } from './node'
import { ReusableBlockPlugin } from './plugin'

export const ReusableBlockFeatureClient = createClientFeature({
  nodes: [ReusableBlockNode],
  plugins: [
    {
      Component: ReusableBlockPlugin,
      position: 'normal',
    },
  ],
})
