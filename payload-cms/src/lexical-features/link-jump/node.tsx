// @ts-nocheck
/**
 * LinkJump Node - Lexical DecoratorNode
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

export interface LinkJumpData {
  title: string
  description?: string
  url: string
  isInternalLink?: boolean // 是否为站内链接
  icon?: string | { id: string }
  iconName?: string // Lucide-react icon name
  openInNewTab: boolean
}

export type SerializedLinkJumpNode = Spread<
  {
    data: LinkJumpData
  },
  SerializedLexicalNode
>

export class LinkJumpNode extends DecoratorNode<React.ReactElement> {
  __data: LinkJumpData

  static getType(): string {
    return 'linkJump'
  }

  static clone(node: LinkJumpNode): LinkJumpNode {
    return new LinkJumpNode(node.__data, node.__key)
  }

  constructor(data: LinkJumpData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'link-jump-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedLinkJumpNode): LinkJumpNode {
    const node = $createLinkJumpNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedLinkJumpNode {
    return {
      data: this.__data,
      type: 'linkJump',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-link-jump')) {
          return null
        }
        return {
          conversion: convertLinkJumpElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-link-jump', 'true')
    element.setAttribute('data-link-jump', JSON.stringify(this.__data))
    return { element }
  }

  getData(): LinkJumpData {
    return this.getLatest().__data
  }

  setData(data: LinkJumpData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const LinkJumpComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.LinkJumpComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading link...</div>}>
        <LinkJumpComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Link: ${this.__data.title}]`
  }
}

function convertLinkJumpElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-link-jump')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createLinkJumpNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse link jump data:', e)
    }
  }
  return null
}

export function $createLinkJumpNode(data: LinkJumpData): LinkJumpNode {
  return new LinkJumpNode(data)
}

export function $isLinkJumpNode(node: LexicalNode | null | undefined): node is LinkJumpNode {
  return node instanceof LinkJumpNode
}
