// @ts-nocheck
/**
 * ProductReusableBlock Feature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { ProductReusableBlockNode } from './node'
import { ProductReusableBlockPlugin } from './plugin'

export const ProductReusableBlockFeatureClient = createClientFeature({
  nodes: [ProductReusableBlockNode],
  plugins: [
    {
      Component: ProductReusableBlockPlugin,
      position: 'normal',
    },
  ],
})
