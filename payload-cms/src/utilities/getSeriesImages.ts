/**
 * Utility to resolve SeriesIntroItems images
 *
 * Handles two modes:
 * 1. Manual: Return the manually selected images
 * 2. Auto: Query media by category/tags and randomly select 5
 */

import type { Payload } from 'payload'

interface ImageConfig {
  mode: 'manual' | 'auto'
  manualImages?: number[] // Array of media IDs
  categories?: number[]
  tags?: number[]
  metadataGroup?: string
  metadataSceneNumber?: string
  seriesNumber?: string
}

/**
 * Get images for a SeriesIntroItem based on its configuration
 */
export async function getSeriesImages(
  payload: Payload,
  config: ImageConfig
): Promise<any[]> {
  if (!config) {
    return []
  }

  // Manual mode: return selected images directly
  if (config.mode === 'manual') {
    if (!config.manualImages || config.manualImages.length === 0) {
      return []
    }

    try {
      const result = await payload.find({
        collection: 'media',
        where: {
          id: {
            in: config.manualImages,
          },
        },
        limit: 5,
      })

      return result.docs || []
    } catch (error) {
      console.error('Error fetching manual images:', error)
      return []
    }
  }

  // Auto mode: query by category/tags/metadata and randomly select 5
  if (config.mode === 'auto') {
    const hasFilters =
      (config.categories && config.categories.length > 0) ||
      (config.tags && config.tags.length > 0) ||
      config.metadataGroup ||
      config.metadataSceneNumber ||
      config.seriesNumber

    if (!hasFilters) {
      return []
    }

    try {
      const where: any = {}
      const andConditions: any[] = []

      // Category/Tag filters (OR logic)
      const orConditions: any[] = []

      if (config.categories && config.categories.length > 0) {
        orConditions.push({
          primaryCategory: {
            in: config.categories,
          },
        })
      }

      if (config.tags && config.tags.length > 0) {
        orConditions.push({
          tags: {
            in: config.tags,
          },
        })
      }

      if (orConditions.length > 0) {
        andConditions.push({
          or: orConditions,
        })
      }

      // Metadata filters (AND logic)
      if (config.metadataGroup) {
        andConditions.push({
          metadataGroup: {
            equals: parseInt(config.metadataGroup),
          },
        })
      }

      if (config.metadataSceneNumber) {
        andConditions.push({
          metadataSceneNumber: {
            equals: parseInt(config.metadataSceneNumber),
          },
        })
      }

      if (config.seriesNumber) {
        // Query for metadata specs with series key and matching value
        andConditions.push({
          'metadataSpecs.key': {
            equals: 'series',
          },
          'metadataSpecs.value': {
            equals: config.seriesNumber,
          },
        })
      }

      // Combine all conditions with AND logic
      if (andConditions.length > 1) {
        where.and = andConditions
      } else if (andConditions.length === 1) {
        Object.assign(where, andConditions[0])
      }

      // Fetch matching media (get more than 5 to enable randomization)
      const result = await payload.find({
        collection: 'media',
        where,
        limit: 50, // Fetch pool of images
        sort: '-createdAt',
      })

      const allImages = result.docs || []

      if (allImages.length === 0) {
        return []
      }

      // Randomly select 5 images
      const shuffled = allImages.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 5)
    } catch (error) {
      console.error('Error fetching auto images:', error)
      return []
    }
  }

  return []
}

/**
 * Hook to populate images field in SeriesIntroItems
 * Use in afterRead hook to transform JSON config into actual media docs
 */
export async function populateSeriesImages(
  doc: any,
  payload: Payload
): Promise<any> {
  if (!doc.images) {
    return doc
  }

  const images = await getSeriesImages(payload, doc.images)

  return {
    ...doc,
    resolvedImages: images, // Add resolved images as separate field
    images: doc.images, // Keep original config
  }
}
