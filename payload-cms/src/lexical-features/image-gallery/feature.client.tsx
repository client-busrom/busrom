// @ts-nocheck
/**
 * ImageGalleryFeature - Client Side
 * 完全按照 Demo HR 的成功模式重写
 */

'use client'

import { createClientFeature, slashMenuBasicGroupWithItems, toolbarAddDropdownGroupWithItems } from '@payloadcms/richtext-lexical/client'
import { ImageGalleryNode } from './node.tsx'
import { INSERT_IMAGE_GALLERY_COMMAND, ImageGalleryPlugin } from './plugin'
import { ImageGalleryComponent } from './component.client'

// Icon 组件 - 导出供工具栏使用
export const GalleryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
)

export const ImageGalleryFeatureClient = createClientFeature({
  nodes: [
    ImageGalleryNode, // DecoratorNode 自己处理渲染，不需要 Component 属性
  ],
  plugins: [
    {
      Component: ImageGalleryPlugin,
      position: 'normal',
    },
  ],
  // 不再添加到 slashMenu，因为已经在右侧"自定义块"下拉菜单中
  // 不再添加到 toolbarFixed，因为已经在右侧"自定义块"下拉菜单中
})
