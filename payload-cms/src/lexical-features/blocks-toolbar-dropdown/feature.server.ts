/**
 * Blocks Toolbar Dropdown - Server Feature
 * 在工具栏添加下拉菜单，用于访问自定义块
 */

import { createServerFeature } from '@payloadcms/richtext-lexical'

export const BlocksToolbarDropdownFeature = createServerFeature({
  key: 'blocksToolbarDropdown',
  feature: () => {
    return {
      ClientFeature: '@/lexical-features/blocks-toolbar-dropdown/feature.client#BlocksToolbarDropdownFeatureClient',
    }
  },
})
