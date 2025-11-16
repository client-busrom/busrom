/**
 * Document Renderer Component
 *
 * DEPRECATED: This component is not currently in use.
 * Use @/components/document/DocumentRenderer instead.
 *
 * TODO: Remove this file or install @keystone-6/document-renderer when React 19 compatibility is available
 * @keystone-6/document-renderer currently only supports React 16/17/18
 */

/* Temporarily disabled due to React 19 incompatibility
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
*/

// Placeholder export to prevent import errors
export function DocumentRenderer() {
  console.warn('DocumentRenderer: Keystone document renderer not available with React 19')
  return null
}
