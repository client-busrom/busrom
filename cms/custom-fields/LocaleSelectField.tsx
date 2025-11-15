/**
 * Locale Select Field with Dynamic Options
 *
 * A custom select field that automatically disables locale options
 * that already exist for the current ProductSeries or Product.
 *
 * This prevents creating duplicate translations for the same language.
 * Automatically detects whether the parent entity is a ProductSeries or Product.
 */

import React, { useState, useEffect } from 'react'
import { FieldProps, FieldController } from '@keystone-6/core/types'
import { FieldContainer, FieldLabel, Select } from '@keystone-ui/fields'

// Language options
const ALL_LOCALES = [
  { label: '🇬🇧 English', value: 'en' },
  { label: '🇨🇳 中文', value: 'zh' },
  { label: '🇪🇸 Español', value: 'es' },
  { label: '🇵🇹 Português', value: 'pt' },
  { label: '🇫🇷 Français', value: 'fr' },
  { label: '🇩🇪 Deutsch', value: 'de' },
  { label: '🇳🇱 Nederlands', value: 'nl' },
  { label: '🇩🇰 Dansk', value: 'da' },
  { label: '🇳🇴 Norsk', value: 'no' },
  { label: '🇸🇪 Svenska', value: 'sv' },
  { label: '🇫🇮 Suomi', value: 'fi' },
  { label: '🇮🇸 Íslenska', value: 'is' },
  { label: '🇨🇿 Čeština', value: 'cs' },
  { label: '🇭🇺 Magyar', value: 'hu' },
  { label: '🇵🇱 Polski', value: 'pl' },
  { label: '🇸🇰 Slovenčina', value: 'sk' },
  { label: '🇮🇹 Italiano', value: 'it' },
  { label: '🇸🇦 العربية', value: 'ar' },
  { label: '🇲🇦 Tamazight', value: 'ber' },
  { label: '🇮🇶 Kurdî', value: 'ku' },
  { label: '🇮🇷 فارسی', value: 'fa' },
  { label: '🇹🇷 Türkçe', value: 'tr' },
  { label: '🇮🇱 עברית', value: 'he' },
  { label: '🇦🇿 Azərbaycan', value: 'az' },
]

