/**
 * Notice Node - Lexical DecoratorNode
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
} from 'lexical'

import { DecoratorNode } from 'lexical'
import * as React from 'react'

export type NoticeType = 'info' | 'success' | 'warning' | 'error'

export interface NoticeData {
  type: NoticeType
  title?: string
  content: string
}

export type SerializedNoticeNode = Spread<
  {
    data: NoticeData
  },
  SerializedLexicalNode
>

export class NoticeNode extends DecoratorNode<React.ReactElement> {
  __data: NoticeData

  static getType(): string {
    return 'notice'
  }

  static clone(node: NoticeNode): NoticeNode {
    return new NoticeNode(node.__data, node.__key)
  }

  constructor(data: NoticeData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'notice-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedNoticeNode): NoticeNode {
    const node = $createNoticeNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedNoticeNode {
    return {
      data: this.__data,
      type: 'notice',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-notice')) {
          return null
        }
        return {
          conversion: convertNoticeElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-notice', 'true')
    element.setAttribute('data-notice', JSON.stringify(this.__data))
    return { element }
  }

  getData(): NoticeData {
    return this.getLatest().__data
  }

  setData(data: NoticeData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    // DecoratorNode 必须在 decorate() 中直接返回 React 组件
    // Lazy import 避免循环依赖
    const NoticeComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.NoticeComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading notice...</div>}>
        <NoticeComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Notice: ${this.__data.type}] ${this.__data.content}`
  }
}

function convertNoticeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-notice')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createNoticeNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse Notice data:', e)
    }
  }
  return null
}

export function $createNoticeNode(data: NoticeData): NoticeNode {
  return new NoticeNode(data)
}

export function $isNoticeNode(node: LexicalNode | null | undefined): node is NoticeNode {
  return node instanceof NoticeNode
}
