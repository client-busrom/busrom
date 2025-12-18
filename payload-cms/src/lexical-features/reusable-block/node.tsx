/**
 * ReusableBlock Node - Lexical DecoratorNode
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

export interface ReusableBlockData {
  reusableBlock: string | { id: string } // Relationship to reusable-blocks
}

export type SerializedReusableBlockNode = Spread<
  {
    data: ReusableBlockData
  },
  SerializedLexicalNode
>

export class ReusableBlockNode extends DecoratorNode<React.ReactElement> {
  __data: ReusableBlockData

  static getType(): string {
    return 'reusableBlock'
  }

  static clone(node: ReusableBlockNode): ReusableBlockNode {
    return new ReusableBlockNode(node.__data, node.__key)
  }

  constructor(data: ReusableBlockData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'reusable-block-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedReusableBlockNode): ReusableBlockNode {
    const node = $createReusableBlockNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedReusableBlockNode {
    return {
      data: this.__data,
      type: 'reusableBlock',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-reusable-block')) {
          return null
        }
        return {
          conversion: convertReusableBlockElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-reusable-block', 'true')
    element.setAttribute('data-reusable-block', JSON.stringify(this.__data))
    return { element }
  }

  getData(): ReusableBlockData {
    return this.getLatest().__data
  }

  setData(data: ReusableBlockData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const ReusableBlockComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.ReusableBlockComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading reusable block...</div>}>
        <ReusableBlockComponent nodeKey={this.__key} data={this.__data} />
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
    return '[Reusable Block]'
  }
}

function convertReusableBlockElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-reusable-block')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createReusableBlockNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse reusable block data:', e)
    }
  }
  return null
}

export function $createReusableBlockNode(data: ReusableBlockData): ReusableBlockNode {
  return new ReusableBlockNode(data)
}

export function $isReusableBlockNode(node: LexicalNode | null | undefined): node is ReusableBlockNode {
  return node instanceof ReusableBlockNode
}
