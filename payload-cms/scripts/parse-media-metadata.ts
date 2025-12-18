/**
 * Parse Media Metadata from Alt Text (Original Filename)
 *
 * Alt text format: {series}_{type}_{number}.jpg
 * Example: bathroom-door-handle_effect_001.jpg
 *
 * This script:
 * 1. Parses series name from alt text
 * 2. Maps to MediaTag (product series tag)
 * 3. Maps type to MediaCategory
 * 4. Extracts metadata (group, scene number, image number)
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

// Series name mapping (alt text format → MediaTag name)
const SERIES_MAPPING: Record<string, string> = {
  'glass-standoff': 'Glass Standoff',
  'glass-connected-fitting': 'Glass Connected Fitting',
  'glass-fence-spigot': 'Glass Fence Spigot',
  'guardrail-glass-clip': 'Guardrail Glass Clip',
  'bathroom-glass-clip': 'Bathroom Glass Clip',
  'glass-hinge': 'Glass Hinge',
  'sliding-door-kit': 'Sliding Door Kit',
  'bathroom-door-handle': 'Bathroom & Door Handle',
  'hidden-hook': 'Hidden Hook',
}

// Category mapping (type from filename → MediaCategory name)
const CATEGORY_MAPPING: Record<string, string> = {
  'white': 'white',
  'scene': 'scene',
  'real': 'real',
  'size': 'size',
  'general': 'general',
  'combo': 'combo',
  'multi-style': 'multi-style',
  'showcase': 'showcase',
  'effect': 'effect',
  'product': 'product',
  'craft': 'craft',
  'packaging': 'packaging',
  'color': 'color',
}

interface ParsedMetadata {
  seriesSlug: string
  seriesName: string
  categoryType: string
  imageNumber: number
  sceneGroup?: number
  sceneNumber?: number
  seriesNumber?: string  // Product series number (e.g., "BRS-001")
  colorFinish?: string   // Color/finish (e.g., "black", "gold", "ss-brushed")
  rawFilename: string
}

/**
 * Parse filename to extract metadata
 *
 * Formats:
 * 1. Simple: {series}_{type}_{number}.jpg
 *    Example: bathroom-door-handle_white_001.jpg
 *
 * 2. White with main subtype: {series}_white_main_{subtype}_{number}.jpg
 *    Example: bathroom-door-handle_white_main_bathroom_001.jpg
 *
 * 3. Scene with group: {series}_scene_{sceneType}_{group}_{view?}_{number}.jpg
 *    Example: bathroom-door-handle_scene_bathroom_g-01_close_004.jpg
 *
 * 4. Scene with letter: {series}_scene_{sceneType}_{letter}_{number}.jpg
 *    Example: bathroom-door-handle_scene_bathroom_n_002.jpg
 */
