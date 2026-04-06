// @ts-nocheck
/**
 * Application Carousel Node - Lexical DecoratorNode
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

export interface ApplicationCarouselData {
  applications: (string | { id: string })[] // Application IDs
  autoplay: boolean
  interval: number // in seconds
  itemsPerView: number // 同屏显示数量 (1-4)
  showTitle: boolean
  showDescription: boolean
}

export type SerializedApplicationCarouselNode = Spread<
  {
    data: ApplicationCarouselData
  },
  SerializedLexicalNode
>

export class ApplicationCarouselNode extends DecoratorNode<React.ReactElement> {
  __data: ApplicationCarouselData

  static getType(): string {
    return 'applicationCarousel'
  }

  static clone(node: ApplicationCarouselNode): ApplicationCarouselNode {
    return new ApplicationCarouselNode(node.__data, node.__key)
  }

  constructor(data: ApplicationCarouselData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'application-carousel-node'
    div.style.width = '100%'
    div.style.display = 'block'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedApplicationCarouselNode): ApplicationCarouselNode {
    const node = $createApplicationCarouselNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedApplicationCarouselNode {
    return {
      data: this.__data,
      type: 'applicationCarousel',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-application-carousel')) {
          return null
        }
        return {
          conversion: convertApplicationCarouselElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-application-carousel', 'true')
    element.setAttribute('data-application-carousel', JSON.stringify(this.__data))
    return { element }
  }

  getData(): ApplicationCarouselData {
    return this.getLatest().__data
  }

  setData(data: ApplicationCarouselData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const ApplicationCarouselComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.ApplicationCarouselComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading application carousel...</div>}>
        <ApplicationCarouselComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Application Carousel: ${this.__data.applications.length} applications]`
  }
}

function convertApplicationCarouselElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-application-carousel')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createApplicationCarouselNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse application carousel data:', e)
    }
  }
  return null
}

export function $createApplicationCarouselNode(data: ApplicationCarouselData): ApplicationCarouselNode {
  return new ApplicationCarouselNode(data)
}

export function $isApplicationCarouselNode(node: LexicalNode | null | undefined): node is ApplicationCarouselNode {
  return node instanceof ApplicationCarouselNode
}
