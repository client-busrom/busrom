import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

/**
 * File Upload Rate Limiting
 * Track upload attempts per IP address
 */
interface RateLimitRecord {
  count: number
  resetAt: number
}

const uploadAttempts = new Map<string, RateLimitRecord>()

/**
 * Check rate limit for file uploads
 * @param ip - Client IP address
 * @param maxUploads - Maximum uploads allowed per window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limit exceeded
 */
const checkRateLimit = (ip: string, maxUploads: number = 10, windowMs: number = 3600000): boolean => {
  const now = Date.now()
  const record = uploadAttempts.get(ip)

  if (!record || now > record.resetAt) {
    uploadAttempts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxUploads) {
    return false
  }

  record.count++
  return true
}

/**
 * File Magic Numbers for Type Validation
 * Prevents file type spoofing by checking file headers
 */
const FILE_MAGIC_NUMBERS: Record<string, number[]> = {
  // Images
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/bmp': [0x42, 0x4D],

  // Documents
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF

  // Microsoft Office (older formats - OLE2)
  'application/msword': [0xD0, 0xCF, 0x11, 0xE0], // DOC
  'application/vnd.ms-excel': [0xD0, 0xCF, 0x11, 0xE0], // XLS

  // Microsoft Office (newer formats - ZIP-based)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04], // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4B, 0x03, 0x04], // XLSX

  // ZIP-based formats
  'application/zip': [0x50, 0x4B, 0x03, 0x04],
}

/**
 * Validate file type by checking magic numbers
 */
