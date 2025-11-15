/**
 * CDN URL Helper
 *
 * Converts MinIO signed URLs to CDN URLs for better performance and caching.
 *
 * In development:
 * - MinIO: http://localhost:9000/busrom-media/filename.jpg?signature=...
 * - CDN:   http://localhost:8080/busrom-media/filename.jpg
 *
 * In production:
 * - S3:    https://s3.amazonaws.com/bucket/filename.jpg?signature=...
 * - CDN:   https://cdn.example.com/bucket/filename.jpg
 */

const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || 'http://localhost:8080'
const MINIO_ENDPOINT = 'http://localhost:9000'
const S3_PATTERN = /https?:\/\/[^\/]+\.amazonaws\.com/

/**
 * Convert a MinIO or S3 signed URL to a CDN URL
 *
 * @param url - The original signed URL from MinIO or S3
 * @returns The CDN URL without signature parameters
 */
export function convertToCDNUrl(url: string): string {
  if (!url) return url

  try {
    const urlObj = new URL(url)

    // Development: Convert MinIO URL to CDN URL
    if (url.startsWith(MINIO_ENDPOINT)) {
      // Extract the path (e.g., /busrom-media/filename.jpg)
      const path = urlObj.pathname
      return `${CDN_DOMAIN}${path}`
    }

    // Production: Convert S3 URL to CDN URL
    if (S3_PATTERN.test(url)) {
      const path = urlObj.pathname
      return `${CDN_DOMAIN}${path}`
    }

    // If not a MinIO or S3 URL, return as-is
    return url
  } catch (error) {
    console.error('Error converting URL to CDN:', error)
    return url
  }
}