export const Field = ({ field, value, onChange, autoFocus, itemValue }: FieldProps<typeof controller>) => {
  const [existingLocales, setExistingLocales] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  console.log('[LocaleSelectField] value:', value)
  console.log('[LocaleSelectField] itemValue:', itemValue)

  // Auto-detect parent type and extract parent ID
  // Supports ProductSeries, Product, Blog, and Application
  const { parentType, parentId, parentField } = React.useMemo(() => {
    let type: 'productSeries' | 'product' | 'blog' | 'application' | null = null
    let id: string | null = null
    let field: string | null = null

    // Helper function to extract ID from a field value
    const extractIdFromFieldValue = (fieldValue: any, fieldName: string): string | null => {
      if (!fieldValue) return null

      console.log(`[LocaleSelectField] ${fieldName} field:`, fieldValue)
      console.log(`[LocaleSelectField] ${fieldName} value structure:`, fieldValue)

      // Log detailed structure for debugging
      if (fieldValue.currentIds) {
        console.log(`[LocaleSelectField] currentIds:`, fieldValue.currentIds)
      }
      if (fieldValue.initialIds) {
        console.log(`[LocaleSelectField] initialIds:`, fieldValue.initialIds)
      }

      // Check different possible structures - prioritize currentIds/initialIds
      if (typeof fieldValue === 'string') {
        // Direct ID string
        console.log(`[LocaleSelectField] Extracted from string:`, fieldValue)
        return fieldValue
      } else if (fieldValue.currentIds) {
        // Cards view structure - currentIds takes priority (user's current selection)
        // currentIds can be a Set or an object
        if (fieldValue.currentIds instanceof Set) {
          const idsArray = Array.from(fieldValue.currentIds)
          if (idsArray.length > 0) {
            const extractedId = String(idsArray[0])
            console.log(`[LocaleSelectField] Extracted from currentIds (Set):`, extractedId)
            return extractedId
          }
        } else if (typeof fieldValue.currentIds === 'object') {
          const ids = Object.keys(fieldValue.currentIds)
          if (ids.length > 0) {
            console.log(`[LocaleSelectField] Extracted from currentIds (Object):`, ids[0])
            return ids[0]
          }
        }
      } else if (fieldValue.initialIds) {
        // Cards view structure - initialIds (existing saved selection)
        // initialIds can be a Set or an object
        if (fieldValue.initialIds instanceof Set) {
          const idsArray = Array.from(fieldValue.initialIds)
          if (idsArray.length > 0) {
            const extractedId = String(idsArray[0])
            console.log(`[LocaleSelectField] Extracted from initialIds (Set):`, extractedId)
            return extractedId
          }
        } else if (typeof fieldValue.initialIds === 'object') {
          const ids = Object.keys(fieldValue.initialIds)
          if (ids.length > 0) {
            console.log(`[LocaleSelectField] Extracted from initialIds (Object):`, ids[0])
            return ids[0]
          }
        }
      } else if (fieldValue.data?.id) {
        // When viewing/editing existing record: { value: { id: 'translation-id', data: { id: 'parent-id' } } }
        console.log(`[LocaleSelectField] Extracted from data.id:`, fieldValue.data.id)
        return fieldValue.data.id
      } else if (fieldValue.value?.data?.id) {
        // Nested: { value: { value: { data: { id: 'parent-id' } } } }
        console.log(`[LocaleSelectField] Extracted from value.data.id:`, fieldValue.value.data.id)
        return fieldValue.value.data.id
      } else if (fieldValue.id && !fieldValue.data && !fieldValue.currentIds) {
        // Direct object with id (only if no data or currentIds property)
        console.log(`[LocaleSelectField] Extracted from id:`, fieldValue.id)
        return fieldValue.id
      }

      return null
    }

    // Check for productSeries field first
    const productSeriesField = (itemValue as any)?.productSeries
    if (productSeriesField) {
      const productSeriesValue = productSeriesField?.kind === 'value'
        ? productSeriesField.value
        : productSeriesField

      const extractedId = extractIdFromFieldValue(productSeriesValue, 'productSeries')
      if (extractedId) {
        type = 'productSeries'
        field = 'productSeries'
        id = extractedId
      }
    }

    // If not found, check for product field
    if (!id) {
      const productField = (itemValue as any)?.product
      if (productField) {
        const productValue = productField?.kind === 'value'
          ? productField.value
          : productField

        const extractedId = extractIdFromFieldValue(productValue, 'product')
        if (extractedId) {
          type = 'product'
          field = 'product'
          id = extractedId
        }
      }
    }

    // If not found, check for blog field
    if (!id) {
      const blogField = (itemValue as any)?.blog
      if (blogField) {
        const blogValue = blogField?.kind === 'value'
          ? blogField.value
          : blogField

        const extractedId = extractIdFromFieldValue(blogValue, 'blog')
        if (extractedId) {
          type = 'blog'
          field = 'blog'
          id = extractedId
        }
      }
    }

    // If not found, check for application field
    if (!id) {
      const applicationField = (itemValue as any)?.application
      if (applicationField) {
        const applicationValue = applicationField?.kind === 'value'
          ? applicationField.value
          : applicationField

        const extractedId = extractIdFromFieldValue(applicationValue, 'application')
        if (extractedId) {
          type = 'application'
          field = 'application'
          id = extractedId
        }
      }
    }

    // If still not found, try to get from URL
    if (!id && type) {
      if (type === 'productSeries') {
        // Try ProductSeries detail page URL: /product-series/[id]
        let urlMatch = window.location.pathname.match(/\/product-series\/([^/]+)/)
        if (urlMatch && urlMatch[1] !== 'create') {
          id = urlMatch[1]
          console.log('[LocaleSelectField] Extracted from URL (ProductSeries):', id)
        } else {
          // Try ProductSeriesContentTranslation detail page URL
          urlMatch = window.location.pathname.match(/\/product-series-content-translations\/([^/]+)/)
          if (urlMatch && urlMatch[1] !== 'create') {
            console.log('[LocaleSelectField] On ContentTranslation detail page, waiting for data...')
          }
        }
      } else if (type === 'product') {
        // Try Product detail page URL: /products/[id]
        let urlMatch = window.location.pathname.match(/\/products\/([^/]+)/)
        if (urlMatch && urlMatch[1] !== 'create') {
          id = urlMatch[1]
          console.log('[LocaleSelectField] Extracted from URL (Product):', id)
        } else {
          // Try ProductContentTranslation detail page URL
          urlMatch = window.location.pathname.match(/\/product-content-translations\/([^/]+)/)
          if (urlMatch && urlMatch[1] !== 'create') {
            console.log('[LocaleSelectField] On ContentTranslation detail page, waiting for data...')
          }
        }
      } else if (type === 'blog') {
        // Try Blog detail page URL: /blogs/[id]
        let urlMatch = window.location.pathname.match(/\/blogs\/([^/]+)/)
        if (urlMatch && urlMatch[1] !== 'create') {
          id = urlMatch[1]
          console.log('[LocaleSelectField] Extracted from URL (Blog):', id)
        } else {
          // Try BlogContentTranslation detail page URL
          urlMatch = window.location.pathname.match(/\/blog-content-translations\/([^/]+)/)
          if (urlMatch && urlMatch[1] !== 'create') {
            console.log('[LocaleSelectField] On ContentTranslation detail page, waiting for data...')
          }
        }
      } else if (type === 'application') {
        // Try Application detail page URL: /applications/[id]
        let urlMatch = window.location.pathname.match(/\/applications\/([^/]+)/)
        if (urlMatch && urlMatch[1] !== 'create') {
          id = urlMatch[1]
          console.log('[LocaleSelectField] Extracted from URL (Application):', id)
        } else {
          // Try ApplicationContentTranslation detail page URL
          urlMatch = window.location.pathname.match(/\/application-content-translations\/([^/]+)/)
          if (urlMatch && urlMatch[1] !== 'create') {
            console.log('[LocaleSelectField] On ContentTranslation detail page, waiting for data...')
          }
        }
      }
    }

    console.log('[LocaleSelectField] Final computed parent:', { type, id, field })
    return { parentType: type, parentId: id, parentField: field }
  }, [itemValue])

  console.log('[LocaleSelectField] Parent Type:', parentType)
  console.log('[LocaleSelectField] Parent ID:', parentId)
  console.log('[LocaleSelectField] Parent Field:', parentField)
  console.log('[LocaleSelectField] itemValue.productSeries:', (itemValue as any)?.productSeries)
  console.log('[LocaleSelectField] itemValue.product:', (itemValue as any)?.product)

  // Fetch existing locales for this parent entity
  useEffect(() => {
    if (parentId && parentType) {
      fetchExistingLocales()
    }
  }, [parentId, parentType])

  async function fetchExistingLocales() {
    if (!parentId || !parentType) return

    setIsLoading(true)
    try {
      // Build query based on parent type
      const queryConfig = {
        productSeries: {
          queryName: 'productSeriesContentTranslations',
          whereField: 'productSeries',
          variableName: 'productSeriesId',
        },
        product: {
          queryName: 'productContentTranslations',
          whereField: 'product',
          variableName: 'productId',
        },
        blog: {
          queryName: 'blogContentTranslations',
          whereField: 'blog',
          variableName: 'blogId',
        },
        application: {
          queryName: 'applicationContentTranslations',
          whereField: 'application',
          variableName: 'applicationId',
        },
      }

      const config = queryConfig[parentType]
      const { queryName, whereField, variableName } = config

      const query = `
        query GetExistingLocales($${variableName}: ID!) {
          ${queryName}(
            where: {
              ${whereField}: { id: { equals: $${variableName} } }
            }
          ) {
            locale
            id
          }
        }
      `

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { [variableName]: parentId },
        }),
      })

      const { data } = await response.json()

      // Get current item ID from URL based on parent type
      const urlPatterns = {
        productSeries: /\/product-series-content-translations\/([^/]+)/,
        product: /\/product-content-translations\/([^/]+)/,
        blog: /\/blog-content-translations\/([^/]+)/,
        application: /\/application-content-translations\/([^/]+)/,
      }
      const urlPattern = urlPatterns[parentType]
      const currentItemMatch = window.location.pathname.match(urlPattern)
      const currentItemId = currentItemMatch ? currentItemMatch[1] : null

      // Filter out current item's locale (so we can edit existing translations)
      const locales = data?.[queryName]
        ?.filter((t: any) => t.id !== currentItemId)
        ?.map((t: any) => t.locale) || []

      setExistingLocales(locales)
      console.log(`[LocaleSelectField] Existing locales for ${parentType}:`, locales)
    } catch (err) {
      console.error('Failed to fetch existing locales:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Build options with disabled state
  const options = ALL_LOCALES.map(locale => ({
    ...locale,
    isDisabled: existingLocales.includes(locale.value),
  }))

  // Count available options
  const availableCount = options.filter(opt => !opt.isDisabled).length

  // Get entity name for messages
  const entityNames = {
    product: 'Product',
    productSeries: 'Product Series',
    blog: 'Blog',
    application: 'Application',
  }
  const entityName = parentType ? entityNames[parentType] : 'Item'

  return (
    <FieldContainer>
      <FieldLabel>
        {field.label}
        {isLoading && <span style={{ marginLeft: '8px', color: '#64748b' }}>(Loading...)</span>}
      </FieldLabel>

      {availableCount === 0 && parentId && !isLoading && (
        <div style={{
          padding: '12px',
          background: '#fef3c7',
          border: '1px solid: #fbbf24',
          borderRadius: '4px',
          marginBottom: '8px',
          color: '#92400e',
          fontSize: '14px',
        }}>
          ⚠️ All languages have been translated for this {entityName}!
        </div>
      )}

      {!parentId && (
        <div style={{
          padding: '12px',
          background: '#fef9c3',
          border: '1px solid #fde047',
          borderRadius: '4px',
          marginBottom: '8px',
          color: '#713f12',
          fontSize: '14px',
        }}>
          ℹ️ Select {entityName} first to see which languages are already translated
        </div>
      )}

      <Select
        id={field.path}
        isClearable
        autoFocus={autoFocus}
        isDisabled={false}
        options={options}
        value={options.find(opt => opt.value === value) || null}
        onChange={(newValue: any) => {
          onChange?.(newValue?.value ?? null)
        }}
        placeholder="Select a language..."
      />

      <div style={{
        marginTop: '6px',
        fontSize: '13px',
        color: '#64748b',
      }}>
        {parentId && !isLoading && (
          <>
            {availableCount} of {ALL_LOCALES.length} languages available
            {existingLocales.length > 0 && (
              <span style={{ marginLeft: '8px' }}>
                (Existing: {existingLocales.join(', ').toUpperCase()})
              </span>
            )}
          </>
        )}
      </div>
    </FieldContainer>
  )
}

export const controller = (config: any): FieldController<string | null, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (data) => {
      const value = data[config.path]
      return value ?? null
    },
    serialize: (value) => {
      return { [config.path]: value ?? null }
    },
    validate: (value) => {
      if (config.fieldMeta?.isRequired && !value) {
        return false
      }
      return true
    },
  }
}
