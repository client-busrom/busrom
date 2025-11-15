/**
 * Translated Locales Display
 *
 * Displays a list of translated locales in a nice badge format
 */

import React from 'react'

export const Field = ({ value }: any) => {
  console.log('[TranslatedLocalesDisplay Field] Received value:', value, 'type:', typeof value)

  // Value should be an array of strings from the controller's deserialize
  const locales: string[] = Array.isArray(value) ? value : []

  console.log('[TranslatedLocalesDisplay Field] Final locales array:', locales)

  if (locales.length === 0) {
    return (
      <div style={{ color: '#94a3b8', fontSize: '13px' }}>
        No translations yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {locales.map((locale, index) => {
        // Ensure we're rendering a string
        const localeStr = String(locale)
        console.log(`[TranslatedLocalesDisplay] Rendering badge ${index}: "${localeStr}"`)

        return (
          <span
            key={`${localeStr}-${index}`}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              background: '#10b981',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {localeStr}
          </span>
        )
      })}
      <span style={{ color: '#64748b', fontSize: '12px', alignSelf: 'center' }}>
        ({locales.length} {locales.length === 1 ? 'language' : 'languages'})
      </span>
    </div>
  )
}

/**
 * Cell Component - Display translated locales in list view
 */
export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  // Virtual field returns a JSON string
  let locales: string[] = []

  if (value && typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      locales = Array.isArray(parsed) ? parsed : []
    } catch {
      locales = []
    }
  }

  if (locales.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>无翻译</div>
  }

  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {locales.slice(0, 5).map((locale, index) => {
        const localeStr = String(locale)
        return (
          <span
            key={`${localeStr}-${index}`}
            style={{
              display: 'inline-block',
              padding: '2px 6px',
              background: '#10b981',
              color: 'white',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {localeStr}
          </span>
        )
      })}
      {locales.length > 5 && (
        <span style={{ color: '#64748b', fontSize: '11px', alignSelf: 'center' }}>
          +{locales.length - 5}
        </span>
      )}
    </div>
  )
}

export const controller = (config: any) => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path}`,
    defaultValue: [],
    deserialize: (data: any) => {
      const value = data[config.path]
      console.log('[TranslatedLocalesDisplay controller] deserialize RAW:', value, typeof value)

      // Virtual field now returns a JSON string
      if (!value) return []

      try {
        if (typeof value === 'string') {
          const parsed = JSON.parse(value)
          console.log('[TranslatedLocalesDisplay controller] Parsed JSON:', parsed)
          return Array.isArray(parsed) ? parsed : []
        }
      } catch (err) {
        console.error('[TranslatedLocalesDisplay controller] Failed to parse JSON:', err)
      }

      return []
    },
    serialize: () => ({}),
    validate: () => undefined,
  }
}
