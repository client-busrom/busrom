/**
 * Custom Image Loader for Next.js
 *
 * This loader is used to load images from MinIO/S3 without going through
 * Next.js's built-in image optimization service.
 *
 * In production, you can replace this with a CDN-based loader or
 * use a service like Cloudinary, imgix, or CloudFront.
 */

export default function imageLoader({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) {
  // For absolute URLs (like MinIO signed URLs), return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // For relative paths, you can add CDN logic here
  // Example: return `${CDN_DOMAIN}${src}?w=${width}&q=${quality || 75}`

  return src
}
