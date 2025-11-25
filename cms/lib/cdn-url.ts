/**
 * CDN URL utility functions for the CMS admin UI
 *
 * These functions help convert relative media paths to full CDN URLs
 * for displaying images in the Keystone admin interface.
 */

/**
 * Get CDN URL for a given path
 *
 * For production (cms.busromhouse.com): https://d2kqew3hn5wphn.cloudfront.net
 * For development (localhost): http://localhost:8080
 *
 * @param urlOrPath - A URL or relative path to convert
 * @returns Full CDN URL
 */
export function getCdnUrl(urlOrPath: string | null | undefined): string {
  if (!urlOrPath) return ''

  try {
    // If it's already a full URL, return as-is
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      return urlOrPath
    }

    // Detect environment based on window.location
    const isLocalhost = typeof window !== 'undefined' &&
                        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    const cdnDomain = isLocalhost
      ? 'http://localhost:8080'
      : 'https://d2kqew3hn5wphn.cloudfront.net'

    // Remove leading slash if present
    const cleanPath = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath

    // Build full CDN URL
    return `${cdnDomain}/${cleanPath}`
  } catch (error) {
    console.error('Error building CDN URL:', error)
    return urlOrPath || ''
  }
}

/**
 * Get a thumbnail URL from media data
 *
 * @param media - Media object with variants and/or file.url
 * @returns Full CDN URL for thumbnail
 */
export function getMediaThumbnailUrl(media: { variants?: { thumbnail?: string; small?: string }; file?: { url?: string } } | null | undefined): string {
  if (!media) return ''
  const url = media.variants?.thumbnail || media.variants?.small || media.file?.url
  return getCdnUrl(url)
}
