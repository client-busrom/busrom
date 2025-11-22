/**
 * Batch Media Upload Field
 *
 * 批量媒体上传字段
 *
 * Features:
 * 1. Drag-and-drop multiple images
 * 2. Preview all images in a grid
 * 3. Batch set fields (alt text, category, tags, metadata) for all images
 * 4. Edit individual image fields
 * 5. Upload all to Media library
 */

import React, { useState, useCallback, useRef } from 'react'
import {
  FieldContainer,
  FieldLabel,
  TextInput,
  Select,
} from '@keystone-ui/fields'
import { Button } from '@keystone-ui/button'
import { FieldProps } from '@keystone-6/core/types'
import { controller } from '@keystone-6/core/fields/types/json/views'
import { gql, useMutation, useQuery } from '@keystone-6/core/admin-ui/apollo'

/**
 * Image item structure
 */
interface ImageItem {
  id: string
  file: File
  preview: string
  filename: string
  // Fields that can be set
  altText?: Record<string, string>
  primaryCategory?: string
  tags?: string[]
  metadata?: {
    seriesNumber?: number
    combinationNumber?: number
    sceneNumber?: number
    specs?: string[]
    colors?: string[]
    notes?: string
  }
  // Upload status
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

/**
 * Batch field values (applied to all images)
 */
interface BatchFields {
  altText?: string // Will be used for zh locale
  primaryCategory?: string
  tags?: string[]
  seriesNumber?: string
  combinationNumber?: string
  sceneNumber?: string
  specs?: string[]
  colors?: string[]
  notes?: string
}

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [images, setImages] = useState<ImageItem[]>([])
  const [batchFields, setBatchFields] = useState<BatchFields>({})
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories and tags for selectors
  const { data: categoriesData } = useQuery(gql`
    query GetMediaCategories {
      mediaCategories {
        id
        name
        displayName
      }
    }
  `)

  const { data: tagsData } = useQuery(gql`
    query GetMediaTags {
      mediaTags {
        id
        name
        type
      }
    }
  `)

