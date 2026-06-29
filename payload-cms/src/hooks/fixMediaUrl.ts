/**
 * Media URL Fix Hook
 *
 * afterRead hook that dynamically regenerates the correct S3/CDN URL for media documents.
 *
 * Why this exists:
 *   @payloadcms/storage-s3 stores the upload URL in the database at upload time.
 *   If the environment variables (CDN_DOMAIN, S3_BUCKET_NAME) were not set correctly
 *   at upload time, the stored URL will be wrong (e.g., default bucket name, no CDN).
 *
 *   This hook fixes the URL on every read without needing a database migration.
 *   Once the env vars are correctly configured in production, all media URLs
 *   will be served correctly regardless of what was stored at upload time.
 *
 * Fix logic (mirrors payload.config.ts generateFileURL):
 *   - MinIO (local):  http://localhost:9000/{bucket}/media/{filename}
 *   - With CDN:       https://{cdnDomain}/media/{filename}
 *   - S3 direct:      https://{bucket}.s3.{region}.amazonaws.com/media/{filename}
 */

const fixMediaUrlHook = (doc: any) => {
  if (!doc || !doc.filename) return doc

  const bucket = process.env.S3_BUCKET_NAME || 'busrom-media'
  const region = process.env.S3_REGION || 'us-east-1'
  const cdnDomain = process.env.CDN_DOMAIN
  const useMinio = process.env.USE_MINIO === 'true'

  /**
   * Generate the correct URL for a given filename (mirrors payload.config.ts generateFileURL)
   */
  const generateCorrectUrl = (filename: string): string => {
    if (useMinio) {
      const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
      return `${endpoint}/${bucket}/media/${filename}`
    }

    const baseUrl = cdnDomain && cdnDomain !== 'NONE'
      ? `https://${cdnDomain}`
      : `https://${bucket}.s3.${region}.amazonaws.com`

    return `${baseUrl}/media/${filename}`
  }

  // Fix main url
  if (doc.url) {
    const parsedFilename = doc.filename
    if (parsedFilename) {
      doc.url = generateCorrectUrl(parsedFilename)
    }
  }

  // Fix sizes urls
  if (doc.sizes && typeof doc.sizes === 'object') {
    const VARIANT_FOLDERS: Record<string, string> = {
      thumbnail: 'thumbnail',
      card: 'small',
      tablet: 'medium',
      desktop: 'large',
    }

    for (const [sizeName, sizeObj] of Object.entries(doc.sizes)) {
      if (sizeObj && typeof sizeObj === 'object' && 'filename' in sizeObj && sizeObj.filename) {
        ;(sizeObj as any).url = generateCorrectUrl((sizeObj as any).filename)
      } else if (sizeObj && typeof sizeObj === 'object' && 'url' in sizeObj && sizeObj.url && doc.filename) {
        // Some variants may not have separate filename; reconstruct from size name
        const folder = VARIANT_FOLDERS[sizeName]
        if (folder) {
          const variantFilename = `${folder}/${doc.filename}`
          ;(sizeObj as any).url = generateCorrectUrl(variantFilename)
        }
      }
    }
  }

  return doc
}

export default fixMediaUrlHook
