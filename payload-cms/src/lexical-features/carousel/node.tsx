// @ts-nocheck
/**
 * Carousel Node - Lexical DecoratorNode
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

export interface CarouselSlide {
  image: string | { id: string }
  title?: string
  description?: string
  showButton?: boolean
  buttonText?: string
  buttonLink?: string
  openInNewTab?: boolean
}

export interface CarouselData {
  slides: CarouselSlide[]
  autoplay: boolean
  interval: number // in seconds
  itemsPerView: number // 同屏显示数量 (1-4)
}

export type SerializedCarouselNode = Spread<
  {
    data: CarouselData
  },
  SerializedLexicalNode
>

export class CarouselNode extends DecoratorNode<React.ReactElement> {
  __data: CarouselData

  static getType(): string {
    return 'carousel'
  }

  static clone(node: CarouselNode): CarouselNode {
    return new CarouselNode(node.__data, node.__key)
  }

  constructor(data: CarouselData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'carousel-node'
    div.style.width = '100%'
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedCarouselNode): CarouselNode {
    const node = $createCarouselNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedCarouselNode {
    return {
      data: this.__data,
      type: 'carousel',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-carousel')) {
          return null
        }
        return {
          conversion: convertCarouselElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-carousel', 'true')
    element.setAttribute('data-carousel', JSON.stringify(this.__data))
    return { element }
  }

  getData(): CarouselData {
    return this.getLatest().__data
  }

  setData(data: CarouselData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const CarouselComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.CarouselComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading carousel...</div>}>
        <CarouselComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Carousel: ${this.__data.slides.length} slides]`
  }
}

function convertCarouselElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-carousel')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createCarouselNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse carousel data:', e)
    }
  }
  return null
}

export function $createCarouselNode(data: CarouselData): CarouselNode {
  return new CarouselNode(data)
}

export function $isCarouselNode(node: LexicalNode | null | undefined): node is CarouselNode {
  return node instanceof CarouselNode
}
