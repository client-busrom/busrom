/**
 * Media Collection
 *
 * AWS S3 Image Library
 * Migrated from Keystone Media schema
 *
 * Features:
 * - AWS S3 storage with CloudFront CDN
 * - Soft delete (status field)
 * - 24-language alt text support (via localization)
 * - Media categorization & tagging
 * - Image variants auto-generation
 */

import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Variant folder mapping (Payload size name → S3 folder name)
const VARIANT_FOLDERS: Record<string, string> = {
  thumbnail: 'thumbnail',
  card: 'small',
  tablet: 'medium',
  desktop: 'large',
}

// Initialize S3 client for manual file operations
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  region: process.env.S3_REGION || 'us-east-1',
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
  ...(process.env.USE_MINIO === 'true' && !process.env.S3_ENDPOINT && { endpoint: 'http://localhost:9000' }),
  ...(process.env.USE_MINIO === 'true' && { forcePathStyle: true }),
})

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'busrom-media'
const USE_MINIO = process.env.USE_MINIO === 'true'

// Note: regenerateImageSizes logic has been moved to Jobs Queue task
// See: src/jobs/regenerateImageSizes.ts

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      zh: '媒体',
    },
    plural: {
      en: 'Media',
      zh: '媒体',
    },
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'primaryCategory', 'status'],
    group: {
      en: 'Media Library',
      zh: '媒体库',
    },
  },
  access: {
    // Public read access for media files
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },

  // Media doesn't need version control - files are stored in S3
  // // versions: { maxPerDoc: 5 },

  upload: {
    // Automatically resize large images on upload
    // This prevents storing unnecessarily large original files
    resizeOptions: {
      width: 3000,
      height: 3000,
      fit: 'inside', // Maintain aspect ratio, fit within bounds
      withoutEnlargement: true, // Don't upscale small images
    },
    // Image processing with WebP conversion for better performance
    // WebP typically provides 25-35% smaller file sizes than JPEG/PNG
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        fit: 'inside',
        withoutEnlargement: true,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        fit: 'inside',
        withoutEnlargement: true,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
        withoutEnlargement: true, // Keep original size if smaller, but still generate webp
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'desktop',
        width: 1920,
        height: undefined,
        position: 'centre',
        withoutEnlargement: true, // Keep original size if smaller, but still generate webp
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
    ],
    adminThumbnail: ({ doc }: { doc: any }) => {
      // Use sizes.thumbnail.url if available, otherwise fall back to main url
      return doc?.sizes?.thumbnail?.url || doc?.url || null
    },
    mimeTypes: ['image/*'],
    // Focal point for smart cropping
    focalPoint: true,
  },
  fields: [
    // ==================================================================
    // 📝 Basic Information
    // ==================================================================
    {
      name: 'filename',
      type: 'text',
      required: true,
      label: {
        en: 'Filename',
        zh: '文件名',
      },
      admin: {
        description: {
          en: 'Media file name',
          zh: '媒体文件名',
        },
      },
      index: true,
    },

    // ==================================================================
    // 🌐 Alt Text (Localized for SEO)
    // ==================================================================
    {
      name: 'alt',
      type: 'textarea',
      required: true,
      localized: true,
      label: {
        en: 'Alt Text',
        zh: '替代文本',
      },
      admin: {
        description: {
          en: 'SEO-friendly alt text for images',
          zh: '图片的SEO友好替代文本',
        },
      },
    },
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },

    // ==================================================================
    // 🏷️ Categorization
    // ==================================================================
    {
      name: 'primaryCategory',
      type: 'relationship',
      relationTo: 'media-categories',
      label: {
        en: 'Primary Category',
        zh: '主分类',
      },
      admin: {
        description: {
          en: 'Main category for this media',
          zh: '此媒体的主分类',
        },
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'media-tags',
      hasMany: true,
      label: {
        en: 'Tags',
        zh: '标签',
      },
      index: true, // Enable querying by tags
      admin: {
        description: {
          en: 'Tags for filtering and searching',
          zh: '用于筛选和搜索的标签',
        },
      },
    },

    // ==================================================================
    // 📊 Specifications (顶层字段，支持批量编辑)
    // ==================================================================
    {
      name: 'specs',
      type: 'json',
      label: {
        en: 'Specifications',
        zh: '规格信息',
      },
      admin: {
        description: {
          en: 'Product specifications for this image (key-value pairs)',
          zh: '此图片的产品规格（键值对）',
        },
        components: {
          Field: '@/components/fields/SpecsField',
        },
      },
    },

    // ==================================================================
    // 📊 Metadata
    // ==================================================================
    {
      name: 'metadata',
      type: 'group',
      label: {
        en: 'Metadata',
        zh: '元数据',
      },
      fields: [
        {
          name: 'group',
          type: 'number',
          label: {
            en: 'Scene Group',
            zh: '场景分组',
          },
          admin: {
            description: {
              en: 'Scene group number for scene images',
              zh: '场景图的分组编号',
            },
          },
        },
        {
          name: 'sceneNumber',
          type: 'number',
          label: {
            en: 'Scene Number',
            zh: '场景编号',
          },
        },
        {
          name: 'imageNumber',
          type: 'number',
          label: {
            en: 'Image Number',
            zh: '图片编号',
          },
          admin: {
            description: {
              en: 'Image sequence number within a series/scene group',
              zh: '该系列/场景分组内的图片序号',
            },
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          label: {
            en: 'Notes',
            zh: '备注',
          },
        },
      ],
    },

    // ==================================================================
    // 📊 Status
    // ==================================================================
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: { en: 'Active', zh: '启用' }, value: 'active' },
        { label: { en: 'Archived', zh: '归档' }, value: 'archived' },
      ],
      label: { en: 'Status', zh: '状态' },
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        description: {
          en: 'Media status (archived = soft delete)',
          zh: '媒体状态（归档=软删除）',
        },
      },
    },

    // ==================================================================
    // 🔗 Usage Tracking
    // ==================================================================
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      label: {
        en: 'Usage Count',
        zh: '使用次数',
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        disableListColumn: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation, context }) => {
        // Skip if this is a create operation (no previous doc to compare)
        if (operation === 'create' || !previousDoc) return doc

        // Skip if this is a regeneration update (prevent infinite loop)
        if (context?.skipFocalPointRegeneration) return doc

        const { payload } = req

        // Check if focal point has changed
        const focalChanged =
          doc.focalX !== previousDoc.focalX || doc.focalY !== previousDoc.focalY

        if (!focalChanged) return doc

        payload.logger.info(`🎯 Focal point changed for ${doc.filename}, queuing regeneration job...`)
        payload.logger.info(`   Previous: (${previousDoc.focalX}, ${previousDoc.focalY}) → New: (${doc.focalX}, ${doc.focalY})`)

        // Queue a job to regenerate image sizes in background
        try {
          await payload.jobs.queue({
            task: 'regenerateImageSizes' as 'regenerateImageSizes',
            input: {
              mediaId: doc.id,
              filename: doc.filename,
              focalX: doc.focalX ?? 50,
              focalY: doc.focalY ?? 50,
            },
          } as any)
          payload.logger.info(`✅ Regeneration job queued for ${doc.filename}`)
        } catch (error) {
          payload.logger.error(`❌ Failed to queue regeneration job for ${doc.filename}: ${error instanceof Error ? error.message : String(error)}`)
        }

        return doc
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const { user, payload } = req

        // Fetch the media to check its status
        const media = await payload.findByID({
          collection: 'media',
          id,
        })

        // Check if user is super admin
        // roles can be an array of IDs (numbers) or populated objects with code
        const isSuperAdmin = user?.roles?.some((role: any) => {
          // If role is populated object
          if (typeof role === 'object' && role?.code === 'super_admin') return true
          // If role is just an ID, check against super_admin role ID (1)
          if (typeof role === 'number' && role === 1) return true
          // If role is string ID
          if (typeof role === 'string' && role === '1') return true
          return false
        }) || user?.isAdmin === true

        // If media is already archived and user is super admin, check for references before hard delete
        if (media.status === 'archived' && isSuperAdmin) {
          // Check if media is referenced by other collections
          const references: string[] = []

          // Check PreloaderConfig global (images array)
          try {
            const preloaderConfig = await payload.findGlobal({
              slug: 'preloader-config' as any,
              depth: 0,
            })
            const preloaderImages = (preloaderConfig as any)?.images || []
            const isInPreloader = preloaderImages.some((img: any) => {
              const imageId = typeof img?.image === 'object' ? img.image?.id : img?.image
              return imageId === id || imageId === Number(id)
            })
            if (isInPreloader) {
              references.push('Preloader Config')
            }
          } catch (e) {
            // Preloader config might not exist, ignore
          }

          // Check HeroBannerItems
          const heroBannerRefs = await payload.find({
            collection: 'hero-banner-items',
            where: {
              or: [
                { image1: { equals: id } },
                { image2: { equals: id } },
                { image3: { equals: id } },
                { image4: { equals: id } },
              ],
            },
            limit: 5,
          })
          if (heroBannerRefs.totalDocs > 0) {
            references.push(`Hero Banner Items (${heroBannerRefs.totalDocs})`)
          }

          // Check ProductSeries (featuredImage)
          const productSeriesRefs = await payload.find({
            collection: 'product-series',
            where: {
              featuredImage: { equals: id },
            },
            limit: 5,
          })
          if (productSeriesRefs.totalDocs > 0) {
            references.push(`Product Series (${productSeriesRefs.totalDocs})`)
          }

          // Check Products (mainImage, showImage)
          const productRefs = await payload.find({
            collection: 'products',
            where: {
              or: [
                { mainImage: { equals: id } },
                { showImage: { equals: id } },
              ],
            },
            limit: 5,
          })
          if (productRefs.totalDocs > 0) {
            references.push(`Products (${productRefs.totalDocs})`)
          }

          // Check Blogs (coverImage)
          const blogRefs = await payload.find({
            collection: 'blogs',
            where: {
              coverImage: { equals: id },
            },
            limit: 5,
          })
          if (blogRefs.totalDocs > 0) {
            references.push(`Blogs (${blogRefs.totalDocs})`)
          }

          // If there are references, show error with details
          if (references.length > 0) {
            throw new APIError(
              `无法删除此媒体文件，它被以下内容引用：${references.join('、')}。请先移除这些引用后再删除。`,
              400,
              undefined,
              true // isPublic - show message to user
            )
          }

          // Allow deletion - S3 files will be deleted by Payload's default behavior
          console.log(`🗑️ Super admin hard deleting archived media: ${media.filename}`)
          return // Continue with deletion
        }

        // Otherwise, soft delete (archive)
        await payload.update({
          collection: 'media',
          id,
          data: { status: 'archived' },
        })

        console.log(`📦 Media archived: ${media.filename}`)

        // Prevent actual deletion
        throw new APIError(
          '媒体已归档。超级管理员可以永久删除已归档的媒体。',
          400,
          undefined,
          true // isPublic - show message to user
        )
      },
    ],
    afterDelete: [
      async ({ req, doc }) => {
        // This hook runs after successful hard deletion
        // Payload automatically deletes the main S3 file, but we need to manually delete variants
        console.log(`✅ Media permanently deleted: ${doc.filename}`)

        const bucket = process.env.S3_BUCKET_NAME || 'busrom-media'
        const deletedFiles: string[] = []
        const failedFiles: string[] = []

        try {
          // Delete all variants from S3 (stored in variants/{folder}/ path)
          const filename = doc.filename
          if (filename) {
            for (const [sizeName, folder] of Object.entries(VARIANT_FOLDERS)) {
              const key = `variants/${folder}/${filename}`

              try {
                await s3Client.send(
                  new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                  })
                )
                deletedFiles.push(key)
                console.log(`  🗑️ Deleted variant: ${key}`)
              } catch (error) {
                failedFiles.push(key)
                console.error(`  ❌ Failed to delete variant ${key}:`, error)
              }
            }
          }

          if (deletedFiles.length > 0) {
            console.log(`✅ Successfully deleted ${deletedFiles.length} variant(s) from S3`)
          }

          if (failedFiles.length > 0) {
            console.warn(`⚠️ Failed to delete ${failedFiles.length} variant(s) from S3`)
          }
        } catch (error) {
          console.error('❌ Error deleting S3 variants:', error)
        }
      },
    ],
    // Payload 内置 imageSizes 已自动生成变体，无需自定义 hook
  },
}
