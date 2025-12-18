// @ts-nocheck
/**
 * FormBlock Feature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { FormBlockNode } from './node'
import { FormBlockPlugin } from './plugin'

export const FormBlockFeatureClient = createClientFeature({
  nodes: [FormBlockNode],
  plugins: [
    {
      Component: FormBlockPlugin,
      position: 'normal',
    },
  ],
})
