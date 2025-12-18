// @ts-nocheck
/**
 * Hero Node - Lexical DecoratorNode
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

export type HeroHeight = 'small' | 'medium' | 'large' | 'fullscreen'

export interface HeroData {
  title: string
  subtitle?: string
  backgroundImage?: string | { id: string }
  ctaText?: string
  ctaUrl?: string
  height: HeroHeight
}

export type SerializedHeroNode = Spread<
  {
    data: HeroData
  },
  SerializedLexicalNode
>

export class HeroNode extends DecoratorNode<React.ReactElement> {
  __data: HeroData

  static getType(): string {
    return 'hero'
  }

  static clone(node: HeroNode): HeroNode {
    return new HeroNode(node.__data, node.__key)
  }

  constructor(data: HeroData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'hero-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedHeroNode): HeroNode {
    const node = $createHeroNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedHeroNode {
    return {
      data: this.__data,
      type: 'hero',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-hero')) {
          return null
        }
        return {
          conversion: convertHeroElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-hero', 'true')
    element.setAttribute('data-hero', JSON.stringify(this.__data))
    return { element }
  }

  getData(): HeroData {
    return this.getLatest().__data
  }

  setData(data: HeroData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const HeroComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.HeroComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading hero...</div>}>
        <HeroComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Hero: ${this.__data.title}]`
  }
}

function convertHeroElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-hero')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createHeroNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse Hero data:', e)
    }
  }
  return null
}

export function $createHeroNode(data: HeroData): HeroNode {
  return new HeroNode(data)
}

export function $isHeroNode(node: LexicalNode | null | undefined): node is HeroNode {
  return node instanceof HeroNode
}