function parseFilename(altText: string): ParsedMetadata | null {
  if (!altText) return null

  // Remove file extension
  const nameWithoutExt = altText.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')

  // Split by underscore
  const parts = nameWithoutExt.split('_')

  if (parts.length < 3) {
    console.log(`⚠️  Cannot parse: ${altText} (too few parts)`)
    return null
  }

  const seriesSlug = parts[0]
  const categoryType = parts[1]

  // Handle common/general images (no product series)
  if (seriesSlug === 'common') {
    // Format: common_{type}_{number}.ext
    const imageNumber = parseInt(parts[parts.length - 1], 10)
    if (isNaN(imageNumber)) {
      console.log(`⚠️  Invalid number in: ${altText}`)
      return null
    }

    return {
      seriesSlug: 'common',
      seriesName: 'Common',
      categoryType: categoryType,
      imageNumber,
      rawFilename: altText,
    }
  }

  // Get series name
  const seriesName = SERIES_MAPPING[seriesSlug]
  if (!seriesName) {
    console.log(`⚠️  Unknown series: ${seriesSlug} in ${altText}`)
    return null
  }

  let imageNumber: number
  let sceneGroup: number | undefined
  let sceneNumber: number | undefined
  let seriesNumber: string | undefined
  let colorFinish: string | undefined

  // Check if it's a white image with series number (s-1, s-2, etc.)
  if (categoryType === 'white' && parts.length >= 4 && parts[2].match(/^s-\d+$/)) {
    // Format: {series}_white_s-10_{number}.jpg
    // or: {series}_white_s-10_{color}_{number}.jpg
    const sNum = parts[2].match(/^s-(\d+)$/)![1]
    seriesNumber = `BRS-${sNum.padStart(3, '0')}`  // s-1 -> BRS-001, s-10 -> BRS-010

    if (parts.length === 4) {
      // Simple: {series}_white_s-10_001.jpg
      imageNumber = parseInt(parts[3], 10)
    } else if (parts.length === 5) {
      // With color: {series}_white_s-10_black_001.jpg
      colorFinish = parts[3]
      imageNumber = parseInt(parts[4], 10)
    } else {
      // Multi-color: {series}_white_s-24_brass_chrome_001.jpg - skip specs, just get number
      imageNumber = parseInt(parts[parts.length - 1], 10)
      seriesNumber = undefined  // Don't store complex multi-color series
    }
  }
  // Check if it's a white_main image (has extra layer)
  else if (categoryType === 'white' && parts.length >= 4 && parts[2] === 'main') {
    // Format: {series}_white_main_{subtype}_{number}.jpg
    // parts[3] is subtype (bathroom, combo, cylinder, etc.)
    // parts[4] is number
    imageNumber = parseInt(parts[4], 10)
  }
  // Check if it's a white image with multi-level hierarchy
  else if (categoryType === 'white' && parts.length >= 4) {
    // Format: {series}_white_{shape}_{number}.jpg (e.g., glass-fence-spigot_white_round_001.jpg)
    // or: {series}_white_{shape}_{type}_{number}.jpg
    // or: {series}_white_{category}_{shape}_{type}_{number}.jpg (guardrail variants)
    imageNumber = parseInt(parts[parts.length - 1], 10)
  }
  // Check if it's a product type image
  else if (categoryType === 'product' && parts.length >= 4) {
    // Format: {series}_product_s-1_{number}.jpg (e.g., hidden-hook_product_s-1_001.jpg)
    if (parts[2].match(/^s-\d+$/)) {
      const sNum = parts[2].match(/^s-(\d+)$/)![1]
      seriesNumber = `BRS-${sNum.padStart(3, '0')}`
      imageNumber = parseInt(parts[3], 10)
    } else {
      imageNumber = parseInt(parts[parts.length - 1], 10)
    }
  }
  // Check if it's a scene image
  else if (categoryType === 'scene') {
    // Scene formats:
    // 1. {series}_scene_g-{group}_sn-{sceneNumber}_{imageNumber}.jpg
    // 2. {series}_scene_{sceneType}_g-{group}_{view?}_{number}.jpg
    // 3. {series}_scene_{sceneType}_{letter}_{number}.jpg

    if (parts.length >= 4) {
      // Check for g-X_sn-Y format
      const groupPart = parts[2] // e.g., "g-1"
      const sceneNumPart = parts[3] // e.g., "sn-1"

      const groupMatch = groupPart.match(/^g-(\d+)$/)
      const sceneNumMatch = sceneNumPart.match(/^sn-(\d+)$/)

      if (groupMatch && sceneNumMatch) {
        // Format: {series}_scene_g-1_sn-1_007.jpg
        sceneGroup = parseInt(groupMatch[1], 10)
        sceneNumber = parseInt(sceneNumMatch[1], 10)
        imageNumber = parseInt(parts[4], 10)
      } else if (parts.length >= 5) {
        // Old format: {series}_scene_{sceneType}_{group}_{view?}_{number}.jpg
        const groupPart2 = parts[3] // e.g., "g-01", "n", "bathroom"
        const groupMatch2 = groupPart2.match(/^g-(\d+)$/)

        if (groupMatch2) {
          sceneGroup = parseInt(groupMatch2[1], 10)
          imageNumber = parts.length >= 6
            ? parseInt(parts[parts.length - 1], 10)
            : parseInt(parts[4], 10)
        } else if (groupPart2.match(/^[a-z]$/)) {
          // Single letter (n, a, b, etc.)
          imageNumber = parseInt(parts[4], 10)
        } else {
          imageNumber = parseInt(parts[parts.length - 1], 10)
        }
      } else {
        // Fallback
        imageNumber = parseInt(parts[parts.length - 1], 10)
      }
    } else {
      // Fallback: last part is number
      imageNumber = parseInt(parts[parts.length - 1], 10)
    }
  } else {
    // Simple format: last part is number
    imageNumber = parseInt(parts[2], 10)
  }

  if (isNaN(imageNumber)) {
    console.log(`⚠️  Invalid number in: ${altText}`)
    return null
  }

  // Map category type
  const categoryName = CATEGORY_MAPPING[categoryType]
  if (!categoryName) {
    console.log(`⚠️  Unknown category: ${categoryType} in ${altText}`)
    return null
  }

  return {
    seriesSlug,
    seriesName,
    categoryType: categoryName,
    imageNumber,
    sceneGroup,
    sceneNumber,
    seriesNumber,
    colorFinish,
    rawFilename: altText,
  }
}

