/**
 * CTA Button Component Block
 *
 * Call-to-action button with customizable style, size, and link.
 */

import React from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const ctaButton = component({
  label: '🔘 CTA Button',
  schema: {
    text: fields.text({
      label: 'Button Text',
      defaultValue: 'Learn More'
    }),
    link: fields.url({
      label: 'Link URL',
    }),
    style: fields.select({
      label: 'Style',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
      ],
      defaultValue: 'primary',
    }),
    size: fields.select({
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      defaultValue: 'medium',
    }),
    openInNewTab: fields.checkbox({
      label: 'Open in new tab',
      defaultValue: false,
    }),
  },
  preview: (props) => {
    const styles = {
      primary: { backgroundColor: '#007bff', color: 'white', border: 'none' },
      secondary: { backgroundColor: '#6c757d', color: 'white', border: 'none' },
      outline: { backgroundColor: 'transparent', color: '#007bff', border: '2px solid #007bff' },
    }

    const sizes = {
      small: { padding: '8px 16px', fontSize: '14px' },
      medium: { padding: '12px 24px', fontSize: '16px' },
      large: { padding: '16px 32px', fontSize: '18px' },
    }

    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button
          style={{
            ...styles[props.fields.style.value],
            ...sizes[props.fields.size.value],
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {props.fields.text.value || 'Button Text'}
        </button>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Link: {props.fields.link.value || '(not set)'}
          {props.fields.openInNewTab.value && ' (opens in new tab)'}
        </p>
      </div>
    )
  },
  chromeless: false,
})
