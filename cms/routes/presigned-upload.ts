/**
 * Presigned URL Upload API
 *
 * Generates presigned URLs for direct S3 uploads with Transfer Acceleration support.
 * This allows clients to upload directly to S3, bypassing the CMS server for faster uploads.
 *
 * Features:
 * - S3 Transfer Acceleration for faster international uploads
 * - Presigned URLs with configurable expiration
 * - Support for multiple file uploads
 * - Environment-based configuration (no hardcoding)
 */

import { Request, Response } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

// Get S3 configuration from environment variables
const getS3Config = () => {
  const region = process.env.S3_REGION || 'us-east-1'
  const bucketName = process.env.S3_BUCKET_NAME || 'busrom-media'
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  const useAcceleration = process.env.S3_USE_ACCELERATION === 'true'
  const useMinio = process.env.USE_MINIO === 'true'
  const minioEndpoint = process.env.S3_ENDPOINT

  return {
    region,
    bucketName,
    accessKeyId,
    secretAccessKey,
    useAcceleration,
    useMinio,
    minioEndpoint,
  }
}

// Create S3 client with optional Transfer Acceleration
const createS3Client = () => {
  const config = getS3Config()

  const clientConfig: any = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
  }

  // MinIO configuration for local development
  if (config.useMinio && config.minioEndpoint) {
    clientConfig.endpoint = config.minioEndpoint
    clientConfig.forcePathStyle = true
  }
  // S3 Transfer Acceleration for production
  else if (config.useAcceleration) {
    clientConfig.useAccelerateEndpoint = true
  }

  return new S3Client(clientConfig)
}

interface PresignedUrlRequest {
  files: Array<{
    filename: string
    contentType: string
    size?: number
  }>
  expiresIn?: number // URL expiration in seconds (default: 3600 = 1 hour)
}

interface PresignedUrlResponse {
  urls: Array<{
    filename: string
    uploadUrl: string
    key: string
    cdnUrl: string
  }>
  accelerationEnabled: boolean
}

/**
 * Generate presigned URLs for S3 direct upload
 *
 * POST /api/presigned-upload
 * Body: { files: [{ filename, contentType, size? }], expiresIn? }
 *
 * Returns presigned URLs that clients can use to upload directly to S3
 */
export const presignedUploadHandler = async (req: Request, res: Response) => {
  try {
    // Check authentication
    const context = (req as any).context
    if (!context?.session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { files, expiresIn = 3600 }: PresignedUrlRequest = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files specified' })
    }

    if (files.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 files per request' })
    }

    const config = getS3Config()
    const s3Client = createS3Client()

    const urls = await Promise.all(
      files.map(async (file) => {
        // Generate unique key with timestamp and UUID
        const timestamp = Date.now()
        const uuid = uuidv4().slice(0, 8)
        const sanitizedFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
        const key = `uploads/${timestamp}-${uuid}-${sanitizedFilename}`

        // Create PutObject command
        const command = new PutObjectCommand({
          Bucket: config.bucketName,
          Key: key,
          ContentType: file.contentType,
          ...(file.size && { ContentLength: file.size }),
        })

        // Generate presigned URL
        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn,
        })

        // Generate CDN URL for accessing the file after upload
        let cdnUrl: string
        if (config.useMinio) {
          // MinIO local development
          const cdnDomain = process.env.CDN_DOMAIN || 'http://localhost:8080'
          cdnUrl = `${cdnDomain}/${config.bucketName}/${key}`
        } else {
          // CloudFront production
          const cdnDomain = process.env.CDN_DOMAIN
          if (cdnDomain && cdnDomain !== 'NONE') {
            const domain = cdnDomain.startsWith('http') ? cdnDomain : `https://${cdnDomain}`
            cdnUrl = `${domain}/${key}`
          } else {
            // Fallback to S3 URL
            cdnUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`
          }
        }

        return {
          filename: file.filename,
          uploadUrl,
          key,
          cdnUrl,
        }
      })
    )

    const response: PresignedUrlResponse = {
      urls,
      accelerationEnabled: config.useAcceleration && !config.useMinio,
    }

    res.json(response)
  } catch (error) {
    console.error('Presigned upload error:', error)
    res.status(500).json({
      error: 'Failed to generate presigned URLs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get S3 upload configuration (for client-side display)
 *
 * GET /api/upload-config
 *
 * Returns upload configuration without sensitive data
 */
export const uploadConfigHandler = async (req: Request, res: Response) => {
  const config = getS3Config()

  res.json({
    accelerationEnabled: config.useAcceleration && !config.useMinio,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFilesPerRequest: 20,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'],
  })
}
