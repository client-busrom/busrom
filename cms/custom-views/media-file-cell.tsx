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

// Import necessary types and hooks
import { FieldProps } from '@keystone-6/core/types'

// Re-export the controller from Keystone's image field to enable upload functionality
export { controller } from '@keystone-6/core/fields/types/image/views'

// Import Keystone's default Field component
import { Field as KeystoneImageField } from '@keystone-6/core/fields/types/image/views'

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

/**
 * Custom Field view for item/detail page
 *
 * For batch uploaded images (with file_id but no Keystone file data),
 * show a preview instead of the upload button.
 */
export const Field = (props: FieldProps<typeof controller>) => {
  const { item } = props as any

  // Query for file data and variants
  const { data, loading } = useQuery(
    gql`
      query GetMediaFileData($id: ID!) {
        media(where: { id: $id }) {
          file_id
          file_extension
          file {
            url
          }
          variants
        }
      }
    `,
    {
      variables: { id: item.id },
      skip: !item || !item.id,
    }
  )

  const mediaData = data?.media

  // If we have Keystone file data, use the default field for upload functionality
  if (mediaData?.file?.url) {
    return <KeystoneImageField {...props} />
  }

  // For batch uploaded images: show a read-only preview
  if (!loading && mediaData) {
    // Try variants first
    if (mediaData.variants && typeof mediaData.variants === 'object') {
      const imageUrl = mediaData.variants.medium || mediaData.variants.small || mediaData.variants.thumbnail
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
    }

    // Fallback to file_id/file_extension
    if (mediaData.file_id && mediaData.file_extension) {
      const s3Key = `${mediaData.file_id}.${mediaData.file_extension}`
      const fullUrl = buildFullUrl(s3Key)
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
  }

  // Default: use Keystone's field for upload functionality
  return <KeystoneImageField {...props} />
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
