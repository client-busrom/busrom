import type { CollectionConfig, Field, Tab } from 'payload'

/**
 * Recursively finds all fields that are localized, relationships, or uploads.
 * These are the fields that the Drizzle adapter commonly corrupts during bulk updates.
 */
const findVulnerableFields = (fields: Field[]): string[] => {
  let vulnerableFieldNames: string[] = []

  for (const field of fields) {
    // If the field is a grouping field without a name (like Row or Collapsible)
    if (field.type === 'row' || field.type === 'collapsible') {
      vulnerableFieldNames = [...vulnerableFieldNames, ...findVulnerableFields(field.fields)]
      continue
    }

    // If the field is a Tabs field
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        if ('name' in tab && tab.name) {
          // If the tab is named, it acts like a Group
          // We don't recurse inside, we just check if the tab itself is localized
          // Note: Tabs themselves aren't localized, their fields are. But we treat the named tab as a top-level data key.
        } else {
          // Unnamed tab, its fields are flattened at the current level
          vulnerableFieldNames = [...vulnerableFieldNames, ...findVulnerableFields(tab.fields)]
        }
      }
      continue
    }

    // For fields that have a name and store data at this level
    if ('name' in field && field.name) {
      const isVulnerable =
        ('localized' in field && field.localized === true) ||
        field.type === 'relationship' ||
        field.type === 'upload'

      if (isVulnerable) {
        vulnerableFieldNames.push(field.name)
      } else if (field.type === 'group' || field.type === 'array' || field.type === 'blocks') {
        // If a nested field structure itself isn't localized, it might contain localized subfields.
        // However, Admin UI bulk updates rarely target deeply nested arrays.
        // If it does contain localized fields, deleting the whole top-level group/array is the safest approach during bulk updates.
        // For simplicity and safety, if a group contains any localized fields, we can mark the top-level group as vulnerable.
        const subFieldsVulnerable = findVulnerableFields(
          field.type === 'blocks' ? [] : field.fields
        )
        if (subFieldsVulnerable.length > 0) {
          vulnerableFieldNames.push(field.name)
        }
      }
    }
  }

  return Array.from(new Set(vulnerableFieldNames))
}

/**
 * Wraps fields to bypass validation for required vulnerable fields during bulk updates.
 */
const wrapFieldsWithValidationBypass = (fields: Field[], vulnerableFieldNames: string[]): Field[] => {
  return fields.map((field) => {
    if (field.type === 'row' || field.type === 'collapsible') {
      return { ...field, fields: wrapFieldsWithValidationBypass(field.fields, vulnerableFieldNames) } as Field
    }

    if (field.type === 'tabs') {
      return {
        ...field,
        tabs: field.tabs.map((tab) => {
          if ('name' in tab && tab.name) {
            return tab; // Skip named tabs for simplicity, or wrap them if needed
          }
          return { ...tab, fields: wrapFieldsWithValidationBypass(tab.fields, vulnerableFieldNames) } as Tab
        }),
      } as Field
    }

    if ('name' in field && field.name && vulnerableFieldNames.includes(field.name)) {
      if ('required' in field && field.required) {
        const originalValidate = 'validate' in field ? field.validate : undefined
        return {
          ...field,
          validate: (val: any, options: any) => {
            const req = options?.req
            if (req?.url && (req.url.includes('where=') || req.url.includes('where%5B'))) {
              return true
            }
            if (!val && 'required' in field && field.required) return 'This field is required'
            if (originalValidate && typeof originalValidate === 'function') return originalValidate(val, options)
            return true
          },
        } as Field
      }
    }

    return field
  })
}

export const withBulkUpdateProtection = (collections: CollectionConfig[]): CollectionConfig[] => {
  return collections.map((collection) => {
    const vulnerableFieldNames = findVulnerableFields(collection.fields)

    if (vulnerableFieldNames.length === 0) {
      return collection
    }

    const modifiedFields = wrapFieldsWithValidationBypass(collection.fields, vulnerableFieldNames)

    return {
      ...collection,
      fields: modifiedFields,
      hooks: {
        ...collection.hooks,
        beforeChange: [
          ({ data, req }) => {
            const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing
            if (isTranslation) return data

            let isBulkUpdate = false
            if (req.url) {
              isBulkUpdate = req.url.includes('where=') || req.url.includes('where%5B')
            }
            if (!isBulkUpdate && req.searchParams) {
              isBulkUpdate = req.searchParams.has('where')
            }

            if (isBulkUpdate) {
              vulnerableFieldNames.forEach((fieldName) => {
                delete data[fieldName]
              })
            }
            return data
          },
          ...(collection.hooks?.beforeChange || []),
        ],
      },
    }
  })
}
