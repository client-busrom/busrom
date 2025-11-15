/**
 * Custom Cell View for Media File Field
 *
 * Displays the image preview by constructing the URL from file_id and file_extension
 * Supports both Cell (list view) and Field (item view)
 */

import React from 'react'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

// Helper function to construct image URL
const constructImageUrl = (fileId: string, fileExtension: string) => {
  const cdnDomain = 'http://localhost:9000'
  const bucketName = 'busrom-media'
  return `${cdnDomain}/${bucketName}/${fileId}.${fileExtension}`
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
      return (
        <div style={{ padding: '4px 0' }}>
          <img
            src={imageUrl}
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

// Field view for item detail view
export const Field = ({ item, field, value }: any) => {
  // In detail view, value comes in the format: {kind: 'from-server', data: {...}}
  // Extract the actual image data
  const imageData = value?.data || value

  // If we have a valid Keystone image field value, display it
  if (imageData && imageData.src) {
    return (
      <div style={{ padding: '12px 0' }}>
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f7fafc',
            display: 'inline-block',
          }}
        >
          <img
            src={imageData.src}
            alt="Media file"
            style={{
              maxWidth: '600px',
              maxHeight: '600px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '4px',
              display: 'block',
            }}
          />
          <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
            {imageData.width && imageData.height && (
              <>
                <strong>Dimensions:</strong> {imageData.width} × {imageData.height}
                <br />
              </>
            )}
            {imageData.filesize && (
              <>
                <strong>Size:</strong> {(imageData.filesize / 1024).toFixed(2)} KB
                <br />
              </>
            )}
            {imageData.extension && (
              <>
                <strong>Format:</strong> {imageData.extension.toUpperCase()}
                <br />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback: For batch uploaded images, try to construct URL from item data
  if (!item) {
    return (
      <div style={{ padding: '12px 0', color: '#999', fontSize: '14px' }}>
        No file uploaded
      </div>
    )
  }

  const fileId = item.file_id
  const fileExtension = item.file_extension

  if (!fileId || !fileExtension) {
    return (
      <div style={{ padding: '12px 0', color: '#999', fontSize: '14px' }}>
        No file uploaded
      </div>
    )
  }

  const imageUrl = constructImageUrl(fileId, fileExtension)

  return (
    <div style={{ padding: '12px 0' }}>
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#f7fafc',
          display: 'inline-block',
        }}
      >
        <img
          src={imageUrl}
          alt={item.filename || 'Media file'}
          style={{
            maxWidth: '600px',
            maxHeight: '600px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '4px',
            display: 'block',
          }}
          onError={(e) => {
            console.error('Failed to load image:', imageUrl)
          }}
        />
        <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
          <strong>File ID:</strong> {fileId}
          <br />
          <strong>Extension:</strong> {fileExtension}
          <br />
          <strong>Size:</strong> {item.file_filesize ? `${(item.file_filesize / 1024).toFixed(2)} KB` : 'Unknown'}
        </div>
      </div>
    </div>
  )
}

// CardValue view for cards
export const CardValue = ({ item, field }: any) => {
  const fileId = item.file_id
  const fileExtension = item.file_extension

  if (!fileId || !fileExtension) {
    return <div style={{ color: '#999', fontSize: '12px' }}>No file</div>
  }

  const imageUrl = constructImageUrl(fileId, fileExtension)

  return (
    <img
      src={imageUrl}
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
