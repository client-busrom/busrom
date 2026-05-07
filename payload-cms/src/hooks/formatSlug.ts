import type { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-')           // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')      // Remove all non-word characters except hyphens
    .toLowerCase()               // Convert to lowercase
    .replace(/-+/g, '-')          // Collapse multiple consecutive hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading and trailing hyphens

export const formatSlug =
  (fallback: string): FieldHook =>
  ({ operation, value, data, originalDoc }) => {
    const fallbackData = data?.[fallback] || originalDoc?.[fallback]
    
    if (fallbackData) {
      // Priority: 1. fallback.en (localized) 2. raw string
      let source: any = null;
      if (typeof fallbackData === 'object' && fallbackData !== null) {
        source = fallbackData.en || fallbackData.zh || Object.values(fallbackData).find(v => typeof v === 'string');
      } else if (typeof fallbackData === 'string') {
        source = fallbackData;
      }

      if (typeof source === 'string' && source.length > 0) {
        const formatted = format(source)
        if (formatted) {
          return formatted
        }
      }
    }

    // Fallback to existing value if no source found or formatted result is empty
    return value
  }
