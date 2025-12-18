// @ts-nocheck
/**
 * ImageGalleryFeature - Server Side
 * 完全按照 Demo HR 的成功模式重写
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'
import { ImageGalleryNode } from './node.tsx'

export const ImageGalleryFeature = createServerFeature({
  key: 'imageGallery',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/image-gallery/feature.client#ImageGalleryFeatureClient',
      nodes: [
        {
          node: ImageGalleryNode,
          type: ImageGalleryNode.getType(),
        },
      ],
    }
  },
})
