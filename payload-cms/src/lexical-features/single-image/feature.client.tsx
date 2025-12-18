// @ts-nocheck
/**
 * SingleImageFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { SingleImageNode } from './node'
import { SingleImagePlugin } from './plugin'

export const SingleImageFeatureClient = createClientFeature({
  nodes: [SingleImageNode],
  plugins: [
    {
      Component: SingleImagePlugin,
      position: 'normal',
    },
  ],
})
