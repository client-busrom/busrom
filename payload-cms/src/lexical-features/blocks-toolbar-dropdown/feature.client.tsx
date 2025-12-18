'use client'

/**
 * Blocks Toolbar Dropdown - Client Feature
 * 添加工具栏下拉菜单来插入自定义块
 */

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { ToolbarButton } from './ToolbarButton'

export const BlocksToolbarDropdownFeatureClient = createClientFeature({
  toolbarFixed: {
    groups: [
      {
        type: 'buttons',
        items: [
          {
            Component: ToolbarButton,
            key: 'customBlocks',
          },
        ],
      },
    ],
  },
})
