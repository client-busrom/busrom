/**
 * Utility to resolve SeriesIntroItems images
 *
 * Handles two modes:
 * 1. Manual: Return the manually selected images
 * 2. Auto: Query media by category/tags and randomly select 5
 */

import type { Payload } from 'payload'

interface ImageConfig {
  mode: 'manual' | 'auto' | 'application'
  manualImages?: number[] // Array of media IDs
  applicationId?: string | number // Application ID
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

      // Category/Tag filters (AND logic - must match both if both specified)
      if (config.categories && config.categories.length > 0) {
        andConditions.push({
          primaryCategory: {
            in: config.categories,
          },
        })
      }

      if (config.tags && config.tags.length > 0) {
        andConditions.push({
          tags: {
            in: config.tags,
          },
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

      // Randomly shuffle all matches
      const shuffled = [...allImages].sort(() => Math.random() - 0.5)

      // Option B: Cycle images to ensure exactly 5
      const finalImages = []
      for (let i = 0; i < 5; i++) {
        finalImages.push(shuffled[i % shuffled.length])
      }

      return finalImages
    } catch (error) {
      console.error('Error fetching auto images:', error)
      return []
    }
  }

  // Application mode: randomly pick 5 images from the selected application's scene gallery
  if (config.mode === 'application') {
    if (!config.applicationId) {
      return []
    }

    try {
      const app = await payload.findByID({
        collection: 'applications',
        id: config.applicationId,
        depth: 1, // To get media docs for the images
      })

      if (!app || !app.sceneGallery || app.sceneGallery.length === 0) {
        return []
      }

      // Flatten all images from all scenes
      const allImages = (app.sceneGallery as any[]).flatMap((scene: any) => scene.images || [])
      
      if (allImages.length === 0) {
        return []
      }

      // De-duplicate if same image used in multiple scenes
      const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id || img, img])).values())

      // Option B: Cycle images to ensure exactly 5
      const shuffled = uniqueImages.sort(() => Math.random() - 0.5)
      const finalImages = []
      for (let i = 0; i < 5; i++) {
        finalImages.push(shuffled[i % shuffled.length])
      }
      return finalImages
    } catch (error) {
      console.error('Error fetching application images:', error)
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
