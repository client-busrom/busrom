// @ts-nocheck
/**
 * ProductReusableBlock Node - Lexical DecoratorNode
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

export interface ProductReusableBlockData {
  productReusableBlock: string | { id: string } // Relationship to product-reusable-blocks
}

export type SerializedProductReusableBlockNode = Spread<
  {
    data: ProductReusableBlockData
  },
  SerializedLexicalNode
>

export class ProductReusableBlockNode extends DecoratorNode<React.ReactElement> {
  __data: ProductReusableBlockData

  static getType(): string {
    return 'productReusableBlock'
  }

  static clone(node: ProductReusableBlockNode): ProductReusableBlockNode {
    return new ProductReusableBlockNode(node.__data, node.__key)
  }

  constructor(data: ProductReusableBlockData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'product-reusable-block-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedProductReusableBlockNode): ProductReusableBlockNode {
    const node = $createProductReusableBlockNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedProductReusableBlockNode {
    return {
      data: this.__data,
      type: 'productReusableBlock',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-product-reusable-block')) {
          return null
        }
        return {
          conversion: convertProductReusableBlockElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-product-reusable-block', 'true')
    element.setAttribute('data-product-reusable-block', JSON.stringify(this.__data))
    return { element }
  }

  getData(): ProductReusableBlockData {
    return this.getLatest().__data
  }

  setData(data: ProductReusableBlockData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const ProductReusableBlockComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.ProductReusableBlockComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading product block...</div>}>
        <ProductReusableBlockComponent nodeKey={this.__key} data={this.__data} />
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
    return '[Product Reusable Block]'
  }
}

function convertProductReusableBlockElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-product-reusable-block')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createProductReusableBlockNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse product reusable block data:', e)
    }
  }
  return null
}

export function $createProductReusableBlockNode(data: ProductReusableBlockData): ProductReusableBlockNode {
  return new ProductReusableBlockNode(data)
}

export function $isProductReusableBlockNode(node: LexicalNode | null | undefined): node is ProductReusableBlockNode {
  return node instanceof ProductReusableBlockNode
}
