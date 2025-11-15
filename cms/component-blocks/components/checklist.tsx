/**
 * Checklist Component Block
 *
 * Interactive checklist with completion status.
 * Based on Keystone official demo implementation.
 */

import React, { useEffect } from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const checklist = component({
  label: '☑️ Checkbox List',
  chromeless: true,
  schema: {
    children: fields.array(
      fields.object({
        done: fields.checkbox({ label: 'Done' }),
        content: fields.child({
          kind: 'inline',
          placeholder: '',
          formatting: 'inherit',
        }),
      })
    ),
  },
  preview: function CheckboxList(props) {
    const { fields } = props

    useEffect(() => {
      // Initialize with one empty item if the list is empty
      if (fields.children.elements.length === 0) {
        fields.children.onChange([
          {
            key: undefined,
          },
        ])
      }
    }, [])

    return (
      <ul
        style={{
          paddingLeft: 0,
          margin: '1em 0',
          listStyleType: 'none',
        }}
      >
        {fields.children.elements.map((element, i) => {
          return (
            <li
              key={element.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.5em',
                listStyleType: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={element.fields.done.value}
                onChange={(event) => {
                  element.fields.done.onChange(event.target.checked)
                }}
                style={{
                  marginRight: '0.75em',
                  marginTop: '0.25em',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: element.fields.done.value ? 'line-through' : 'none',
                  color: element.fields.done.value ? '#888' : 'inherit',
                }}
              >
                {element.fields.content.element}
              </span>
            </li>
          )
        })}
      </ul>
    )
  },
})
