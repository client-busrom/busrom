// @ts-nocheck
/**
 * ProductCarouselFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { ProductCarouselNode } from './node'
import { ProductCarouselPlugin } from './plugin'

export const ProductCarouselFeatureClient = createClientFeature({
  nodes: [ProductCarouselNode],
  plugins: [
    {
      Component: ProductCarouselPlugin,
      position: 'normal',
    },
  ],
})
