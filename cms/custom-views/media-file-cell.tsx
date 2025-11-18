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

// Re-export the Field from Keystone's image field to enable upload in item view
export { Field } from '@keystone-6/core/fields/types/image/views'

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

// Field view is re-exported from Keystone's image field above to enable upload functionality

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
