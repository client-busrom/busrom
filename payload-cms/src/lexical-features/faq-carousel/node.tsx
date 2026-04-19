// @ts-nocheck
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

const FaqCarouselComponent = React.lazy(() => import('./component.client').then(module => ({ default: module.FaqCarouselComponent })))

export interface FaqCarouselItem {
  faq: any // FaqItem relationship
  image: any // Media or Application relationship
}

export interface FaqCarouselData {
  items: FaqCarouselItem[]
}

export type SerializedFaqCarouselNode = Spread<
  {
    data: FaqCarouselData
  },
  SerializedLexicalNode
>

export class FaqCarouselNode extends DecoratorNode<React.ReactElement> {
  __data: FaqCarouselData

  static getType(): string {
    return 'faqCarousel'
  }

  static clone(node: FaqCarouselNode): FaqCarouselNode {
    return new FaqCarouselNode(node.__data, node.__key)
  }

  constructor(data: FaqCarouselData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedFaqCarouselNode): FaqCarouselNode {
    return $createFaqCarouselNode(serializedNode.data)
  }

  exportJSON(): SerializedFaqCarouselNode {
    return {
      data: this.__data,
      type: FaqCarouselNode.getType(),
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-faq-carousel')) {
          return null
        }
        return {
          conversion: (domNode: HTMLElement): DOMConversionOutput => {
            const data = domNode.getAttribute('data-lexical-faq-carousel')
            if (data) {
              return { node: $createFaqCarouselNode(JSON.parse(data)) }
            }
            return { node: null }
          },
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-faq-carousel', JSON.stringify(this.__data))
    return { element }
  }

  getData(): FaqCarouselData {
    return this.__data
  }

  setData(data: FaqCarouselData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    return (
      <React.Suspense fallback={null}>
        <FaqCarouselComponent nodeKey={this.__key} data={this.__data} />
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
    return `FAQ Carousel: ${this.__data.items?.length || 0} items`
  }
}

export function $createFaqCarouselNode(data: FaqCarouselData): FaqCarouselNode {
  return new FaqCarouselNode(data)
}

export function $isFaqCarouselNode(node: LexicalNode | null | undefined): node is FaqCarouselNode {
  return node instanceof FaqCarouselNode
}
