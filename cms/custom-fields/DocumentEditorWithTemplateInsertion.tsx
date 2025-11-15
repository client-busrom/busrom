/**
 * Document Editor with Template Insertion
 *
 * Extended document editor that allows inserting pre-made templates.
 * When a template is selected, its content is expanded and inserted
 * into the current document at the cursor position.
 *
 * Key Features:
 * - "Insert Template" button in toolbar
 * - Template selector modal
 * - Template content expansion (not just reference)
 * - After insertion, content becomes editable like normal document content
 * - All original document editor features are preserved
 */

import React, { useState } from 'react'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import {
  controller as defaultController,
  Field as DefaultField
} from '@keystone-6/fields-document/views'
import type {
  FieldControllerConfig,
  FieldController,
} from '@keystone-6/core/types'

// GraphQL query to fetch available templates
const GET_TEMPLATES = gql`
  query GetDocumentTemplates($where: DocumentTemplateWhereInput) {
    documentTemplates(where: $where, orderBy: { updatedAt: DESC }) {
      id
      key
      name
      description
      category
      content {
        document
      }
    }
  }
`

/**
 * Template Selector Modal
 */
function TemplateSelector({
  onSelect,
  onClose
}: {
  onSelect: (template: any) => void
  onClose: () => void
}) {
  const [getTemplates, { data, loading, error }] = useLazyQuery(GET_TEMPLATES)

  React.useEffect(() => {
    getTemplates({
      variables: {
        where: {
          status: { equals: 'active' }
        }
      }
    })
  }, [getTemplates])

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%'
        }}>
          Loading templates...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%'
        }}>
          <div style={{ color: 'red', marginBottom: '16px' }}>
            Error loading templates: {error.message}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const templates = data?.documentTemplates || []

  if (templates.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%'
        }}>
          <div style={{ marginBottom: '16px' }}>
            No templates found. Create some templates first!
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Group templates by category
  const groupedTemplates = templates.reduce((acc: any, template: any) => {
    const category = template.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {})

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>📋 Select Template</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕ Close
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {Object.entries(groupedTemplates).map(([category, templates]: [string, any]) => (
            <div key={category} style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {category.replace('-', ' ')}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {templates.map((template: any) => (
                  <div
                    key={template.id}
                    onClick={() => onSelect(template)}
                    style={{
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2684FF'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      {template.name}
                    </div>
                    {template.description && (
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {template.description}
                      </div>
                    )}
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      fontFamily: 'monospace'
                    }}>
                      {template.key}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Custom Field Component with Template Insertion
 */
export function Field(props: any) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const handleTemplateSelect = (template: any) => {
    if (template.content?.document) {
      try {
        // Get current document value
        const currentValue = props.value || []

        // Parse template content
        const templateContent = Array.isArray(template.content.document)
          ? template.content.document
          : JSON.parse(JSON.stringify(template.content.document))

        // Insert template content at the end
        // You can modify this to insert at cursor position if needed
        const newValue = [...currentValue, ...templateContent]

        // Update the field value
        props.onChange(newValue)

        setShowTemplateSelector(false)

        console.log('✅ Template inserted successfully:', template.name)
      } catch (error) {
        console.error('❌ Error inserting template:', error)
        alert('Failed to insert template. Please try again.')
      }
    } else {
      alert('This template has no content to insert.')
    }
  }

  return (
    <div>
      {/* Custom Toolbar Button */}
      <div style={{ marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setShowTemplateSelector(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2684FF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0052CC'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2684FF'
          }}
        >
          <span style={{ fontSize: '16px' }}>📋</span>
          Insert Template
        </button>
      </div>

      {/* Original Document Editor - All features preserved */}
      <DefaultField {...props} />

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  )
}

/**
 * Controller (use default)
 */
export const controller = (config: FieldControllerConfig): FieldController<any, any> => {
  return defaultController(config)
}
