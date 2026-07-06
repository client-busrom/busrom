/**
 * Media URL Fix Hook
 *
 * afterRead hook that dynamically regenerates the correct URL for media documents.
 *
 * Why:
 *   @payloadcms/storage-s3 stores upload URLs in the database at upload time.
 *   If environment variables change between upload and read, stored URLs become stale.
 *   This hook regenerates the correct URL on every read, based on current env vars.
 *
 * Environments:
 *   - Local dev (NODE_ENV !== 'production'): always MinIO localhost URLs
 *   - Production with CDN_DOMAIN:  https://{cdnDomain}/media/{filename}
 *   - Production without CDN:      https://{bucket}.s3.{region}.amazonaws.com/media/{filename}
 */

const fixMediaUrlHook = (doc: any) => {
  if (!doc || !doc.filename) return doc

  const bucket = process.env.S3_BUCKET_NAME || 'busrom-media'
  const region = process.env.S3_REGION || 'us-east-1'
  const cdnDomain = process.env.CDN_DOMAIN
  const isDev = process.env.NODE_ENV !== 'production'

  const genUrl = (filename: string): string => {
    const safeFilename = filename.includes(' ') ? filename.replace(/ /g, '%20') : filename
    if (isDev) {
      const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
      return `${endpoint}/${bucket}/media/${safeFilename}`
    }
    if (process.env.USE_MINIO === 'true') {
      const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
      return `${endpoint}/${bucket}/media/${safeFilename}`
    }
    const baseUrl =
      cdnDomain && cdnDomain !== 'NONE'
        ? `https://${cdnDomain}`
        : `https://${bucket}.s3.${region}.amazonaws.com`
    return `${baseUrl}/media/${safeFilename}`
  }

  const VARIANT_FOLDERS: Record<string, string> = {
    thumbnail: 'thumbnail',
    card: 'small',
    tablet: 'medium',
    desktop: 'large',
  }

  if (doc.url && doc.filename) {
    doc.url = genUrl(doc.filename)
  }

  if (doc.sizes && typeof doc.sizes === 'object') {
    for (const [sizeName, sizeObj] of Object.entries(doc.sizes)) {
      if (!sizeObj || typeof sizeObj !== 'object') continue
      const so = sizeObj as any
      if (so.filename) {
        so.url = genUrl(so.filename)
      } else if (so.url && doc.filename) {
        const folder = VARIANT_FOLDERS[sizeName]
        if (folder) so.url = genUrl(`${folder}/${doc.filename}`)
      }
    }
  }

  return doc
}

export default fixMediaUrlHook
