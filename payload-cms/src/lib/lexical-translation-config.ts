/**
 * Lexical Custom Features Translation Configuration
 *
 * Defines which fields are translatable for each custom feature type
 */

export interface FieldPath {
  path: string // e.g., "title", "links[].title", "slides[].description"
  isArray?: boolean // Whether this is an array field
}

export interface CustomFeatureTranslationConfig {
  type: string
  fields: FieldPath[]
}

/**
 * Translation configuration for all custom features
 */
export const LEXICAL_TRANSLATION_CONFIG: Record<string, FieldPath[]> = {
  // Hero Banner
  'hero': [
    { path: 'title' },
    { path: 'subtitle' },
    { path: 'ctaText' },
  ],

  // Notice/Alert Box
  'notice': [
    { path: 'title' },
    { path: 'content' },
  ],

  // CTA Button
  'ctaButton': [
    { path: 'text' },
  ],

  // Link Jump (Fast Link)
  'linkJump': [
    { path: 'title' },
    { path: 'description' },
  ],

  // Marquee Links
  'marqueeLinks': [
    { path: 'links', isArray: true },
  ],

  // Single Image
  'singleImage': [
    { path: 'caption' },
  ],

  // Image Gallery
  'custom-image-gallery': [
    { path: 'images', isArray: true },
  ],

  // Video Embed
  'videoEmbed': [
    { path: 'caption' },
  ],

  // Carousel
  'carousel': [
    { path: 'slides', isArray: true },
  ],

  // FormBlock and ReusableBlock are references, no translation needed
  // 'formBlock': [],
  // 'reusableBlock': [],
}

/**
 * Array field item translation configuration
 * Defines which fields to translate within array items
 */
export const ARRAY_ITEM_FIELDS: Record<string, string[]> = {
  'links': ['title'], // marqueeLinks
  'images': ['caption'], // image-gallery
  'slides': ['title', 'description', 'buttonText', 'caption'], // carousel
}

/**
 * Check if a custom feature type is translatable
 */
export function isTranslatableFeature(type: string): boolean {
  return type in LEXICAL_TRANSLATION_CONFIG
}

/**
 * Get translatable fields for a custom feature type
 */
export function getTranslatableFields(type: string): FieldPath[] {
  return LEXICAL_TRANSLATION_CONFIG[type] || []
}

/**
 * Extract all translatable text from a custom feature node
 */
export function extractTranslatableTexts(nodeType: string, nodeData: any): string[] {
  const fields = getTranslatableFields(nodeType)
  const texts: string[] = []

  for (const field of fields) {
    if (field.isArray) {
      // Handle array fields
      const arrayData = nodeData[field.path]
      if (Array.isArray(arrayData)) {
        const itemFields = ARRAY_ITEM_FIELDS[field.path] || []
        for (const item of arrayData) {
          for (const itemField of itemFields) {
            if (item[itemField] && typeof item[itemField] === 'string') {
              texts.push(item[itemField])
            }
          }
        }
      }
    } else {
      // Handle simple fields
      const value = nodeData[field.path]
      if (value && typeof value === 'string') {
        texts.push(value)
      }
    }
  }

  return texts
}

/**
 * Replace translatable texts in a custom feature node data
 */
export function replaceTranslatableTexts(
  nodeType: string,
  nodeData: any,
  translatedTexts: string[]
): any {
  const fields = getTranslatableFields(nodeType)
  const newData = JSON.parse(JSON.stringify(nodeData)) // Deep clone
  let textIndex = 0

  for (const field of fields) {
    if (field.isArray) {
      // Handle array fields
      const arrayData = newData[field.path]
      if (Array.isArray(arrayData)) {
        const itemFields = ARRAY_ITEM_FIELDS[field.path] || []
        for (const item of arrayData) {
          for (const itemField of itemFields) {
            if (item[itemField] && typeof item[itemField] === 'string') {
              if (textIndex < translatedTexts.length) {
                item[itemField] = translatedTexts[textIndex]
                textIndex++
              }
            }
          }
        }
      }
    } else {
      // Handle simple fields
      const value = newData[field.path]
      if (value && typeof value === 'string') {
        if (textIndex < translatedTexts.length) {
          newData[field.path] = translatedTexts[textIndex]
          textIndex++
        }
      }
    }
  }

  return newData
}
