'use client'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { FaqCarouselNode } from './node'
import { FaqCarouselPlugin } from './plugin'

export const FaqCarouselFeatureClient = createClientFeature({
  nodes: [FaqCarouselNode],
  plugins: [
    {
      Component: FaqCarouselPlugin,
      position: 'normal',
    },
  ],
})
