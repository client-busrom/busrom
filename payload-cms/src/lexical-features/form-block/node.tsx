/**
 * FormBlock Node - Lexical DecoratorNode
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

export interface FormBlockData {
  formConfig: string | { id: string } // Relationship to form-configs
  displayTitle: boolean
}

export type SerializedFormBlockNode = Spread<
  {
    data: FormBlockData
  },
  SerializedLexicalNode
>

export class FormBlockNode extends DecoratorNode<React.ReactElement> {
  __data: FormBlockData

  static getType(): string {
    return 'formBlock'
  }

  static clone(node: FormBlockNode): FormBlockNode {
    return new FormBlockNode(node.__data, node.__key)
  }

  constructor(data: FormBlockData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'form-block-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedFormBlockNode): FormBlockNode {
    const node = $createFormBlockNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedFormBlockNode {
    return {
      data: this.__data,
      type: 'formBlock',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-form-block')) {
          return null
        }
        return {
          conversion: convertFormBlockElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-form-block', 'true')
    element.setAttribute('data-form-block', JSON.stringify(this.__data))
    return { element }
  }

  getData(): FormBlockData {
    return this.getLatest().__data
  }

  setData(data: FormBlockData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const FormBlockComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.FormBlockComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading form...</div>}>
        <FormBlockComponent nodeKey={this.__key} data={this.__data} />
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
    return '[Form Block]'
  }
}

function convertFormBlockElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-form-block')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createFormBlockNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse form block data:', e)
    }
  }
  return null
}

export function $createFormBlockNode(data: FormBlockData): FormBlockNode {
  return new FormBlockNode(data)
}

export function $isFormBlockNode(node: LexicalNode | null | undefined): node is FormBlockNode {
  return node instanceof FormBlockNode
}
