/**
 * VideoEmbedFeature - Server Side
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { VideoEmbedNode } from './node'

export const VideoEmbedFeature = createServerFeature({
  key: 'videoEmbed',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/video-embed/feature.client#VideoEmbedFeatureClient',
      nodes: [
        {
          node: VideoEmbedNode,
          type: VideoEmbedNode.getType(),
        },
      ],
    }
  },
})
