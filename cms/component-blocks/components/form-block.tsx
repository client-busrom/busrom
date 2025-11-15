/**
 * Form Block Component
 *
 * Creates a reference to a form configuration.
 * Simply select a FormConfig and it will be rendered on the frontend.
 *
 * 使用方式：
 * 1. 在 Document 中插入此组件块
 * 2. 选择一个 FormConfig
 * 3. 前端会自动渲染完整的表单，包括所有配置的字段
 */

import React from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const formBlock = component({
  label: '📋 Form Block',
  schema: {
    formConfig: fields.relationship({
      label: 'Select Form Configuration',
      listKey: 'FormConfig',
      selection: 'id name location fields',
    })
  },
  preview: (props) => {
    const formConfig = props.fields.formConfig.value

    if (!formConfig) {
      return (
        <div style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          📋 Select a form configuration
        </div>
      )
    }

    // Try to access data from different possible structures
    const configData = formConfig.data || formConfig
    const fieldsData = configData.fields || {}
    const fields = fieldsData.zh || fieldsData.en || []
    const sortedFields = [...fields].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    return (
      <div style={{
        border: '2px solid #28a745',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#e8f5e9'
      }}>
        <div style={{ fontWeight: 'bold', color: '#1b5e20', marginBottom: '8px', fontSize: '16px' }}>
          📋 {configData.name || formConfig.label || 'Form'}
        </div>
        <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '8px' }}>
          <strong>Location:</strong> {configData.location || 'N/A'}
        </div>

        {sortedFields.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1b5e20', marginBottom: '8px' }}>
              Form Fields ({sortedFields.length}):
            </div>
            {sortedFields.map((field: any, index: number) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #a5d6a7',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  fontSize: '12px'
                }}
              >
                <strong>{field.label}</strong>
                {field.required && <span style={{ color: '#d32f2f' }}> *</span>}
                <span style={{ color: '#666', marginLeft: '8px' }}>
                  ({field.fieldName} - {field.fieldType})
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{
          fontSize: '12px',
          color: '#1b5e20',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#c8e6c9',
          borderRadius: '4px',
          fontStyle: 'italic'
        }}>
          ℹ️ This form will be rendered on the frontend with all configured fields.
          <br />
          Changes to the FormConfig will reflect everywhere it's used.
        </div>
      </div>
    )
  },
  chromeless: false,
})
