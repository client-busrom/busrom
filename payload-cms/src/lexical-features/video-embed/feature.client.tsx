/**
 * VideoEmbedFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { VideoEmbedNode } from './node'
import { VideoEmbedPlugin } from './plugin'

export const VideoEmbedFeatureClient = createClientFeature({
  nodes: [VideoEmbedNode],
  plugins: [
    {
      Component: VideoEmbedPlugin,
      position: 'normal',
    },
  ],
})
