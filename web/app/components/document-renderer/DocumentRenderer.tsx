/**
 * Document Renderer Component
 *
 * Wrapper component for @keystone-6/document-renderer with custom renderers.
 * Use this component to render document field content from Keystone CMS.
 */

import React from 'react'
import { DocumentRenderer as KeystoneDocumentRenderer } from '@keystone-6/document-renderer'
import type { DocumentRendererProps } from '@keystone-6/document-renderer'
import { componentBlockRenderers, blockRenderers } from './renderers'

interface CustomDocumentRendererProps {
  document: DocumentRendererProps['document']
  className?: string
}

export function DocumentRenderer({ document, className }: CustomDocumentRendererProps) {
  if (!document) return null

  return (
    <div className={className}>
      <KeystoneDocumentRenderer
        document={document}
        renderers={blockRenderers}
        componentBlocks={componentBlockRenderers}
      />
    </div>
  )
}
