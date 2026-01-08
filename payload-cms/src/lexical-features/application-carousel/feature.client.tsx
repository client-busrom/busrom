// @ts-nocheck
/**
 * ApplicationCarouselFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { ApplicationCarouselNode } from './node'
import { ApplicationCarouselPlugin } from './plugin'

export const ApplicationCarouselFeatureClient = createClientFeature({
  nodes: [ApplicationCarouselNode],
  plugins: [
    {
      Component: ApplicationCarouselPlugin,
      position: 'normal',
    },
  ],
})
