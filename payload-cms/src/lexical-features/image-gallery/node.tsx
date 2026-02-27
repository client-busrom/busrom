// @ts-nocheck
/**
 * ImageGalleryNode - Custom Lexical Node
 * 图片画廊节点定义
 */

import type { Spread } from 'lexical'
import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical'
import React from 'react'

export interface ImageGalleryData {
  images: Array<{
    sourceType?: 'media' | 'application'  // default: 'media'
    image: string | { id: string }
    application?: string | { id: string }  // application ID when sourceType is 'application'
    caption?: string
    enableLink?: boolean
    linkUrl?: string
    openInNewTab?: boolean
  }>
  layout: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry'
  spacing: 'small' | 'normal' | 'large'
  lightbox: boolean
}

export type SerializedImageGalleryNode = Spread<
  {
    data: ImageGalleryData
  },
  SerializedLexicalNode
>

export class ImageGalleryNode extends DecoratorNode<React.ReactElement> {
  __data: ImageGalleryData

  static getType(): string {
    return 'custom-image-gallery' // 避免与内置功能冲突
  }

  static clone(node: ImageGalleryNode): ImageGalleryNode {
    return new ImageGalleryNode(node.__data, node.__key)
  }

  constructor(data: ImageGalleryData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'image-gallery-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedImageGalleryNode): ImageGalleryNode {
    const node = $createImageGalleryNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedImageGalleryNode {
    return {
      data: this.__data,
      type: 'custom-image-gallery', // 与 getType() 保持一致
      version: 1,
    }
  }

  decorate(): React.ReactElement {
    // DecoratorNode 必须在 decorate() 中直接返回 React 组件
    // Lazy import 避免循环依赖
    const ImageGalleryComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.ImageGalleryComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading gallery...</div>}>
        <ImageGalleryComponent nodeKey={this.__key} data={this.__data} />
      </React.Suspense>
    )
  }

  getData(): ImageGalleryData {
    return this.__data
  }

  setData(data: ImageGalleryData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  isInline(): boolean {
    return false
  }

  isIsolated(): boolean {
    return true
  }

  getTextContent(): string {
    return `Image Gallery (${this.__data.images.length} images)`
  }
}

export function $createImageGalleryNode(data: ImageGalleryData): ImageGalleryNode {
  return new ImageGalleryNode(data)
}

export function $isImageGalleryNode(
  node: LexicalNode | null | undefined,
): node is ImageGalleryNode {
  return node instanceof ImageGalleryNode
}
