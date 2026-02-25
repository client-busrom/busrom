// @ts-nocheck
/**
 * SeriesReusableBlock Feature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { SeriesReusableBlockNode } from './node'
import { SeriesReusableBlockPlugin } from './plugin'

export const SeriesReusableBlockFeatureClient = createClientFeature({
  nodes: [SeriesReusableBlockNode],
  plugins: [
    {
      Component: SeriesReusableBlockPlugin,
      position: 'normal',
    },
  ],
})
