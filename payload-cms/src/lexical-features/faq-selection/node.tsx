
// @ts-nocheck
import type { 
  DOMConversionMap, 
  DOMConversionOutput, 
  DOMExportOutput, 
  EditorConfig, 
  LexicalNode, 
  NodeKey, 
  SerializedLexicalNode, 
  Spread 
} from '@payloadcms/richtext-lexical/lexical'
import { DecoratorNode } from '@payloadcms/richtext-lexical/lexical'
import * as React from 'react'

const FaqSelectionComponent = React.lazy(() => import('./component.client').then(module => ({ default: module.FaqSelectionComponent })))

export type FaqSelectionData = {
  categories: {
    category: string | { id: string | number; adminLabel?: string }
    icon?: string
    image?: string | any
    gallery?: string | any
    questions: {
      faqItem: string | { id: string | number; adminLabel?: string }
      image?: string | any
      gallery?: string | any
    }[]
    cta?: {
      label: string
      url: string
      newTab?: boolean
    }
  }[]
}

export type SerializedFaqSelectionNode = Spread<{ data: FaqSelectionData }, SerializedLexicalNode>

export class FaqSelectionNode extends DecoratorNode<React.JSX.Element> {
  __data: FaqSelectionData

  static getType(): string {
    return 'faqSelection'
  }

  static clone(node: FaqSelectionNode): FaqSelectionNode {
    return new FaqSelectionNode(node.__data, node.__key)
  }

  static importJSON(serializedNode: SerializedFaqSelectionNode): FaqSelectionNode {
    const node = $createFaqSelectionNode(serializedNode.data)
    return node
  }

  constructor(data: FaqSelectionData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  exportJSON(): SerializedFaqSelectionNode {
    return {
      data: this.__data,
      type: 'faqSelection',
      version: 1,
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'block'
    div.style.width = '80%'
    div.style.maxWidth = '80%'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-faq-selection')) {
          return null
        }
        return {
          conversion: (domNode: HTMLElement): DOMConversionOutput => {
            const data = domNode.getAttribute('data-lexical-faq-selection')
            if (data) {
              return { node: $createFaqSelectionNode(JSON.parse(data)) }
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
    element.setAttribute('data-lexical-faq-selection', JSON.stringify(this.__data))
    element.setAttribute('data-payload-component', 'faqSelection')
    return { element }
  }

  setData(data: FaqSelectionData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  getData(): FaqSelectionData {
    return this.__data
  }

  decorate(): React.JSX.Element {
    return (
      <React.Suspense fallback={null}>
        <FaqSelectionComponent nodeKey={this.getKey()} data={this.__data} />
      </React.Suspense>
    )
  }

  isInline(): boolean {
    return false
  }

  isIsolated(): boolean {
    return true
  }
}

export function $createFaqSelectionNode(data: FaqSelectionData): FaqSelectionNode {
  return new FaqSelectionNode(data)
}

export function $isFaqSelectionNode(node: LexicalNode | null | undefined): node is FaqSelectionNode {
  return node instanceof FaqSelectionNode
}
