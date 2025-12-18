/**
 * VideoEmbed Node - Lexical DecoratorNode
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

export type VideoAspectRatio = '16:9' | '4:3' | '1:1'

export interface VideoEmbedData {
  url: string
  caption?: string
  aspectRatio: VideoAspectRatio
}

export type SerializedVideoEmbedNode = Spread<
  {
    data: VideoEmbedData
  },
  SerializedLexicalNode
>

export class VideoEmbedNode extends DecoratorNode<React.ReactElement> {
  __data: VideoEmbedData

  static getType(): string {
    return 'videoEmbed'
  }

  static clone(node: VideoEmbedNode): VideoEmbedNode {
    return new VideoEmbedNode(node.__data, node.__key)
  }

  constructor(data: VideoEmbedData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'video-embed-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedVideoEmbedNode): VideoEmbedNode {
    const node = $createVideoEmbedNode(serializedNode.data)
    return node
  }

  exportJSON(): SerializedVideoEmbedNode {
    return {
      data: this.__data,
      type: 'videoEmbed',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-video-embed')) {
          return null
        }
        return {
          conversion: convertVideoEmbedElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-video-embed', 'true')
    element.setAttribute('data-video-embed', JSON.stringify(this.__data))
    return { element }
  }

  getData(): VideoEmbedData {
    return this.getLatest().__data
  }

  setData(data: VideoEmbedData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  decorate(): React.ReactElement {
    const VideoEmbedComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.VideoEmbedComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading video...</div>}>
        <VideoEmbedComponent nodeKey={this.__key} data={this.__data} />
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
    return `[Video: ${this.__data.url}]`
  }
}

function convertVideoEmbedElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-video-embed')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      const node = $createVideoEmbedNode(data)
      return { node }
    } catch (e) {
      console.error('Failed to parse video embed data:', e)
    }
  }
  return null
}

export function $createVideoEmbedNode(data: VideoEmbedData): VideoEmbedNode {
  return new VideoEmbedNode(data)
}

export function $isVideoEmbedNode(node: LexicalNode | null | undefined): node is VideoEmbedNode {
  return node instanceof VideoEmbedNode
}
