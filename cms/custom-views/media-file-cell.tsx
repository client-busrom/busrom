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
 * Custom Field view for item/detail page
 *
 * For batch uploaded images (with file_id but no Keystone file data),
 * show a preview instead of the upload button.
 *
 * Key insight: props.itemValue contains the full item data including variants!
 */
export const Field = (props: any) => {
  const { value, itemValue } = props

  // Get item ID from URL for GraphQL query
  const itemId = React.useMemo(() => {
    if (typeof window === 'undefined') return null
    const match = window.location.pathname.match(/\/media\/([^/]+)/)
    return match && match[1] !== 'create' ? match[1] : null
  }, [])

  // Query for variants data (itemValue may not include variants in the initial load)
  // Note: file_id and file_extension are internal Keystone image field properties,
  // not exposed in GraphQL. We only query the 'variants' JSON field.
  const { data } = useQuery(
    gql`
      query GetMediaVariants($id: ID!) {
        media(where: { id: $id }) {
          variants
        }
      }
    `,
    {
      variables: { id: itemId },
      skip: !itemId || (value && value.kind !== 'empty'),
    }
  )

  // Check if we have Keystone file data (value.kind !== 'empty')
  // If yes, use the default Keystone field for upload functionality
  if (value && value.kind !== 'empty') {
    return <KeystoneImageField {...props} />
  }

  // For batch uploaded images: show a read-only preview
  const mediaData = data?.media

  // Get image URL from variants (the only reliable source for batch uploaded images)
  const variants = mediaData?.variants
  const imageUrl = variants && typeof variants === 'object'
    ? (variants.medium || variants.small || variants.thumbnail)
    : null

  if (imageUrl) {
    const fullUrl = buildFullUrl(imageUrl)
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{
          background: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#2d3748' }}>
            File Preview (文件预览)
          </div>
          <div style={{ fontSize: '13px', color: '#718096', marginBottom: '12px' }}>
            This image was batch uploaded. The file is stored in S3 and cannot be replaced through the UI.
            <br />
            此图片为批量导入，文件存储在 S3 中，无法通过界面替换。
          </div>
          <img
            src={fullUrl}
            alt="Media preview"
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
            }}
          />
        </div>
      </div>
    )
  }

  // Default: use Keystone's field for upload functionality (for new items)
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
