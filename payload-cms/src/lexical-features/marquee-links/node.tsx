// @ts-nocheck
/**
 * MarqueeLinks Node - Lexical DecoratorNode
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

export interface MarqueeLink {
  title: string
  url: string
  icon?: string | { id: string }
  iconName?: string // Lucide icon name
}

export interface MarqueeLinksData {
  links: MarqueeLink[]
  speed: 'slow' | 'medium' | 'fast'
}

export type SerializedMarqueeLinksNode = Spread<
  {
    data: MarqueeLinksData
  },
  SerializedLexicalNode
>

export class MarqueeLinksNode extends DecoratorNode<React.ReactElement> {
  __data: MarqueeLinksData

  static getType(): string {
    return 'marqueeLinks'
  }

  static clone(node: MarqueeLinksNode): MarqueeLinksNode {
    return new MarqueeLinksNode(node.__data, node.__key)
  }

  constructor(data: MarqueeLinksData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'marquee-links-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedMarqueeLinksNode): MarqueeLinksNode {
    const node = $createMarqueeLinksNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedMarqueeLinksNode {
    return {
      data: this.__data,
      type: 'marqueeLinks',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-marquee-links')) {
          return null
        }
        return {
          conversion: convertMarqueeLinksElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-marquee-links', 'true')
    element.setAttribute('data-marquee-links', JSON.stringify(this.__data))
    return { element }
  }

  getData(): MarqueeLinksData {
    return this.getLatest().__data
  }

  setData(data: MarqueeLinksData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const MarqueeLinksComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.MarqueeLinksComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading marquee links...</div>}>
        <MarqueeLinksComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Marquee Links: ${this.__data.links.length} links]`
  }
}

function convertMarqueeLinksElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-marquee-links')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createMarqueeLinksNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse marquee links data:', e)
    }
  }
  return null
}

export function $createMarqueeLinksNode(data: MarqueeLinksData): MarqueeLinksNode {
  return new MarqueeLinksNode(data)
}

export function $isMarqueeLinksNode(node: LexicalNode | null | undefined): node is MarqueeLinksNode {
  return node instanceof MarqueeLinksNode
}
