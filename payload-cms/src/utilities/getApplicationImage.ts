/**
 * Utility to resolve ApplicationImagePicker field values
 *
 * Handles two modes:
 * 1. Manual: Return the manually selected image
 * 2. Application: Randomly pick one image from the selected application's scene gallery
 */

import type { Payload } from 'payload'

interface ImageConfig {
  mode: 'manual' | 'application'
  manualImage?: number | null
  applicationId?: string | number | null
}

/**
 * Get a single image based on the configuration
 */
export async function getApplicationImage(
  payload: Payload,
  config: ImageConfig
): Promise<any | null> {
  if (!config) {
    return null
  }

  // Manual mode: return selected image directly
  if (config.mode === 'manual') {
    if (!config.manualImage) {
      return null
    }

    try {
      const result = await payload.find({
        collection: 'media',
        where: {
          id: {
            equals: config.manualImage,
          },
        },
        limit: 1,
      })

      return result.docs?.[0] || null
    } catch (error) {
      console.error('Error fetching manual image:', error)
      return null
    }
  }

  // Application mode: randomly pick one image from scene gallery
  if (config.mode === 'application') {
    if (!config.applicationId) {
      return null
    }

    try {
      const app = await payload.findByID({
        collection: 'applications',
        id: config.applicationId,
        depth: 1,
      })

      if (!app || !app.sceneGallery || app.sceneGallery.length === 0) {
        return null
      }

      // Flatten all images from all scenes
      const allImages = (app.sceneGallery as any[]).flatMap((scene: any) => scene.images || [])

      if (allImages.length === 0) {
        return null
      }

      // De-duplicate if same image used in multiple scenes
      const uniqueImages = Array.from(new Map(allImages.map((img: any) => [img.id || img, img])).values())

      // Randomly pick one
      const randomIndex = Math.floor(Math.random() * uniqueImages.length)
      return uniqueImages[randomIndex]
    } catch (error) {
      console.error('Error fetching application image:', error)
      return null
    }
  }

  return null
}

/**
 * Hook to populate an image field in afterRead
 * Transforms JSON config into actual media doc
 */
export async function populateApplicationImage(
  doc: any,
  payload: Payload,
  fieldName: string
): Promise<any> {
  if (!doc[fieldName]) {
    return doc
  }

  const image = await getApplicationImage(payload, doc[fieldName])

  return {
    ...doc,
    [`${fieldName}Resolved`]: image,
  }
}
