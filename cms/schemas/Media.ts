/**
 * Media Model - AWS S3 Image Library
 *
 * This model manages all media files (images) stored in AWS S3.
 * Supports 24-language alt text for international SEO.
 *
 * Features:
 * - AWS S3 storage with CloudFront CDN
 * - Soft delete (status field)
 * - 24-language alt text support
 * - Media categorization
 */

import { list } from '@keystone-6/core'
import { text, json, select, image, relationship, timestamp, integer } from '@keystone-6/core/fields'
import { extractImageMetadata, generateImageVariants } from '../lib/image-optimizer'
import { publicReadAccess } from '../lib/permissions/access-control'

export const Media = list({
  fields: {
    /**
     * AWS S3 Image Field
     *
     * Images are stored in S3 bucket and served via CloudFront.
     * Storage configuration is in keystone.ts
     */
    file: image({
      label: 'File (文件)',
      storage: 's3_images',
      ui: {
        // Custom cell view for list display (batch uploaded images)
        views: './custom-views/media-file-cell',
        listView: {
          fieldMode: 'read',
        },
      },
    }),

    /**
     * Filename
     *
     * Indexed for fast searching
     */
    filename: text({
      label: 'Filename (文件名)',
      validation: { isRequired: true },
      isIndexed: true,
      ui: {
        description: 'Media file name | 媒体文件名',
      },
    }),

    /**
     * File URL (for direct S3 uploads)
     *
     * CDN URL for files uploaded via presigned URL (direct S3 upload).
     * Used when bypassing Keystone's built-in image field for faster uploads.
     */
    fileUrl: text({
      label: 'File URL (文件URL)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'CDN URL for directly uploaded files | 直接上传文件的CDN地址',
      },
    }),

    /**
     * File Key (S3 object key)
     *
     * S3 object key for files uploaded via presigned URL.
     * Used for file management and deletion.
     */
    fileKey: text({
      label: 'File Key (S3路径)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'S3 object key for directly uploaded files | 直接上传文件的S3路径',
      },
    }),

    /**
     * Status - Soft Delete Implementation
     *
     * ACTIVE: Visible in media library
     * ARCHIVED: Hidden but not deleted (for data integrity)
     */
    status: select({
      label: 'Status (状态)',
      options: [
        { label: 'Active (启用)', value: 'ACTIVE' },
        { label: 'Archived (归档)', value: 'ARCHIVED' },
      ],
      defaultValue: 'ACTIVE',
      ui: {
        displayMode: 'segmented-control',
        description: 'Media status | 媒体状态',
      },
    }),

    // ==================================================================
    // 🌐 Multi-language Alt Text (JSON format with custom editor)
    // ==================================================================
    altText: json({
      label: 'Alt Text (替代文本)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Image alt text in all 24 languages with auto-translation (Required for SEO) | 图片替代文本（支持24种语言自动翻译，SEO必需）',
      },
    }),

    /**
     * Primary Category (Flat Structure - Single Selection)
     *
     * 主分类（扁平结构 - 单选）
     *
     * Used to organize images with main classification
     * Example: Scene Photo, White Background, etc.
     */
    primaryCategory: relationship({
      label: 'Primary Category (主分类)',
      ref: 'MediaCategory',
      many: false,
      ui: {
        displayMode: 'select',
        labelField: 'displayName',
        description: 'Main classification | 选择主要分类',
      },
      graphql: {
        isNonNull: {
          read: false,
        },
      },
      db: {
        isNullable: true,
      },
    }),

    /**
     * Tags (Grouped by Type - Multiple Selection)
     *
     * 标签（按类型分组 - 多选）
     *
     * Used for multi-dimensional tagging with type grouping:
     * - Product Series (产品系列): Glass Standoff, Glass Hinge, etc.
     * - Function Type (功能类型): Scene Photo, White Background, etc.
     * - Scene Type (场景类型): Single Scene, Combination Scene, etc.
     * - Spec (规格): 50mm, 100mm, etc.
     * - Color (颜色): Black, Silver, Gold, etc.
     */
    tags: relationship({
      label: 'Tags (标签)',
      ref: 'MediaTag',
      many: true,
      ui: {
        views: './custom-fields/GroupedTagsField',
        description: 'Multi-dimensional tags grouped by type | 按类型分组选择标签（产品系列、功能类型、规格等）',
      },
    }),

    /**
     * Tags Filter (Helper field for filtering)
     *
     * This is a duplicate of the tags field but uses standard UI
     * to enable filtering in the list view. It's kept in sync with
     * the main tags field via hooks.
     */
    tagsFilter: relationship({
      label: 'Tags Filter (标签筛选)',
      ref: 'MediaTag',
      many: true,
      ui: {
        displayMode: 'select',
        labelField: 'slug',
        description: 'Use this field to filter media by tags | 用于按标签筛选媒体（此字段自动与Tags字段同步）',
        // Hide in item view since we edit via the main tags field
        itemView: {
          fieldMode: 'hidden',
        },
        createView: {
          fieldMode: 'hidden',
        },
        // Only show in list view for filtering
        listView: {
          fieldMode: 'read',
        },
      },
    }),

    /**
     * Metadata (Structured Form)
     *
     * 元数据（结构化表单）
     *
     * Store additional attributes like:
     * - sceneNumber: Scene number
     * - sceneType: Scene type (单独/组合/系列)
     * - seriesNumber: Series number
     * - specs: Specification list (e.g., ["50mm", "不锈钢"])
     * - colors: Color list (e.g., ["黑色", "银色"])
     * - notes: Additional notes
     */
    metadata: json({
      label: 'Metadata (元数据)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MediaMetadataField',
        description: 'Structured metadata for filtering | 图片元数据（场景编号、规格、颜色等）',
      },
    }),

    // ==================================================================
    // 🎨 Image Focal Point (Visual Editor)
    // ==================================================================

    /**
     * Crop Focal Point
     *
     * 裁剪焦点
     *
     * Defines the focal point for image cropping across different aspect ratios.
     * Used with CSS object-position to control which part of the image is visible when cropped.
     *
     * Structure: { x: 0-100, y: 0-100 }
     * - x: Horizontal position (0 = left, 50 = center, 100 = right)
     * - y: Vertical position (0 = top, 50 = center, 100 = bottom)
     */
    cropFocalPoint: json({
      label: 'Focal Point (焦点位置)',
      defaultValue: { x: 50, y: 50 },
      ui: {
        views: './custom-fields/FocalPointEditor',
        description: 'Visual editor for image focal point | 可视化焦点编辑器',
      },
    }),

    // ==================================================================
    // 🎨 Image Optimization Fields (Auto-generated)
    // ==================================================================

    /**
     * Image Width (Auto-extracted)
     */
    width: integer({
      label: 'Width (宽度)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Image width in pixels (auto-extracted) | 图片宽度（自动提取）',
      },
    }),

    /**
     * Image Height (Auto-extracted)
     */
    height: integer({
      label: 'Height (高度)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Image height in pixels (auto-extracted) | 图片高度（自动提取）',
      },
    }),

    /**
     * File Size (Auto-extracted)
     */
    fileSize: integer({
      label: 'File Size (文件大小)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'File size in bytes (auto-extracted) | 文件大小（字节，自动提取）',
      },
    }),

    /**
     * MIME Type (Auto-extracted)
     */
    mimeType: text({
      label: 'MIME Type (MIME类型)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Image MIME type (auto-extracted) | 图片MIME类型（自动提取）',
      },
    }),

    /**
     * Image Variants (Auto-generated)
     *
     * Stores URLs for optimized image variants:
     * - thumbnail: 150x150 (cover)
     * - small: 400px wide
     * - medium: 800px wide
     * - large: 1200px wide
     * - xlarge: 1920px wide
     * - webp: WebP format version
     */
    variants: json({
      label: 'Image Variants (图片变体)',
      defaultValue: {},
      ui: {
        views: './custom-views/variants-display',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Auto-generated optimized image variants (thumbnail, small, medium, large, xlarge, webp) | 自动生成的优化图片变体',
      },
    }),

    /**
     * Uploaded By
     *
     * Track which admin user uploaded this file
     */
    uploadedBy: relationship({
      label: 'Uploaded By (上传者)',
      ref: 'User',
      many: false,
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: 'Admin user who uploaded this file | 上传该文件的管理员',
      },
    }),

    /**
     * Timestamps
     */
    createdAt: timestamp({
      label: 'Created At (创建时间)',
      defaultValue: { kind: 'now' },
    }),

    updatedAt: timestamp({
      label: 'Updated At (更新时间)',
      db: { updatedAt: true },
    }),
  },

  /**
   * GraphQL Configuration
   *
   * Specify plural name to avoid conflict with singular form
   */
  graphql: {
    plural: 'MediaFiles',
  },

  /**
   * Access Control
   *
   * 🔒 Disable physical deletion to prevent data loss
   * Use soft delete (status: ARCHIVED) instead
   */
  access: publicReadAccess('Media'),

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      // Include 'variants' so it's available in GraphQL queries for the Cell view
      // Use tagsFilter instead of tags for filtering support in list view
      initialColumns: ['file', 'filename', 'status', 'primaryCategory', 'tagsFilter', 'variants', 'createdAt'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'filename',
    // Explicitly define searchable fields for better search experience
    searchFields: ['filename'],
  },

  /**
   * Hooks - Auto Image Optimization & Tags Sync
   *
   * After creating a media file:
   * 1. Extract metadata (width, height, fileSize, mimeType)
   * 2. Generate optimized variants (thumbnail, small, medium, large, xlarge, webp)
   * 3. Update the record with metadata and variant URLs
   * 4. Sync tags field with tagsFilter field
   */
  hooks: {
    // Sync tags to tagsFilter before write operations
    resolveInput: async ({ operation, resolvedData, item, context }) => {
      // If tags field is being updated, sync it to tagsFilter
      if (resolvedData.tags !== undefined) {
        console.log('[Media Hook] Syncing tags to tagsFilter:', resolvedData.tags)
        resolvedData.tagsFilter = resolvedData.tags
      }
      return resolvedData
    },

    afterOperation: async ({ operation, item, originalItem, context }) => {
      // Log all operations for debugging
      console.log(`[Media Hook] Triggered! operation=${operation}, hasItem=${!!item}`)

      if (!item) {
        console.log(`[Media Hook] No item provided, skipping`)
        return
      }

      console.log(`[Media Hook] Item ID: ${item.id}, filename: ${item.filename}`)

      // Only run on create operation
      if (operation === 'create') {
        // Need to refetch the item to get the file URL (Keystone quirk)
        const mediaItem = await context.db.Media.findOne({
          where: { id: item.id },
        })

        console.log(`[Media Hook] Refetched item:`, {
          id: mediaItem?.id,
          filename: mediaItem?.filename,
          hasFile: !!mediaItem?.file,
          fileId: mediaItem?.file_id,
        })

        if (!mediaItem?.file_id) {
          console.log(`[Media Hook] No file uploaded, skipping optimization`)
          return
        }

        // Construct the file URL
        // For CloudFront (production): https://cdn.domain/filename (no bucket name)
        // For MinIO (development): http://localhost:9000/bucket/filename
        let cdnDomain = process.env.CDN_DOMAIN || process.env.S3_ENDPOINT || 'http://localhost:9000'

        // Add https:// for CloudFront domains without protocol
        if (cdnDomain && !cdnDomain.startsWith('http') && cdnDomain.includes('cloudfront.net')) {
          cdnDomain = `https://${cdnDomain}`
        }

        // CloudFront doesn't need bucket name in URL
        const fileUrl = cdnDomain.includes('cloudfront.net')
          ? `${cdnDomain}/${mediaItem.file_id}.${mediaItem.file_extension}`
          : `${cdnDomain}/${process.env.S3_BUCKET_NAME || 'busrom-media'}/${mediaItem.file_id}.${mediaItem.file_extension}`

        console.log(`🔄 Processing image optimization for: ${mediaItem.filename}`)
        console.log(`📁 File URL: ${fileUrl}`)

        try {
          // Extract metadata
          const metadata = await extractImageMetadata(fileUrl)
          console.log(`📊 Metadata extracted:`, metadata)

          // Generate variants (skip if S3 is not configured properly)
          let variants = {}
          try {
            console.log(`🎨 Starting variant generation...`)
            variants = await generateImageVariants(fileUrl)
            console.log(`✨ Variants generated successfully:`, Object.keys(variants))
          } catch (variantError) {
            console.warn(`⚠️  Warning: Could not generate variants (S3 might not be fully configured):`, variantError)
            // Continue even if variant generation fails
          }

          // Update the media record with metadata and variants
          console.log(`💾 Updating media record...`)
          await context.db.Media.updateOne({
            where: { id: item.id },
            data: {
              width: metadata.width,
              height: metadata.height,
              fileSize: metadata.fileSize,
              mimeType: metadata.mimeType,
              variants: variants,
            },
          })

          console.log(`✅ Image optimization completed for: ${mediaItem.filename}`)
        } catch (error) {
          console.error(`❌ Error during image optimization:`, error)
          console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack')
          // Don't throw error to prevent blocking the upload
        }
      } else {
        console.log(`[Media Hook] Skipping - operation=${operation}`)
      }

      // ActivityLog: Log all operations (create/update/delete)
      if ((operation === 'create' || operation === 'update' || operation === 'delete') && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'Media', item, undefined, originalItem)
      }
    },
  },
})
