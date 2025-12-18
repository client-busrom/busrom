/**
 * NoticeFeature - Client Side
 */

'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { NoticeNode } from './node'
import { NoticePlugin } from './plugin'

export const NoticeFeatureClient = createClientFeature({
  nodes: [NoticeNode],
  plugins: [
    {
      Component: NoticePlugin,
      position: 'normal',
    },
  ],
})
