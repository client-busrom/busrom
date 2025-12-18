// @ts-nocheck
/**
 * CarouselFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { CarouselNode } from './node'
import { CarouselPlugin } from './plugin'

export const CarouselFeatureClient = createClientFeature({
  nodes: [CarouselNode],
  plugins: [
    {
      Component: CarouselPlugin,
      position: 'normal',
    },
  ],
})