async function parseMediaMetadata() {
  console.log('🚀 Starting media metadata parsing...\n')

  const payload = await getPayload({ config })
  console.log('✅ Payload initialized\n')

  try {
    // Fetch all media tags and categories to build ID maps
    console.log('📦 Fetching MediaTags and MediaCategories...')

    const [tagsResult, categoriesResult] = await Promise.all([
      payload.find({ collection: 'media-tags', limit: 100 }),
      payload.find({ collection: 'media-categories', limit: 100 }),
    ])

    const tagNameToId = new Map<string, number>()
    tagsResult.docs.forEach((tag: any) => {
      tagNameToId.set(tag.name, tag.id)
    })

    const categoryNameToId = new Map<string, number>()
    categoriesResult.docs.forEach((cat: any) => {
      categoryNameToId.set(cat.name, cat.id)
    })

    console.log(`✅ Found ${tagsResult.docs.length} tags and ${categoriesResult.docs.length} categories\n`)

    // Fetch all active media
    console.log('📦 Fetching media files...')
    const mediaResult = await payload.find({
      collection: 'media',
      limit: 5000,
      where: {
        status: {
          equals: 'active',
        },
      },
    })

    console.log(`✅ Found ${mediaResult.docs.length} active media files\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Process each media file
    for (const media of mediaResult.docs) {
      try {
        // Get alt text (original filename)
        const altText = media.alt

        if (!altText) {
          console.log(`⊙ Skipping ID ${media.id}: No alt text`)
          skippedCount++
          continue
        }

        // Parse filename
        const parsed = parseFilename(altText)

        if (!parsed) {
          skippedCount++
          continue
        }

        // Handle common images (no product series tag)
        const isCommon = parsed.seriesSlug === 'common'

        // Get tag ID (skip for common images)
        let tagId: number | undefined
        if (!isCommon) {
          tagId = tagNameToId.get(parsed.seriesName)
          if (!tagId) {
            console.log(`⚠️  Tag not found for series: ${parsed.seriesName}`)
            skippedCount++
            continue
          }
        }

        // Get category ID
        const categoryId = categoryNameToId.get(parsed.categoryType)
        if (!categoryId) {
          console.log(`⚠️  Category not found: ${parsed.categoryType}`)
          skippedCount++
          continue
        }

        // Check if already has data
        const hasTag = isCommon || media.tags?.some((t: any) => t.id === tagId || t === tagId)
        const hasCategory = media.primaryCategory?.id === categoryId || media.primaryCategory === categoryId
        const hasImageNumber = media.metadata?.imageNumber !== null && media.metadata?.imageNumber !== undefined

        // Check if scene number should be added
        const needsSceneNumber = parsed.sceneNumber !== undefined &&
          (media.metadata?.sceneNumber === null || media.metadata?.sceneNumber === undefined)

        if (hasTag && hasCategory && hasImageNumber && !needsSceneNumber) {
          console.log(`⊙ Skipping ID ${media.id}: Already has complete data`)
          skippedCount++
          continue
        }

        // Update media
        const updateData: any = {}

        if (!hasTag && tagId) {
          updateData.tags = [tagId]
        }

        if (!hasCategory) {
          updateData.primaryCategory = categoryId
        }

        // Update metadata fields (nested under metadata group)
        if (!hasImageNumber || needsSceneNumber) {
          // Build metadata update object
          const metadataObj: any = {
            ...media.metadata // Preserve existing metadata
          }

          if (!hasImageNumber) {
            metadataObj.imageNumber = parsed.imageNumber
          }

          if (parsed.sceneGroup !== undefined) {
            metadataObj.group = parsed.sceneGroup
          }

          if (parsed.sceneNumber !== undefined) {
            metadataObj.sceneNumber = parsed.sceneNumber
          }

          updateData.metadata = metadataObj

          // Handle specs separately (child table)
          const specsToInsert: Array<{key: string, value: string}> = []

          if (parsed.seriesNumber) {
            specsToInsert.push({ key: 'series', value: parsed.seriesNumber })
          }

          if (parsed.colorFinish) {
            specsToInsert.push({ key: 'finish', value: parsed.colorFinish })
          }

          // We'll insert specs after the main update
          if (specsToInsert.length > 0) {
            updateData._specsToInsert = specsToInsert
          }
        }

        // Extract specs before update
        const specsToInsert = updateData._specsToInsert
        delete updateData._specsToInsert

        await payload.update({
          collection: 'media',
          id: media.id,
          data: updateData,
        })

        // Insert specs if needed
        if (specsToInsert && specsToInsert.length > 0) {
          for (const spec of specsToInsert) {
            // Check if spec already exists
            const existing = await payload.find({
              collection: 'media',
              where: {
                id: { equals: media.id }
              },
              depth: 2
            })

            const hasSpec = existing.docs[0]?.metadata?.specs?.some(
              (s: any) => s.key === spec.key && s.value === spec.value
            )

            if (!hasSpec) {
              // Payload will handle the insertion via the relationship
              await payload.update({
                collection: 'media',
                id: media.id,
                data: {
                  metadata: {
                    specs: [
                      ...(existing.docs[0]?.metadata?.specs || []),
                      spec
                    ]
                  }
                }
              })
            }
          }
        }

        console.log(`  ✓ Updated ID ${media.id}: ${parsed.rawFilename}`)
        console.log(`    - Series: ${parsed.seriesName} (Tag ID: ${tagId || 'N/A'})`)
        console.log(`    - Category: ${parsed.categoryType} (ID: ${categoryId})`)
        console.log(`    - Image Number: ${parsed.imageNumber}`)
        if (parsed.sceneGroup) {
          console.log(`    - Scene Group: ${parsed.sceneGroup}`)
        }
        if (parsed.sceneNumber) {
          console.log(`    - Scene Number: ${parsed.sceneNumber}`)
        }
        if (parsed.seriesNumber) {
          console.log(`    - Series Number: ${parsed.seriesNumber}`)
        }
        if (parsed.colorFinish) {
          console.log(`    - Finish: ${parsed.colorFinish}`)
        }

        updatedCount++
      } catch (error) {
        console.error(`❌ Error processing media ID ${media.id}:`, error)
        errorCount++
      }
    }

    console.log(`\n✅ Media metadata parsing completed!`)
    console.log('📊 Summary:')
    console.log(`   - ${updatedCount} media updated`)
    console.log(`   - ${skippedCount} media skipped (already complete or unparseable)`)
    console.log(`   - ${errorCount} errors`)

  } catch (error) {
    console.error('❌ Error parsing media metadata:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

parseMediaMetadata().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
