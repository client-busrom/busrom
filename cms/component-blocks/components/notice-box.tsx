/**
 * Notice Box Component Block
 *
 * Info/success/warning/error notice boxes with editable content.
 * Features quick type switching via toolbar buttons.
 */

import React from 'react'
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks'
import { ToolbarButton, ToolbarGroup, ToolbarSeparator } from '@keystone-6/fields-document/primitives'
import { InfoIcon, AlertTriangleIcon, AlertCircleIcon, CheckCircleIcon, TrashIcon } from '@keystone-ui/icons'

export const notice = component({
  label: '💡 Notice',
  schema: {
    intent: fields.select({
      label: 'Type',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'info',
    }),
    content: fields.child({
      kind: 'block',
      placeholder: 'Notice content...',
      formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
      links: 'inherit',
    }),
  },
  toolbar({ props, onRemove }) {
    const iconComponents = {
      info: InfoIcon,
      success: CheckCircleIcon,
      warning: AlertTriangleIcon,
      error: AlertCircleIcon,
    }

    return (
      <ToolbarGroup>
        {props.fields.intent.options.map((opt) => {
          const IconComponent = iconComponents[opt.value as keyof typeof iconComponents]
          return (
            <ToolbarButton
              key={opt.value}
              isSelected={props.fields.intent.value === opt.value}
              onClick={() => {
                props.fields.intent.onChange(opt.value)
              }}
            >
              <IconComponent size="small" />
            </ToolbarButton>
          )
        })}
        <ToolbarSeparator />
        <ToolbarButton
          onClick={onRemove}
          variant="destructive"
        >
          <TrashIcon size="small" />
        </ToolbarButton>
      </ToolbarGroup>
    )
  },
  preview: (props) => {
    const configs = {
      info: {
        bg: '#d1ecf1',
        border: '#bee5eb',
        color: '#0c5460',
        Icon: InfoIcon
      },
      success: {
        bg: '#d4edda',
        border: '#c3e6cb',
        color: '#155724',
        Icon: CheckCircleIcon
      },
      warning: {
        bg: '#fff3cd',
        border: '#ffeaa7',
        color: '#856404',
        Icon: AlertTriangleIcon
      },
      error: {
        bg: '#f8d7da',
        border: '#f5c6cb',
        color: '#721c24',
        Icon: AlertCircleIcon
      },
    }

    const config = configs[props.fields.intent.value as keyof typeof configs]
    const IconComponent = config.Icon

    return (
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: config.bg,
          border: `2px solid ${config.border}`,
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <NotEditable>
          <div style={{ flexShrink: 0, color: config.color, paddingTop: '2px' }}>
            <IconComponent size="medium" />
          </div>
        </NotEditable>
        <div style={{ flex: 1 }}>
          {props.fields.content.element}
        </div>
      </div>
    )
  },
  chromeless: false,
})
