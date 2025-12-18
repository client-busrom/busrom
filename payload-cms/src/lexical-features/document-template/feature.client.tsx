// @ts-nocheck
/**
 * Document Template Feature - Client
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { ToolbarButton } from './ToolbarButton'

export const DocumentTemplateFeatureClient = createClientFeature({
  toolbarFixed: {
    groups: [
      {
        key: 'documentTemplate',
        type: 'buttons',
        items: [
          {
            Component: ToolbarButton,
            key: 'documentTemplate',
          },
        ],
      },
    ],
  },
})
