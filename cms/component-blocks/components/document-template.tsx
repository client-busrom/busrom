/**
 * Document Template Component Block
 *
 * Allows selecting a pre-made template to insert into the document.
 * The template will be applied through a custom editor interface.
 */

import React from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const documentTemplate = component({
  label: '📋 Insert Template',
  schema: {
    template: fields.relationship({
      label: 'Select Template',
      listKey: 'DocumentTemplate',
      selection: 'id key name description category',
    })
  },
  preview: (props) => {
    const template = props.fields.template.value

    if (!template?.data) {
      return (
        <div style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          📋 Select a template to insert
        </div>
      )
    }

    return (
      <div style={{
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff3cd'
      }}>
        <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '8px', fontSize: '16px' }}>
          📋 {template.data.name}
        </div>
        {template.data.description && (
          <p style={{ fontSize: '14px', color: '#856404', margin: '8px 0' }}>
            {template.data.description}
          </p>
        )}
        <div style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
          Key: <code>{template.data.key}</code>
        </div>
        <div style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
          Category: {template.data.category}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#856404',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#ffe69c',
          borderRadius: '4px',
          fontStyle: 'italic'
        }}>
          💡 This template reference will be expanded when you apply it
        </div>
      </div>
    )
  }
})
