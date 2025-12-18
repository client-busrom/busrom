/**
 * Document Template Feature - Server
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'

export const DocumentTemplateFeature = createServerFeature({
  key: 'documentTemplate',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/document-template/feature.client#DocumentTemplateFeatureClient',
    }
  },
})
