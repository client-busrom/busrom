import type { CollectionConfig, Field } from 'payload'

const hasStatusField = (fields: Field[]): boolean => {
  for (const field of fields) {
    if ('name' in field && field.name === 'status') return true
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        if (hasStatusField(tab.fields)) return true
      }
    }
    if (field.type === 'row' || field.type === 'collapsible' || field.type === 'group' || field.type === 'array') {
      if ('fields' in field && hasStatusField(field.fields)) return true
    }
  }
  return false
}

export const withBulkUpdateProtection = (collections: CollectionConfig[]): CollectionConfig[] => {
  const excludedCollections = ['users', 'roles', 'permissions']
  
  return collections.map((collection) => {
    if (excludedCollections.includes(collection.slug)) {
      return collection
    }

    if (hasStatusField(collection.fields)) {
      const beforeListTable = collection.admin?.components?.beforeListTable || []
      return {
        ...collection,
        admin: {
          ...collection.admin,
          components: {
            ...collection.admin?.components,
            beforeListTable: [
              ...beforeListTable,
              '/src/components/SafeBulkStatus/index.tsx#SafeBulkStatus'
            ]
          }
        }
      }
    }

    return collection
  })
}
