
// @ts-nocheck
'use client'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { FaqSelectionNode } from './node'
import { FaqSelectionPlugin } from './plugin'

export const FaqSelectionFeatureClient = createClientFeature({
  nodes: [FaqSelectionNode],
  plugins: [
    {
      Component: FaqSelectionPlugin,
      position: 'normal',
    },
  ],
})
