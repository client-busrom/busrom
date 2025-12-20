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
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { generateVariantsHook } from '../hooks/generateVariants'

// Variant folder mapping (Payload size name → S3 folder name)
const VARIANT_FOLDERS: Record<string, string> = {
  thumbnail: 'thumbnail',
  card: 'small',
  tablet: 'medium',
  desktop: 'large',
}

// Initialize S3 client for manual file deletion
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  region: process.env.S3_REGION || 'us-east-1',
  ...(process.env.USE_MINIO === 'true' && {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    forcePathStyle: true,
  }),
})

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
  upload: {
    // Image processing
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'desktop',
        width: 1920,
        height: undefined,
        position: 'centre',
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
      label: 'Filename | 文件名',
      admin: {
        description: 'Media file name | 媒体文件名',
      },
      index: true,
    },

    // ==================================================================
    // 🌐 Alt Text (Localized for SEO)
    // ==================================================================
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Alt Text',
        zh: '替代文本',
      },
      admin: {
        description: 'SEO-friendly alt text for images | 图片的SEO友好替代文本',
        components: {
          Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
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
      label: 'Primary Category | 主分类',
      admin: {
        description: 'Main category for this media | 此媒体的主分类',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'media-tags',
      hasMany: true,
      label: 'Tags | 标签',
      admin: {
        description: 'Tags for filtering and searching | 用于筛选和搜索的标签',
      },
    },

    // ==================================================================
    // 📊 Metadata
    // ==================================================================
    {
      name: 'metadata',
      type: 'group',
      label: 'Metadata | 元数据',
      fields: [
        {
          name: 'group',
          type: 'number',
          label: 'Scene Group | 场景分组',
          admin: {
            description: 'Scene group number for scene images | 场景图的分组编号',
          },
        },
        {
          name: 'sceneNumber',
          type: 'number',
          label: 'Scene Number | 场景编号',
        },
        {
          name: 'imageNumber',
          type: 'number',
          label: 'Image Number | 图片编号',
          admin: {
            description: 'Image sequence number within a series/scene group | 该系列/场景分组内的图片序号',
          },
        },
        {
          name: 'specs',
          type: 'array',
          label: 'Specifications | 规格信息',
          admin: {
            description: 'Product specifications for this image | 此图片的产品规格',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'key',
                  type: 'select',
                  label: 'Attribute | 属性',
                  required: true,
                  options: [
                    { label: 'Color | 颜色', value: 'color' },
                    { label: 'Material | 材质', value: 'material' },
                    { label: 'Size | 尺寸', value: 'size' },
                    { label: 'Finish | 表面处理', value: 'finish' },
                    { label: 'Model | 型号', value: 'model' },
                    { label: 'Series | 系列', value: 'series' },
                    { label: 'Style | 款式', value: 'style' },
                    { label: 'Other | 其他', value: 'other' },
                  ],
                  admin: {
                    width: '30%',
                  },
                },
                {
                  name: 'value',
                  type: 'text',
                  label: 'Value | 值',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'customKey',
                  type: 'text',
                  label: 'Custom Key | 自定义属性名',
                  admin: {
                    width: '20%',
                    condition: (data, siblingData) => siblingData?.key === 'other',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Notes | 备注',
        },
      ],
    },

    // ==================================================================
    // 🎯 Focal Point (for smart cropping)
    // ==================================================================
    {
      name: 'focalPointData',
      type: 'group',
      label: 'Focal Point | 焦点位置',
      admin: {
        description: 'Visual editor for image focal point | 可视化焦点编辑器',
        components: {
          Field: '@/components/fields/FocalPointField/Component#FocalPointFieldComponent',
        },
      },
      fields: [
        {
          name: 'x',
          type: 'number',
          label: 'X Position',
          min: 0,
          max: 100,
          defaultValue: 50,
          admin: {
            hidden: true,
          },
        },
        {
          name: 'y',
          type: 'number',
          label: 'Y Position',
          min: 0,
          max: 100,
          defaultValue: 50,
          admin: {
            hidden: true,
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
        { label: 'Active | 启用', value: 'active' },
        { label: 'Archived | 归档', value: 'archived' },
      ],
      label: 'Status | 状态',
      admin: {
        position: 'sidebar',
        description: 'Media status (archived = soft delete) | 媒体状态（归档=软删除）',
      },
    },

    // ==================================================================
    // 🔗 Usage Tracking
    // ==================================================================
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      label: 'Usage Count | 使用次数',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
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

          // Check ProductSeries
          const productSeriesRefs = await payload.find({
            collection: 'product-series',
            where: {
              or: [
                { featuredImage: { equals: id } },
                { coverImage: { equals: id } },
              ],
            },
            limit: 5,
          })
          if (productSeriesRefs.totalDocs > 0) {
            references.push(`Product Series (${productSeriesRefs.totalDocs})`)
          }

          // Check Products
          const productRefs = await payload.find({
            collection: 'products',
            where: {
              featuredImage: { equals: id },
            },
            limit: 5,
          })
          if (productRefs.totalDocs > 0) {
            references.push(`Products (${productRefs.totalDocs})`)
          }

          // Check Blogs
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

          // Check Pages
          const pageRefs = await payload.find({
            collection: 'pages',
            where: {
              featuredImage: { equals: id },
            },
            limit: 5,
          })
          if (pageRefs.totalDocs > 0) {
            references.push(`Pages (${pageRefs.totalDocs})`)
          }

          // Check SeriesIntroItems
          const seriesIntroRefs = await payload.find({
            collection: 'series-intro-items',
            where: {
              image: { equals: id },
            },
            limit: 5,
          })
          if (seriesIntroRefs.totalDocs > 0) {
            references.push(`Series Intro Items (${seriesIntroRefs.totalDocs})`)
          }

          // If there are references, show error with details
          if (references.length > 0) {
            throw new Error(
              `Cannot delete this media. It is referenced by: ${references.join(', ')}. ` +
              `Please remove these references first before deleting. | ` +
              `无法删除此媒体文件，它被以下内容引用：${references.join('、')}。请先移除这些引用后再删除。`
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
        throw new Error('Media archived. Super admins can permanently delete archived media. | 媒体已归档。超级管理员可以永久删除已归档的媒体。')
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
    afterChange: [generateVariantsHook],
  },
}
