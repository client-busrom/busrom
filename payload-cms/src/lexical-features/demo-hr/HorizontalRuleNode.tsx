/**
 * HorizontalRuleNode - 官方示例 DecoratorNode
 * 来源：https://payloadcms.com/docs/rich-text/custom-features
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'

import { $applyNodeReplacement, DecoratorNode } from '@payloadcms/richtext-lexical/lexical'

export type SerializedHorizontalRuleNode = SerializedLexicalNode

export class HorizontalRuleNode extends DecoratorNode<React.ReactElement> {
  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  static getType(): string {
    return 'demo-horizontalrule' // 改为唯一的类型名，避免与内置 HorizontalRuleFeature 冲突
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0,
      }),
    }
  }

  static importJSON(serializedNode: SerializedHorizontalRuleNode): HorizontalRuleNode {
    return $createHorizontalRuleNode()
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.padding = '12px 0'
    div.style.margin = '8px 0'

    const hr = document.createElement('hr')
    hr.style.border = 'none'
    hr.style.borderTop = '3px solid'
    hr.style.borderImage = 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899) 1'
    hr.style.height = '0'

    div.appendChild(hr)
    return div
  }

  decorate(): React.ReactElement {
    return (
      <div style={{ padding: '12px 0', margin: '8px 0' }}>
        <hr
          style={{
            border: 'none',
            borderTop: '3px solid',
            borderImage: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899) 1',
            height: 0,
          }}
        />
        <div
          style={{
            textAlign: 'center',
            color: '#8b5cf6',
            fontSize: '12px',
            marginTop: '4px',
            opacity: 0.6,
          }}
        >
          🧪 Custom Feature Demo
        </div>
      </div>
    )
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement('hr') }
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: 'demo-horizontalrule', // 与 getType() 保持一致
      version: 1,
    }
  }

  getTextContent(): string {
    return '\n'
  }

  isInline(): false {
    return false
  }

  updateDOM(): boolean {
    return false
  }
}

function $convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode())
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
