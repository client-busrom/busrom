// @ts-nocheck
/**
 * Document Template Plugin - Client Side
 *
 * Provides a toolbar button to insert document templates into the editor.
 * Templates are fetched from the document-templates collection.
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'

export const INSERT_DOCUMENT_TEMPLATE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_DOCUMENT_TEMPLATE_COMMAND'
)

interface DocumentTemplate {
  id: string
  key: string
  name: string
  description?: string
  category: string | { id: string; name: string; slug: string }
  content?: any
  status: string
  usageCount?: number
}

export function DocumentTemplatePlugin(): null {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/document-templates?where[status][equals]=active&limit=100')
        if (res.ok) {
          const data = await res.json()
          setTemplates(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to load document templates:', error)
      }
    }

    loadTemplates()
  }, [])

  // Register command handler
  useEffect(() => {
    return editor.registerCommand(
      INSERT_DOCUMENT_TEMPLATE_COMMAND,
      (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (!template || !template.content) {
          console.error('Template not found or has no content:', templateId)
          return false
        }

        editor.update(() => {
          try {
            // Parse Lexical JSON content
            const templateContent = typeof template.content === 'string'
              ? JSON.parse(template.content)
              : template.content

            if (!templateContent || !templateContent.root) {
              console.error('Invalid template content structure:', templateContent)
              return
            }

            // Use Lexical's built-in method to parse editor state
            const templateEditorState = editor.parseEditorState(templateContent)

            // Get nodes from the template's root
            const templateNodes = templateEditorState.read(() => {
              const root = $getRoot()
              return root.getChildren()
            })

            // Clone and insert the nodes
            const nodesToInsert = templateNodes.map(node => {
              // Deep clone by export/import JSON
              const exportedNode = node.exportJSON()
              const NodeClass = node.constructor as any
              if (NodeClass.importJSON) {
                return NodeClass.importJSON(exportedNode)
              }
              // Fallback: use clone method
              return NodeClass.clone(node)
            })

            $insertNodes(nodesToInsert)

            // Track usage (fire and forget)
            fetch(`/api/document-templates/${templateId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usageCount: (template.usageCount || 0) + 1,
              }),
            }).catch(err => console.error('Failed to update usage count:', err))

          } catch (error) {
            console.error('Failed to insert template:', error)
          }
        })

        setIsModalOpen(false)
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor, templates])

  return null
}

export default DocumentTemplatePlugin