  // Create media mutation
  const [createMedia] = useMutation(gql`
    mutation CreateMedia($data: MediaCreateInput!) {
      createMedia(data: $data) {
        id
        filename
      }
    }
  `)

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newImages: ImageItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending' as const,
    }))

    setImages((prev) => [...prev, ...newImages])
  }, [])

  /**
   * Handle drag and drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  /**
   * Apply batch fields to all images
   */
  const applyBatchFields = useCallback(() => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        altText: batchFields.altText ? { zh: batchFields.altText } : img.altText,
        primaryCategory: batchFields.primaryCategory || img.primaryCategory,
        tags: batchFields.tags && batchFields.tags.length > 0 ? batchFields.tags : img.tags,
        metadata: {
          ...img.metadata,
          seriesNumber: batchFields.seriesNumber ? parseInt(batchFields.seriesNumber) : img.metadata?.seriesNumber,
          combinationNumber: batchFields.combinationNumber ? parseInt(batchFields.combinationNumber) : img.metadata?.combinationNumber,
          sceneNumber: batchFields.sceneNumber ? parseInt(batchFields.sceneNumber) : img.metadata?.sceneNumber,
          specs: batchFields.specs && batchFields.specs.length > 0 ? batchFields.specs : img.metadata?.specs,
          colors: batchFields.colors && batchFields.colors.length > 0 ? batchFields.colors : img.metadata?.colors,
          notes: batchFields.notes || img.metadata?.notes,
        },
      }))
    )
  }, [batchFields])

  /**
   * Update individual image
   */
  const updateImage = useCallback((id: string, updates: Partial<ImageItem>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    )
  }, [])

  /**
   * Remove image
   */
  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  /**
   * Upload all images using Keystone's native GraphQL mutation
   */
  const uploadAllImages = useCallback(async () => {
    setIsUploading(true)

    for (const image of images) {
      if (image.status === 'success') continue

      try {
        updateImage(image.id, { status: 'uploading' })

        // Use Keystone's native GraphQL mutation for creating Media with file upload
        const operations = {
          query: `
            mutation CreateMedia($data: MediaCreateInput!) {
              createMedia(data: $data) {
                id
                filename
                file {
                  url
                }
              }
            }
          `,
          variables: {
            data: {
              filename: image.filename,
              file: { upload: null }, // Will be replaced by the actual file
              altText: image.altText || {},
              ...(image.primaryCategory && {
                primaryCategory: { connect: { id: image.primaryCategory } },
              }),
              ...(image.tags && image.tags.length > 0 && {
                tags: { connect: image.tags.map((id) => ({ id })) },
              }),
              metadata: image.metadata || {},
              status: 'ACTIVE',
            },
          },
        }

        // Create FormData for multipart upload
        const formData = new FormData()
        formData.append('operations', JSON.stringify(operations))

        // Map tells GraphQL where to put the uploaded file
        const map = {
          '0': ['variables.data.file.upload'],
        }
        formData.append('map', JSON.stringify(map))

        // Append the actual file
        formData.append('0', image.file, image.filename)

        // Send to Keystone's GraphQL endpoint
        const uploadResponse = await fetch('/api/graphql', {
          method: 'POST',
          body: formData,
          credentials: 'include', // Important for session cookies
          headers: {
            'apollo-require-preflight': 'true', // Required to bypass CSRF protection
          },
        })

        if (!uploadResponse.ok) {
          throw new Error(`HTTP error! status: ${uploadResponse.status}`)
        }

        const result = await uploadResponse.json()

        if (result.errors) {
          throw new Error(result.errors[0]?.message || 'GraphQL error')
        }

        console.log('Upload success:', result.data.createMedia)

        updateImage(image.id, { status: 'success' })
      } catch (error) {
        console.error('Upload error:', error)
        updateImage(image.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        })
      }
    }

    setIsUploading(false)
  }, [images, updateImage])

  const categories = categoriesData?.mediaCategories || []
  const tags = tagsData?.mediaTags || []

  // Group tags by type
  const tagsByType = tags.reduce((acc: Record<string, any[]>, tag: any) => {
    const type = tag.type || 'Other'
    if (!acc[type]) acc[type] = []
    acc[type].push(tag)
    return acc
  }, {})

  const selectedImage = images.find((img) => img.id === selectedImageId)

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      <div style={{ marginTop: '16px' }}>
        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #cbd5e0',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f7fafc',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            拖拽图片到此处或点击选择
          </div>
          <div style={{ fontSize: '14px', color: '#718096' }}>
            支持批量上传多张图片
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>

        {/* Batch Fields Settings */}
        {images.length > 0 && (
          <>
            <div style={{
              marginTop: '24px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#fff',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                🎯 批量设置字段（应用到所有图片）
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Batch Alt Text (zh) */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    替代文本 (中文)
                  </label>
                  <TextInput
                    value={batchFields.altText || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, altText: e.target.value })}
                    placeholder="例如: 玻璃固定夹产品图"
                  />
                </div>

                {/* Batch Primary Category */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    主分类
                  </label>
                  <Select
                    value={categories.find((c: any) => c.id === batchFields.primaryCategory)}
                    onChange={(option: any) => setBatchFields({ ...batchFields, primaryCategory: option?.id })}
                    options={[
                      { label: '请选择', value: null },
                      ...categories.map((c: any) => ({ label: c.displayName || c.name, value: c.id })),
                    ]}
                  />
                </div>

                {/* Batch Series Number */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    系列编号 (Series Number)
                  </label>
                  <TextInput
                    type="number"
                    value={batchFields.seriesNumber || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, seriesNumber: e.target.value })}
                    placeholder="例如: 1, 2, 3..."
                  />
                </div>

                {/* Batch Combination Number */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    组合编号 (Combination Number)
                  </label>
                  <TextInput
                    type="number"
                    value={batchFields.combinationNumber || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, combinationNumber: e.target.value })}
                    placeholder="例如: 1, 2, 3..."
                  />
                </div>

                {/* Batch Scene Number */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    场景编号 (Scene Number)
                  </label>
                  <TextInput
                    type="number"
                    value={batchFields.sceneNumber || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, sceneNumber: e.target.value })}
                    placeholder="例如: 1, 2, 3..."
                  />
                </div>

                {/* Batch Specs */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    规格
                  </label>
                  <TextInput
                    value={batchFields.specs?.join(', ') || ''}
                    onChange={(e) => {
                      const specs = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      setBatchFields({ ...batchFields, specs })
                    }}
                    placeholder="例如: 50mm, 不锈钢 (用逗号分隔)"
                  />
                </div>

                {/* Batch Colors */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                    颜色
                  </label>
                  <TextInput
                    value={batchFields.colors?.join(', ') || ''}
                    onChange={(e) => {
                      const colors = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      setBatchFields({ ...batchFields, colors })
                    }}
                    placeholder="例如: 黑色, 银色 (用逗号分隔)"
                  />
                </div>

                {/* Apply Button */}
                <Button
                  tone="active"
                  weight="bold"
                  onClick={applyBatchFields}
                >
                  ✅ 应用到所有图片 ({images.length} 张)
                </Button>
              </div>
            </div>

            {/* Images Grid */}
            <div style={{ marginTop: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                  📸 图片列表 ({images.length} 张)
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    tone="active"
                    weight="bold"
                    onClick={uploadAllImages}
                    isDisabled={isUploading}
                  >
                    {isUploading ? '上传中...' : '🚀 上传所有图片'}
                  </Button>
                  <Button
                    tone="passive"
                    onClick={() => setImages([])}
                    isDisabled={isUploading}
                  >
                    清空列表
                  </Button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                {images.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      border: selectedImageId === image.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#fff',
                    }}
                    onClick={() => setSelectedImageId(image.id)}
                  >
                    {/* Image Preview */}
                    <div style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f7fafc',
                      position: 'relative',
                    }}>
                      <img
                        src={image.preview}
                        alt={image.filename}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor:
                          image.status === 'success' ? '#48bb78' :
                          image.status === 'uploading' ? '#4299e1' :
                          image.status === 'error' ? '#f56565' : '#cbd5e0',
                        color: '#fff',
                      }}>
                        {image.status === 'success' ? '✓' :
                         image.status === 'uploading' ? '⏳' :
                         image.status === 'error' ? '✗' : '○'}
                      </div>
                    </div>

                    {/* Image Info */}
                    <div style={{ padding: '12px' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {image.filename}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        {image.altText?.zh && `📝 ${image.altText.zh.substring(0, 20)}...`}
                      </div>
                      {image.error && (
                        <div style={{ fontSize: '12px', color: '#f56565', marginTop: '4px' }}>
                          {image.error}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div style={{ padding: '0 12px 12px' }}>
                      <Button
                        size="small"
                        tone="negative"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(image.id)
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Image Editor */}
            {selectedImage && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                border: '2px solid #3182ce',
                borderRadius: '8px',
                backgroundColor: '#ebf8ff',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                  ✏️ 编辑图片: {selectedImage.filename}
                </h3>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Individual Alt Text */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                      替代文本 (中文)
                    </label>
                    <TextInput
                      value={selectedImage.altText?.zh || ''}
                      onChange={(e) => updateImage(selectedImage.id, {
                        altText: { ...selectedImage.altText, zh: e.target.value },
                      })}
                      placeholder="例如: 玻璃固定夹产品图"
                    />
                  </div>

                  {/* Individual Series Number */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                      系列编号 (Series Number)
                    </label>
                    <TextInput
                      type="number"
                      value={selectedImage.metadata?.seriesNumber?.toString() || ''}
                      onChange={(e) => updateImage(selectedImage.id, {
                        metadata: {
                          ...selectedImage.metadata,
                          seriesNumber: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                      placeholder="例如: 1, 2, 3..."
                    />
                  </div>

                  {/* Individual Combination Number */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                      组合编号 (Combination Number)
                    </label>
                    <TextInput
                      type="number"
                      value={selectedImage.metadata?.combinationNumber?.toString() || ''}
                      onChange={(e) => updateImage(selectedImage.id, {
                        metadata: {
                          ...selectedImage.metadata,
                          combinationNumber: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                      placeholder="例如: 1, 2, 3..."
                    />
                  </div>

                  {/* Individual Scene Number */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                      场景编号 (Scene Number)
                    </label>
                    <TextInput
                      type="number"
                      value={selectedImage.metadata?.sceneNumber?.toString() || ''}
                      onChange={(e) => updateImage(selectedImage.id, {
                        metadata: {
                          ...selectedImage.metadata,
                          sceneNumber: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })}
                      placeholder="例如: 1, 2, 3..."
                    />
                  </div>

                  {/* Individual Notes */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                      备注
                    </label>
                    <textarea
                      value={selectedImage.metadata?.notes || ''}
                      onChange={(e) => updateImage(selectedImage.id, {
                        metadata: {
                          ...selectedImage.metadata,
                          notes: e.target.value || undefined,
                        },
                      })}
                      placeholder="其他说明..."
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px',
                        fontSize: '14px',
                        border: '1px solid #e1e5e9',
                        borderRadius: '6px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </FieldContainer>
  )
}

export const Cell = () => {
  return <div>Batch Upload Tool</div>
}

export const controller = (config: any) => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (value: any) => value,
    serialize: (value: any) => value,
  }
}
