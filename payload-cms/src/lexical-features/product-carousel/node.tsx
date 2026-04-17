// @ts-nocheck
/**
 * Product Carousel Node - Lexical DecoratorNode
 *
 * Each item can be:
 * - Manual selection: specific product ID
 * - Auto selection: random product from a product series (fetched at runtime)
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

export interface ProductCarouselItem {
  id: string // Unique item ID for tracking
  selectionMode: 'manual' | 'auto'
  product?: string // Product ID (for manual selection)
  productSeries?: string // Product Series ID (for auto selection)
  // Display settings per item
  showName: boolean
  showCategory: boolean
  showDescription: boolean
  showButton: boolean
  showHighlights: boolean
  highlightsCount: number
  buttonText: string // Translatable
  customName?: string // Translatable - Displayed instead of product name/category if provided
  openInNewTab: boolean
}

export interface ProductCarouselData {
  items: ProductCarouselItem[]
  // Carousel settings
  autoplay: boolean
  interval: number // in seconds
  itemsPerView: number // 1-4
}

export type SerializedProductCarouselNode = Spread<
  {
    data: ProductCarouselData
  },
  SerializedLexicalNode
>

export class ProductCarouselNode extends DecoratorNode<React.ReactElement> {
  __data: ProductCarouselData

  static getType(): string {
    return 'productCarousel'
  }

  static clone(node: ProductCarouselNode): ProductCarouselNode {
    return new ProductCarouselNode(node.__data, node.__key)
  }

  constructor(data: ProductCarouselData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'product-carousel-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedProductCarouselNode): ProductCarouselNode {
    const node = $createProductCarouselNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedProductCarouselNode {
    return {
      data: this.__data,
      type: 'productCarousel',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-product-carousel')) {
          return null
        }
        return {
          conversion: convertProductCarouselElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-product-carousel', 'true')
    element.setAttribute('data-product-carousel', JSON.stringify(this.__data))
    return { element }
  }

  getData(): ProductCarouselData {
    return this.getLatest().__data
  }

  setData(data: ProductCarouselData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const ProductCarouselComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.ProductCarouselComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading product carousel...</div>}>
        <ProductCarouselComponent nodeKey={this.__key} data={this.__data} />
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
    const manualCount = this.__data.items.filter(i => i.selectionMode === 'manual').length
    const autoCount = this.__data.items.filter(i => i.selectionMode === 'auto').length
    return `[Product Carousel: ${manualCount} manual, ${autoCount} auto]`
  }
}

function convertProductCarouselElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-product-carousel')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createProductCarouselNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse product carousel data:', e)
    }
  }
  return null
}

export function $createProductCarouselNode(data: ProductCarouselData): ProductCarouselNode {
  return new ProductCarouselNode(data)
}

export function $isProductCarouselNode(node: LexicalNode | null | undefined): node is ProductCarouselNode {
  return node instanceof ProductCarouselNode
}