const validateFileType = (buffer: Uint8Array, acceptTypes: string[]): boolean => {
  for (const type of acceptTypes) {
    // Text files (txt, md) don't have magic numbers - allow them based on MIME type
    if (type === 'text/plain' || type === 'text/markdown') {
      return true
    }

    const magic = FILE_MAGIC_NUMBERS[type]
    if (magic && magic.every((byte, i) => buffer[i] === byte)) {
      return true
    }

    // Also support wildcard matching (e.g., image/*)
    if (type.includes('*')) {
      const baseType = type.split('/')[0]

      // For text/*, allow all text files
      if (baseType === 'text') {
        return true
      }

      const matchingTypes = Object.keys(FILE_MAGIC_NUMBERS).filter(t => t.startsWith(baseType))
      for (const matchType of matchingTypes) {
        const matchMagic = FILE_MAGIC_NUMBERS[matchType]
        if (matchMagic && matchMagic.every((byte, i) => buffer[i] === byte)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Map file extensions to MIME types
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  // Text files
  '.txt': 'text/plain',
  '.md': 'text/markdown',
}

/**
 * Parse accept types from field configuration
 * Converts file extensions (.pdf, .docx) to MIME types (application/pdf, etc.)
 */
const parseAcceptTypes = (accept: string | undefined): string[] => {
  if (!accept) return []

  const types = accept.split(',').map(t => t.trim()).filter(Boolean)
  const mimeTypes: string[] = []

  for (const type of types) {
    if (type.startsWith('.')) {
      // It's a file extension, convert to MIME type
      const mime = EXTENSION_TO_MIME[type.toLowerCase()]
      if (mime) {
        mimeTypes.push(mime)
      }
    } else {
      // It's already a MIME type or wildcard
      mimeTypes.push(type)
    }
  }

  return mimeTypes
}

/**
 * POST /api/form-file-upload
 *
 * Handles secure file uploads with multiple layers of validation:
 * - Rate limiting by IP
 * - File size validation
 * - File type validation (magic number check)
 * - Secure filename generation
 * - S3 upload with metadata
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get client IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    console.log(`📤 File upload request from IP: ${ip}`)

    // 2. Rate limiting check (10 files per hour by default)
    if (!checkRateLimit(ip, 10, 3600000)) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429 }
      )
    }

    // 3. Parse multipart/form-data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const formConfigId = formData.get('formConfigId') as string
    const fieldName = formData.get('fieldName') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!formConfigId || !fieldName) {
      return NextResponse.json({ error: 'Missing formConfigId or fieldName' }, { status: 400 })
    }

    console.log(`📎 Uploading file: ${file.name} (${file.size} bytes) for field: ${fieldName}`)

    // 4. Fetch form configuration to get file upload limits
    const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
    const formConfigResponse = await fetch(`${cmsUrl}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetFormConfig($id: ID!) {
            formConfig(where: { id: $id }) {
              id
              name
              fields
              maxTotalFileSize
              maxFilesPerSubmission
              maxFileUploadsPerDay
            }
          }
        `,
        variables: { id: formConfigId }
      })
    })

    if (!formConfigResponse.ok) {
      console.error('❌ Failed to fetch form config')
      return NextResponse.json({ error: 'Invalid form configuration' }, { status: 400 })
    }

    const formConfigData = await formConfigResponse.json()
    const formConfig = formConfigData.data?.formConfig

    if (!formConfig) {
      return NextResponse.json({ error: 'Form configuration not found' }, { status: 404 })
    }

    // 5. Get field configuration for the specific field
    // Fields are stored per language, use 'en' as base
    const fieldsData = formConfig.fields || {}
    const fields = fieldsData.en || []
    const fieldConfig = fields.find((f: any) => f.fieldName === fieldName)

    if (!fieldConfig || fieldConfig.fieldType !== 'file') {
      console.error(`❌ Invalid field configuration for field: ${fieldName}`)
      return NextResponse.json({ error: 'Invalid field configuration' }, { status: 400 })
    }

    // 6. Validate file size
    const maxSize = fieldConfig.validation?.maxSize || 5 // Default 5MB
    const maxSizeBytes = maxSize * 1024 * 1024

    if (file.size > maxSizeBytes) {
      console.warn(`⚠️ File too large: ${file.size} bytes (max: ${maxSizeBytes} bytes)`)
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize}MB` },
        { status: 400 }
      )
    }

    // 7. Validate file type using magic numbers
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    const acceptTypes = parseAcceptTypes(fieldConfig.validation?.accept)

    if (acceptTypes.length > 0) {
      const validType = validateFileType(uint8Array, acceptTypes)
      if (!validType) {
        console.warn(`⚠️ Invalid file type. Accepted: ${acceptTypes.join(', ')}`)
        return NextResponse.json(
          { error: `Invalid file type. Accepted types: ${fieldConfig.validation?.accept}` },
          { status: 400 }
        )
      }
    }

    // 8. Generate secure filename
    const fileHash = crypto
      .createHash('sha256')
      .update(uint8Array)
      .digest('hex')
      .slice(0, 16)

    const timestamp = Date.now()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'

    // Sanitize extension (only alphanumeric)
    const safeExt = ext.replace(/[^a-z0-9]/gi, '')

    const safeFileName = `form-attachments/${formConfigId}/${timestamp}-${fileHash}.${safeExt}`

    console.log(`💾 Uploading to S3: ${safeFileName}`)

    // 9. Upload to S3
    const s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      ...(process.env.USE_MINIO === 'true' && {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
        forcePathStyle: true,
      }),
    })

    // Encode original filename to Base64 for S3 metadata (supports Unicode/Chinese)
    const originalNameBase64 = Buffer.from(file.name, 'utf-8').toString('base64')

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'busrom-media',
      Key: safeFileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      Metadata: {
        // Store original filename as Base64 to support Unicode characters
        originalNameBase64: originalNameBase64,
        uploadedBy: ip,
        formConfigId: formConfigId,
        formName: formConfig.name || 'unknown',
        fieldName: fieldName,
        uploadTimestamp: timestamp.toString(),
      },
      // Set object tags for lifecycle management
      Tagging: 'Type=FormAttachment&AutoDelete=true',
    }))

    // 10. Generate file URL
    let fileUrl: string

    if (process.env.CDN_DOMAIN && process.env.CDN_DOMAIN !== 'NONE') {
      // Use CDN URL (CloudFront)
      fileUrl = `https://${process.env.CDN_DOMAIN}/${safeFileName}`
    } else if (process.env.USE_MINIO === 'true') {
      // Use MinIO URL (local development)
      const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
      const bucket = process.env.S3_BUCKET_NAME || 'busrom-media'
      fileUrl = `${endpoint}/${bucket}/${safeFileName}`
    } else {
      // Use S3 direct URL
      const bucket = process.env.S3_BUCKET_NAME || 'busrom-media'
      const region = process.env.S3_REGION || 'us-east-1'
      fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${safeFileName}`
    }

    console.log(`✅ File uploaded successfully: ${fileUrl}`)

    // 11. Record upload in TempFileUpload table (for orphan file cleanup)
    try {
      const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
      await fetch(`${cmsUrl}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateTempFileUpload(
              $fileUrl: String!
              $fileName: String!
              $fileSize: Int!
              $fileType: String
              $formConfigId: String
              $fieldName: String
              $ipAddress: String
            ) {
              createTempFileUpload(
                data: {
                  fileUrl: $fileUrl
                  fileName: $fileName
                  fileSize: $fileSize
                  fileType: $fileType
                  formConfigId: $formConfigId
                  fieldName: $fieldName
                  ipAddress: $ipAddress
                  status: PENDING
                }
              ) {
                id
              }
            }
          `,
          variables: {
            fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            formConfigId: formConfigId,
            fieldName: fieldName,
            ipAddress: ip,
          },
        }),
      })
      console.log(`📝 Temp file upload record created for: ${file.name}`)
    } catch (error) {
      console.error('⚠️ Failed to create temp file upload record:', error)
      // Don't fail the upload if recording fails
    }

    // 12. Return success response
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('💥 File upload error:', error)

    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
