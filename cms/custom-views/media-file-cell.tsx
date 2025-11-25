/**
 * Custom Cell View for Media File Field
 *
 * Displays the image preview by constructing the URL from file_id and file_extension
 * Supports both Cell (list view) and Field (item view)
 *
 * Note: This view only customizes Cell display in list view.
 * The Field (item view) uses Keystone's default image field for upload functionality.
 */

import React from 'react'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

// Re-export the controller from Keystone's image field to enable upload functionality
export { controller } from '@keystone-6/core/fields/types/image/views'

// Import Keystone's default Field component
import { Field as KeystoneImageField } from '@keystone-6/core/fields/types/image/views'

/**
 * Custom Field wrapper that logs props data for debugging
 * This helps us understand what data is available in the Field view
 */
export const Field = (props: any) => {
  // Log all props to console for debugging on AWS production
  React.useEffect(() => {
    console.log('=== [MediaFileField] Field Props Debug ===')
    console.log('[MediaFileField] Full props:', props)
    console.log('[MediaFileField] props.value:', props.value)
    console.log('[MediaFileField] props.itemValue:', props.itemValue)
    console.log('[MediaFileField] props.field:', props.field)
    console.log('[MediaFileField] props.forceValidation:', props.forceValidation)
    console.log('[MediaFileField] All prop keys:', Object.keys(props))

    // Try to get item ID from URL
    if (typeof window !== 'undefined') {
      const urlMatch = window.location.pathname.match(/\/media\/([^/]+)/)
      console.log('[MediaFileField] URL pathname:', window.location.pathname)
      console.log('[MediaFileField] Item ID from URL:', urlMatch ? urlMatch[1] : 'not found')
    }
    console.log('=== [MediaFileField] End Debug ===')
  }, [props])

  // Use Keystone's default Field component
  return <KeystoneImageField {...props} />
}

/**
 * Convert a relative path or signed URL to a CDN URL
 * This follows the same logic as web/lib/cdn-url.ts and variants-display.tsx
 *
 * @param urlOrPath - Can be a relative path (variants/thumbnail/xxx.jpg) or full URL
 * @returns The CDN URL
 */
function buildFullUrl(urlOrPath: string): string {
  if (!urlOrPath) return urlOrPath

  try {
    // If already a full URL (starts with http:// or https://)
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      const urlObj = new URL(urlOrPath)

      // Check if it's a MinIO or S3 signed URL - extract just the pathname
      const isMinIO = urlOrPath.includes('localhost:9000')
      const isS3 = /https?:\/\/[^\/]+\.amazonaws\.com/.test(urlOrPath)

      if (isMinIO || isS3) {
        // Strip query parameters (signatures) and use pathname only
        urlOrPath = urlObj.pathname
        // Remove leading slash for consistency
        if (urlOrPath.startsWith('/')) {
          urlOrPath = urlOrPath.slice(1)
        }
      } else {
        // Already a clean URL (maybe from CDN), return as-is
        return urlOrPath
      }
    }

    // Get CDN domain based on current environment
    // This runs in the browser, so we detect based on window.location
    // For production (cms.busromhouse.com): https://d2kqew3hn5wphn.cloudfront.net
    // For development (localhost:3000): http://localhost:8080
    //
    // TODO: After configuring DNS (cdn.busromhouse.com → d2kqew3hn5wphn.cloudfront.net),
    //       update this to use: 'https://cdn.busromhouse.com'
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
    return urlOrPath
  }
}

// Cell view for list view
export const Cell = ({ item, field }: any) => {
  // Query for variants if file is null (batch uploaded images)
  const { data } = useQuery(
    gql`
      query GetMediaVariants($id: ID!) {
        media(where: { id: $id }) {
          variants
        }
      }
    `,
    {
      variables: { id: item.id },
      skip: !!item.file, // Skip query if we already have file data
    }
  )

  // The item in Cell view contains the file field data
  const fileData = item.file

  // Check if we have Keystone file data
  if (fileData && fileData.url) {
    return (
      <div style={{ padding: '4px 0' }}>
        <img
          src={fileData.url}
          alt={item.filename || 'Media file'}
          style={{
            maxWidth: '100px',
            maxHeight: '100px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
          }}
        />
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          {item.filename}
        </div>
      </div>
    )
  }

  // For batch uploaded images: use variants from GraphQL query
  const variants = data?.media?.variants
  if (variants && typeof variants === 'object') {
    const imageUrl = variants.thumbnail || variants.small || variants.medium

    if (imageUrl) {
      // Build full CDN URL from relative path
      const fullUrl = buildFullUrl(imageUrl)

      return (
        <div style={{ padding: '4px 0' }}>
          <img
            src={fullUrl}
            alt={item.filename || 'Media file'}
            style={{
              maxWidth: '100px',
              maxHeight: '100px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
            }}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {item.filename}
          </div>
        </div>
      )
    }
  }

  return <div style={{ color: '#999', fontSize: '13px' }}>Loading...</div>
}

// CardValue view for cards
export const CardValue = ({ item, field }: any) => {
  // Try to use variants first (for batch uploaded images)
  if (item.variants && typeof item.variants === 'object') {
    const imageUrl = item.variants.thumbnail || item.variants.small || item.variants.medium
    if (imageUrl) {
      const fullUrl = buildFullUrl(imageUrl)
      return (
        <img
          src={fullUrl}
          alt={item.filename || 'Media file'}
          style={{
            maxWidth: '60px',
            maxHeight: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
          }}
        />
      )
    }
  }

  // Fallback to file_id/file_extension (for Keystone uploaded images)
  const fileId = item.file_id
  const fileExtension = item.file_extension

  if (!fileId || !fileExtension) {
    return <div style={{ color: '#999', fontSize: '12px' }}>No file</div>
  }

  const s3Key = `${fileId}.${fileExtension}`
  const fullUrl = buildFullUrl(s3Key)

  return (
    <img
      src={fullUrl}
      alt={item.filename || 'Media file'}
      style={{
        maxWidth: '60px',
        maxHeight: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
      }}
    />
  )
}
