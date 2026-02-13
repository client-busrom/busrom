// @ts-nocheck
/**
 * IconList Node - Lexical DecoratorNode
 * 图标列表组件 - 用于展示 icon + 标题 + 副标题 的列表
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

export interface IconListItem {
  icon: string // Iconify format: "lucide:arrow-right", "mdi:home"
  title: string
  subtitle?: string
}

export interface IconListData {
  items: IconListItem[]
}

export type SerializedIconListNode = Spread<
  {
    data: IconListData
  },
  SerializedLexicalNode
>

export class IconListNode extends DecoratorNode<React.ReactElement> {
  __data: IconListData

  static getType(): string {
    return 'iconList'
  }

  static clone(node: IconListNode): IconListNode {
    return new IconListNode(node.__data, node.__key)
  }

  constructor(data: IconListData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'icon-list-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedIconListNode): IconListNode {
    const node = $createIconListNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedIconListNode {
    return {
      data: this.__data,
      type: 'iconList',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-icon-list')) {
          return null
        }
        return {
          conversion: convertIconListElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-icon-list', 'true')
    element.setAttribute('data-icon-list', JSON.stringify(this.__data))
    return { element }
  }

  getData(): IconListData {
    return this.getLatest().__data
  }

  setData(data: IconListData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const IconListComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.IconListComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading icon list...</div>}>
        <IconListComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Icon List: ${this.__data.items.length} items]`
  }
}

function convertIconListElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-icon-list')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createIconListNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse icon list data:', e)
    }
  }
  return null
}

export function $createIconListNode(data: IconListData): IconListNode {
  return new IconListNode(data)
}

export function $isIconListNode(node: LexicalNode | null | undefined): node is IconListNode {
  return node instanceof IconListNode
}
