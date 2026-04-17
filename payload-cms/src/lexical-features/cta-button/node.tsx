// @ts-nocheck
/**
 * CtaButton Node - Lexical DecoratorNode
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

export type CtaButtonStyle = 'primary' | 'secondary' | 'outline'
export type CtaButtonSize = 'small' | 'medium' | 'large'

export interface CtaButtonData {
  text: string
  url: string
  style: CtaButtonStyle
  size: CtaButtonSize
  openInNewTab: boolean
}

export type SerializedCtaButtonNode = Spread<
  {
    data: CtaButtonData
  },
  SerializedLexicalNode
>

export class CtaButtonNode extends DecoratorNode<React.ReactElement> {
  __data: CtaButtonData

  static getType(): string {
    return 'ctaButton'
  }

  static clone(node: CtaButtonNode): CtaButtonNode {
    return new CtaButtonNode(node.__data, node.__key)
  }

  constructor(data: CtaButtonData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'cta-button-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedCtaButtonNode): CtaButtonNode {
    const node = $createCtaButtonNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedCtaButtonNode {
    return {
      data: this.__data,
      type: 'ctaButton',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-cta-button')) {
          return null
        }
        return {
          conversion: convertCtaButtonElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-cta-button', 'true')
    element.setAttribute('data-cta-button', JSON.stringify(this.__data))
    return { element }
  }

  getData(): CtaButtonData {
    return this.getLatest().__data
  }

  setData(data: CtaButtonData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    // DecoratorNode 必须在 decorate() 中直接返回 React 组件
    // Lazy import 避免循环依赖
    const CtaButtonComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.CtaButtonComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading button...</div>}>
        <CtaButtonComponent nodeKey={this.__key} data={this.__data} />
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
    return `[CTA Button: ${this.__data.text}]`
  }
}

function convertCtaButtonElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-cta-button')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createCtaButtonNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse CTA button data:', e)
    }
  }
  return null
}

export function $createCtaButtonNode(data: CtaButtonData): CtaButtonNode {
  return new CtaButtonNode(data)
}

export function $isCtaButtonNode(node: LexicalNode | null | undefined): node is CtaButtonNode {
  return node instanceof CtaButtonNode
}
