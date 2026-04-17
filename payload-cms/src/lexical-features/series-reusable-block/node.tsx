// @ts-nocheck
/**
 * SeriesReusableBlock Node - Lexical DecoratorNode
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

export interface SeriesReusableBlockData {
  seriesReusableBlock: string | { id: string } // Relationship to series-reusable-blocks
}

export type SerializedSeriesReusableBlockNode = Spread<
  {
    data: SeriesReusableBlockData
  },
  SerializedLexicalNode
>

export class SeriesReusableBlockNode extends DecoratorNode<React.ReactElement> {
  __data: SeriesReusableBlockData

  static getType(): string {
    return 'seriesReusableBlock'
  }

  static clone(node: SeriesReusableBlockNode): SeriesReusableBlockNode {
    return new SeriesReusableBlockNode(node.__data, node.__key)
  }

  constructor(data: SeriesReusableBlockData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'series-reusable-block-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedSeriesReusableBlockNode): SeriesReusableBlockNode {
    const node = $createSeriesReusableBlockNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedSeriesReusableBlockNode {
    return {
      data: this.__data,
      type: 'seriesReusableBlock',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-series-reusable-block')) {
          return null
        }
        return {
          conversion: convertSeriesReusableBlockElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-series-reusable-block', 'true')
    element.setAttribute('data-series-reusable-block', JSON.stringify(this.__data))
    return { element }
  }

  getData(): SeriesReusableBlockData {
    return this.getLatest().__data
  }

  setData(data: SeriesReusableBlockData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const SeriesReusableBlockComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.SeriesReusableBlockComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading series block...</div>}>
        <SeriesReusableBlockComponent nodeKey={this.__key} data={this.__data} />
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
    return '[Series Reusable Block]'
  }
}

function convertSeriesReusableBlockElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-series-reusable-block')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createSeriesReusableBlockNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse series reusable block data:', e)
    }
  }
  return null
}

export function $createSeriesReusableBlockNode(data: SeriesReusableBlockData): SeriesReusableBlockNode {
  return new SeriesReusableBlockNode(data)
}

export function $isSeriesReusableBlockNode(node: LexicalNode | null | undefined): node is SeriesReusableBlockNode {
  return node instanceof SeriesReusableBlockNode
}
