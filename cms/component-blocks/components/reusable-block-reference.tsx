/**
 * Reusable Block Reference Component Block
 *
 * Creates a reference to a reusable content block by key.
 * The appropriate language version will be loaded automatically based on the current locale.
 *
 * 使用方式：
 * 1. 在 Document 中插入此组件块
 * 2. 选择一个 ReusableBlock (通过 key)
 * 3. 前端会根据当前语言自动加载对应语言版本的内容
 */

import React from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const reusableBlockReference = component({
  label: '🔗 Reusable Block',
  schema: {
    block: fields.relationship({
      label: 'Select Reusable Block',
      listKey: 'ReusableBlock',
      selection: 'id key name category status',
    })
  },
  preview: (props) => {
    const block = props.fields.block.value

    if (!block?.data) {
      return (
        <div style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          🔗 Select a reusable block
        </div>
      )
    }

    return (
      <div style={{
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#e7f3ff'
      }}>
        <div style={{ fontWeight: 'bold', color: '#0056b3', marginBottom: '8px', fontSize: '16px' }}>
          🔗 {block.data.name}
        </div>
        <div style={{ fontSize: '14px', color: '#0056b3', marginBottom: '4px' }}>
          <strong>Key:</strong> <code>{block.data.key}</code>
        </div>
        <div style={{ fontSize: '14px', color: '#0056b3', marginBottom: '4px' }}>
          <strong>Category:</strong> {block.data.category}
        </div>
        <div style={{ fontSize: '14px', color: '#0056b3', marginBottom: '8px' }}>
          <strong>Status:</strong> {block.data.status}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#0056b3',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#cce5ff',
          borderRadius: '4px',
          fontStyle: 'italic'
        }}>
          ℹ️ The appropriate language version will be loaded automatically based on the current page locale.
          <br />
          Changes to the source block will reflect everywhere it's used.
        </div>
      </div>
    )
  },
  chromeless: false,
})
