// @ts-nocheck
/**
 * Document Template Toolbar Button
 *
 * Provides a toolbar button to open template selector modal
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $insertNodes } from 'lexical'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '@payloadcms/ui'
import { FileText } from 'lucide-react'

interface DocumentTemplate {
  id: string
  key: string
  name: string
  description?: string
  category: string | { id: string; name: string; slug: string }
  status: string
  usageCount?: number
  content?: any
}

export const ToolbarButton: React.FC = () => {
  console.log('🔵 [DocumentTemplate ToolbarButton] Component loaded')

  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [categories, setCategories] = useState<{ id: string; name: string; label?: string; slug: string }[]>([])

  // Load templates and categories when modal opens
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [templatesRes, categoriesRes] = await Promise.all([
          fetch('/api/document-templates?where[status][equals]=active&limit=100&sort=-updatedAt&depth=1'),
          fetch('/api/template-categories?limit=100&sort=order'),
        ])

        if (templatesRes.ok) {
          const data = await templatesRes.json()
          setTemplates(data.docs || [])
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to load document templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isOpen])

  const handleInsertTemplate = async (template: DocumentTemplate) => {
    if (!template || !template.content) {
      console.error('❌ Template has no content')
      return
    }

    console.log('📄 Inserting template:', template.name)

    try {
      // Parse Lexical JSON content
      const templateContent = typeof template.content === 'string'
        ? JSON.parse(template.content)
        : template.content

      console.log('📋 Template content:', templateContent)

      if (!templateContent || !templateContent.root) {
        console.error('❌ Invalid template content structure')
        return
      }

      editor.update(() => {
        try {
          console.log('🔧 Starting editor update...')

          // Get current selection
          const selection = $getSelection()
          console.log('📍 Current selection:', selection)

          // Create nodes from template JSON
          const rootChildren = templateContent.root.children || []
          console.log('👶 Root children count:', rootChildren.length)
          console.log('👶 Root children:', rootChildren)

          const nodesToInsert: any[] = []

          // Recursively import nodes from JSON
          const importNode = (nodeJSON: any): any => {
            const nodeInfo = (editor as any)._nodes.get(nodeJSON.type)
            if (!nodeInfo) {
              console.warn(`⚠️ Node info not found for type: ${nodeJSON.type}`)
              return null
            }

            const NodeClass = nodeInfo.klass
            if (typeof NodeClass.importJSON !== 'function') {
              console.warn(`⚠️ No importJSON method for: ${nodeJSON.type}`)
              return null
            }

            try {
              // Import the node itself
              const node = NodeClass.importJSON(nodeJSON)
              console.log(`✅ Imported ${nodeJSON.type} node:`, node)

              // If this node has children, recursively import them
              if (nodeJSON.children && Array.isArray(nodeJSON.children)) {
                console.log(`  → Has ${nodeJSON.children.length} children`)
                nodeJSON.children.forEach((childJSON: any) => {
                  const childNode = importNode(childJSON)
                  if (childNode) {
                    node.append(childNode)
                  }
                })
              }

              return node
            } catch (err) {
              console.error(`❌ Failed to import node:`, nodeJSON.type, err)
              return null
            }
          }

          // Process all root children
          rootChildren.forEach((childJSON: any, index: number) => {
            console.log(`🔍 Processing node ${index}:`, childJSON.type)
            const node = importNode(childJSON)
            if (node) {
              nodesToInsert.push(node)
            }
          })

          console.log('📦 Nodes to insert:', nodesToInsert.length)

          // Insert nodes at current selection
          if (nodesToInsert.length > 0) {
            console.log('🚀 Inserting nodes...')
            $insertNodes(nodesToInsert)
            console.log('✅ Nodes inserted successfully!')
          } else {
            console.warn('⚠️ No nodes to insert')
          }

        } catch (error) {
          console.error('❌ Failed to insert nodes:', error)
        }
      })

      // Track usage
      fetch(`/api/document-templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usageCount: (template.usageCount || 0) + 1,
        }),
      }).catch(err => console.error('Failed to update usage count:', err))

    } catch (error) {
      console.error('Failed to insert template:', error)
    }

    setIsOpen(false)
  }

  const categoryOptions = [
    { value: 'all', label: i18n.language === 'zh' ? '全部' : 'All' },
    ...categories.map(cat => ({ value: cat.id, label: cat.label || cat.name })),
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => {
        const catId = typeof t.category === 'object' ? t.category?.id : t.category
        return catId === selectedCategory
      })

  console.log('[DocumentTemplateToolbarButton] Rendering button')

  return (
    <>
      <button
        type="button"
        onClick={() => {
          console.log('[DocumentTemplateToolbarButton] Button clicked')
          setIsOpen(!isOpen)
        }}
        className="toolbar-button"
        style={{
          padding: '6px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: isOpen ? '#f3f4f6' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#374151',
        }}
        title={i18n.language === 'zh' ? '插入文档模板' : 'Insert Document Template'}
      >
        <FileText size={16} />
        <span>{i18n.language === 'zh' ? '模板' : 'Template'}</span>
      </button>

      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999998,
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '80vh',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
              }}>
                {i18n.language === 'zh' ? '选择文档模板' : 'Select Document Template'}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {/* Category filter */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {categoryOptions.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat.value ? '#A08745' : '#d1d5db',
                    borderRadius: '4px',
                    backgroundColor: selectedCategory === cat.value ? '#fffbf0' : 'white',
                    color: selectedCategory === cat.value ? '#A08745' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template list */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 24px',
            }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  {i18n.language === 'zh' ? '加载中...' : 'Loading...'}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  {i18n.language === 'zh' ? '没有可用的模板' : 'No templates available'}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '12px',
                }}>
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleInsertTemplate(template)}
                      style={{
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#A08745'
                        e.currentTarget.style.backgroundColor = '#fffbf0'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.backgroundColor = 'white'
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '4px',
                      }}>
                        {template.name}
                      </div>
                      {template.description && (
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.4',
                        }}>
                          {template.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

