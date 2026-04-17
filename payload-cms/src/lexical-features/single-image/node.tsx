// @ts-nocheck
/**
 * SingleImage Node - Lexical DecoratorNode
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'

import { DecoratorNode } from '@payloadcms/richtext-lexical/lexical'
import * as React from 'react'

export type SingleImageAlignment = 'left' | 'center' | 'right'
export type SingleImageSize = 'small' | 'medium' | 'large' | 'full'

export interface SingleImageData {
  image: string | { id: string }
  caption?: string
  alignment: SingleImageAlignment
  size: SingleImageSize
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

export type SerializedSingleImageNode = Spread<
  {
    data: SingleImageData
  },
  SerializedLexicalNode
>

export class SingleImageNode extends DecoratorNode<React.ReactElement> {
  __data: SingleImageData

  static getType(): string {
    return 'singleImage'
  }

  static clone(node: SingleImageNode): SingleImageNode {
    return new SingleImageNode(node.__data, node.__key)
  }

  constructor(data: SingleImageData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'single-image-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedSingleImageNode): SingleImageNode {
    const node = $createSingleImageNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedSingleImageNode {
    return {
      data: this.__data,
      type: 'singleImage',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-single-image')) {
          return null
        }
        return {
          conversion: convertSingleImageElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-single-image', 'true')
    element.setAttribute('data-single-image', JSON.stringify(this.__data))
    return { element }
  }

  getData(): SingleImageData {
    return this.getLatest().__data
  }

  setData(data: SingleImageData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    // DecoratorNode 必须在 decorate() 中直接返回 React 组件
    // Lazy import 避免循环依赖
    const SingleImageComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.SingleImageComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading image...</div>}>
        <SingleImageComponent nodeKey={this.__key} data={this.__data} />
      </React.Suspense>
    )
  }

  isInline(): boolean {
    return false
  }

  isIsolated(): boolean {
    return true
  }

  getTextContent(): string {
    const caption = this.__data.caption || 'Single Image'
    return `[Image: ${caption}]`
  }
}

function convertSingleImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-single-image')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createSingleImageNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse single image data:', e)
    }
  }
  return null
}

export function $createSingleImageNode(data: SingleImageData): SingleImageNode {
  return new SingleImageNode(data)
}

export function $isSingleImageNode(node: LexicalNode | null | undefined): node is SingleImageNode {
  return node instanceof SingleImageNode
}
