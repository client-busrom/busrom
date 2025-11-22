/**
 * Batch Media Upload Page
 *
 * 批量媒体上传页面
 *
 * A custom admin page for batch uploading and managing media files.
 */

/** @jsxRuntime classic */
/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { jsx, Heading, Box } from '@keystone-ui/core'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@keystone-ui/button'
import { TextInput, Select, FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { gql, useMutation, useQuery } from '@keystone-6/core/admin-ui/apollo'

/**
 * Image item structure
 */
interface ImageItem {
  id: string
  file: File
  preview: string
  filename: string
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
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface BatchFields {
  baseFilename?: string
  altTextZh?: string
  altTextEn?: string
  primaryCategory?: string
  tags?: string[]
  seriesNumber?: number
  combinationNumber?: number
  sceneNumber?: number
  specs?: string[]
  colors?: string[]
  notes?: string
}

export default function BatchMediaUploadPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [batchFields, setBatchFields] = useState<BatchFields>({})
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories and tags
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


  /**
   * Extract files from directory entries (recursive)
   */
  const extractFilesFromEntry = useCallback(async (entry: any): Promise<File[]> => {
    const files: File[] = []

    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => {
        entry.file((file: File) => resolve(file))
      })
      // Only include image files
      if (file.type.startsWith('image/')) {
        files.push(file)
      }
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader()
      const entries = await new Promise<any[]>((resolve) => {
        dirReader.readEntries((entries: any[]) => resolve(entries))
      })

      for (const childEntry of entries) {
        const childFiles = await extractFilesFromEntry(childEntry)
        files.push(...childFiles)
      }
    }

    return files
  }, [])

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    // Filter only image files
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

    const newImages: ImageItem[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending' as const,
    }))

    setImages((prev) => [...prev, ...newImages])
  }, [])

  /**
   * Handle drag and drop (supports folders)
   */
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const items = e.dataTransfer.items

      if (items) {
        const allFiles: File[] = []

        // Process all dropped items (files and folders)
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const entry = item.webkitGetAsEntry()

          if (entry) {
            const files = await extractFilesFromEntry(entry)
            allFiles.push(...files)
          }
        }

        if (allFiles.length > 0) {
          const newImages: ImageItem[] = allFiles.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            filename: file.name,
            status: 'pending' as const,
          }))

          setImages((prev) => [...prev, ...newImages])
          console.log(`📁 Added ${allFiles.length} images from folders`)
        }
      } else {
        // Fallback to regular file handling
        handleFileSelect(e.dataTransfer.files)
      }
    },
    [extractFilesFromEntry, handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  /**
   * Apply batch fields to all images
   */
  const applyBatchFields = useCallback(() => {
    setImages((prev) =>
      prev.map((img, index) => {
        // Generate filename with numbering if baseFilename is provided
        let newFilename = img.filename
        if (batchFields.baseFilename && prev.length > 1) {
          const extension = img.filename.split('.').pop()
          newFilename = `${batchFields.baseFilename}_${index + 1}.${extension}`
        } else if (batchFields.baseFilename) {
          const extension = img.filename.split('.').pop()
          newFilename = `${batchFields.baseFilename}.${extension}`
        }

        return {
          ...img,
          filename: newFilename,
          altText: {
            ...(img.altText || {}),
            ...(batchFields.altTextZh ? { zh: batchFields.altTextZh } : {}),
            ...(batchFields.altTextEn ? { en: batchFields.altTextEn } : {}),
          },
          primaryCategory: batchFields.primaryCategory || img.primaryCategory,
          tags: batchFields.tags && batchFields.tags.length > 0 ? batchFields.tags : img.tags,
          metadata: {
            ...(img.metadata || {}),
            seriesNumber: batchFields.seriesNumber || img.metadata?.seriesNumber,
            combinationNumber: batchFields.combinationNumber || img.metadata?.combinationNumber,
            sceneNumber: batchFields.sceneNumber || img.metadata?.sceneNumber,
            specs: batchFields.specs && batchFields.specs.length > 0 ? batchFields.specs : img.metadata?.specs,
            colors:
              batchFields.colors && batchFields.colors.length > 0 ? batchFields.colors : img.metadata?.colors,
            notes: batchFields.notes || img.metadata?.notes,
          },
        }
      })
    )
  }, [batchFields])

  /**
   * Update individual image
   */
  const updateImage = useCallback((id: string, updates: Partial<ImageItem>) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)))
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
  const selectedImage = images.find((img) => img.id === selectedImageId)

  // Group tags by type
  const tagsByType = tags.reduce((acc: Record<string, any[]>, tag: any) => {
    const type = tag.type || 'Other'
    if (!acc[type]) acc[type] = []
    acc[type].push(tag)
    return acc
  }, {})

  return (
    <PageContainer header={<Heading type="h3">📤 批量上传媒体文件</Heading>}>
      <Box padding="xlarge">
        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          css={{
            border: '2px dashed #cbd5e0',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f7fafc',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#3182ce',
              backgroundColor: '#ebf8ff',
            },
          }}
        >
          <div css={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div css={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            拖拽图片或文件夹到此处，或点击选择
          </div>
          <div css={{ fontSize: '14px', color: '#718096' }}>
            支持批量上传多张图片 • 支持拖拽文件夹，自动提取所有图片
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
            <div
              css={{
                marginTop: '24px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#fff',
              }}
            >
              <h3 css={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                🎯 批量设置字段（应用到所有图片）
              </h3>

              <div css={{ display: 'grid', gap: '16px' }}>
                {/* Base Filename */}
                <FieldContainer>
                  <FieldLabel>文件名 (英文)</FieldLabel>
                  <TextInput
                    value={batchFields.baseFilename || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, baseFilename: e.target.value })}
                    placeholder="例如: glass-standoff-product"
                  />
                  <div css={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                    {images.length > 1
                      ? '多张图片将自动编号: xxx_1, xxx_2, xxx_3...'
                      : '单张图片将使用此文件名'}
                  </div>
                </FieldContainer>

                {/* Batch Alt Text (zh) */}
                <FieldContainer>
                  <FieldLabel>替代文本 (中文)</FieldLabel>
                  <TextInput
                    value={batchFields.altTextZh || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, altTextZh: e.target.value })}
                    placeholder="例如: 玻璃固定夹产品图"
                  />
                </FieldContainer>

                {/* Batch Alt Text (en) */}
                <FieldContainer>
                  <FieldLabel>Alt Text (English)</FieldLabel>
                  <TextInput
                    value={batchFields.altTextEn || ''}
                    onChange={(e) => setBatchFields({ ...batchFields, altTextEn: e.target.value })}
                    placeholder="e.g. Glass Standoff Product Image"
                  />
                </FieldContainer>

                {/* Batch Primary Category */}
                <FieldContainer>
                  <FieldLabel>主分类 (Primary Category)</FieldLabel>
                  <Select
                    value={
                      batchFields.primaryCategory
                        ? {
                            label:
                              categories.find((c: any) => c.id === batchFields.primaryCategory)?.displayName ||
                              categories.find((c: any) => c.id === batchFields.primaryCategory)?.name ||
                              '',
                            value: batchFields.primaryCategory,
                          }
                        : null
                    }
                    onChange={(option: any) =>
                      setBatchFields({ ...batchFields, primaryCategory: option?.value || '' })
                    }
                    options={[
                      { label: '请选择', value: '' },
                      ...categories.map((c: any) => ({
                        label: c.displayName || c.name,
                        value: c.id,
                      })),
                    ]}
                  />
                </FieldContainer>

                {/* Batch Tags (Grouped by Type) */}
                <FieldContainer>
                  <FieldLabel>标签 (Tags)</FieldLabel>
                  <div css={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(tagsByType).map(([type, typeTags]) => (
                      <div key={type}>
                        <div css={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#4a5568' }}>
                          {type}
                        </div>
                        <div css={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(typeTags as any[]).map((tag: any) => {
                            const isSelected = batchFields.tags?.includes(tag.id)
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  const currentTags = batchFields.tags || []
                                  const newTags = isSelected
                                    ? currentTags.filter((id) => id !== tag.id)
                                    : [...currentTags, tag.id]
                                  setBatchFields({ ...batchFields, tags: newTags })
                                }}
                                css={{
                                  padding: '6px 12px',
                                  fontSize: '13px',
                                  borderRadius: '4px',
                                  border: '1px solid',
                                  borderColor: isSelected ? '#3182ce' : '#e2e8f0',
                                  backgroundColor: isSelected ? '#ebf8ff' : '#fff',
                                  color: isSelected ? '#2c5282' : '#4a5568',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: '#3182ce',
                                    backgroundColor: '#ebf8ff',
                                  },
                                }}
                              >
                                {tag.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div css={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                    点击标签进行多选
                  </div>
                </FieldContainer>

                {/* Metadata Section */}
                <div
                  css={{
                    marginTop: '8px',
                    padding: '16px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '6px',
                  }}
                >
                  <h4 css={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                    📋 元数据 (Metadata)
                  </h4>

                  <div css={{ display: 'grid', gap: '12px' }}>
                    {/* Series Number */}
                    <FieldContainer>
                      <FieldLabel>系列编号 (Series Number)</FieldLabel>
                      <TextInput
                        type="number"
                        value={batchFields.seriesNumber?.toString() || ''}
                        onChange={(e) =>
                          setBatchFields({
                            ...batchFields,
                            seriesNumber: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="例如: 1, 2, 3..."
                      />
                    </FieldContainer>

                    {/* Combination Number */}
                    <FieldContainer>
                      <FieldLabel>组合编号 (Combination Number)</FieldLabel>
                      <TextInput
                        type="number"
                        value={batchFields.combinationNumber?.toString() || ''}
                        onChange={(e) =>
                          setBatchFields({
                            ...batchFields,
                            combinationNumber: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="例如: 1, 2, 3..."
                      />
                    </FieldContainer>

                    {/* Scene Number */}
                    <FieldContainer>
                      <FieldLabel>场景编号 (Scene Number)</FieldLabel>
                      <TextInput
                        type="number"
                        value={batchFields.sceneNumber?.toString() || ''}
                        onChange={(e) =>
                          setBatchFields({
                            ...batchFields,
                            sceneNumber: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="例如: 1, 2, 3..."
                      />
                    </FieldContainer>

                    {/* Specs */}
                    <FieldContainer>
                      <FieldLabel>规格 (Specifications)</FieldLabel>
                      <TextInput
                        value={batchFields.specs?.join(', ') || ''}
                        onChange={(e) => {
                          const specs = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          setBatchFields({ ...batchFields, specs })
                        }}
                        placeholder="例如: 50mm, 不锈钢 (用逗号分隔)"
                      />
                    </FieldContainer>

                    {/* Colors */}
                    <FieldContainer>
                      <FieldLabel>颜色 (Colors)</FieldLabel>
                      <TextInput
                        value={batchFields.colors?.join(', ') || ''}
                        onChange={(e) => {
                          const colors = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          setBatchFields({ ...batchFields, colors })
                        }}
                        placeholder="例如: 黑色, 银色 (用逗号分隔)"
                      />
                    </FieldContainer>

                    {/* Notes */}
                    <FieldContainer>
                      <FieldLabel>备注 (Notes)</FieldLabel>
                      <textarea
                        value={batchFields.notes || ''}
                        onChange={(e) => setBatchFields({ ...batchFields, notes: e.target.value || undefined })}
                        placeholder="其他说明..."
                        css={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '8px',
                          fontSize: '14px',
                          border: '1px solid #e1e5e9',
                          borderRadius: '6px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </FieldContainer>
                  </div>
                </div>

                {/* Apply Button */}
                <Button tone="active" weight="bold" onClick={applyBatchFields}>
                  ✅ 应用到所有图片 ({images.length} 张)
                </Button>
              </div>
            </div>

            {/* Images Grid */}
            <div css={{ marginTop: '24px' }}>
              <div
                css={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <h3 css={{ fontSize: '16px', fontWeight: 600 }}>📸 图片列表 ({images.length} 张)</h3>
                <div css={{ display: 'flex', gap: '8px' }}>
                  <Button tone="active" weight="bold" onClick={uploadAllImages} isDisabled={isUploading}>
                    {isUploading ? '上传中...' : '🚀 上传所有图片'}
                  </Button>
                  <Button tone="passive" onClick={() => setImages([])} isDisabled={isUploading}>
                    清空列表
                  </Button>
                </div>
              </div>

              <div
                css={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {images.map((image) => (
                  <div
                    key={image.id}
                    css={{
                      border: selectedImageId === image.id ? '2px solid #3182ce' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#fff',
                      '&:hover': {
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                    onClick={() => setSelectedImageId(image.id)}
                  >
                    {/* Image Preview */}
                    <div
                      css={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#f7fafc',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={image.preview}
                        alt={image.filename}
                        css={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {/* Status Badge */}
                      <div
                        css={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor:
                            image.status === 'success'
                              ? '#48bb78'
                              : image.status === 'uploading'
                                ? '#4299e1'
                                : image.status === 'error'
                                  ? '#f56565'
                                  : '#cbd5e0',
                          color: '#fff',
                        }}
                      >
                        {image.status === 'success'
                          ? '✓'
                          : image.status === 'uploading'
                            ? '⏳'
                            : image.status === 'error'
                              ? '✗'
                              : '○'}
                      </div>
                    </div>

                    {/* Image Info */}
                    <div css={{ padding: '12px' }}>
                      <div
                        css={{
                          fontSize: '13px',
                          fontWeight: 500,
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={image.filename}
                      >
                        {image.filename}
                      </div>
                      <div css={{ fontSize: '12px', color: '#718096' }}>
                        {image.altText?.zh && `🇨🇳 ${image.altText.zh.substring(0, 15)}...`}
                      </div>
                      <div css={{ fontSize: '12px', color: '#718096' }}>
                        {image.altText?.en && `🇬🇧 ${image.altText.en.substring(0, 15)}...`}
                      </div>
                      {image.error && (
                        <div css={{ fontSize: '12px', color: '#f56565', marginTop: '4px' }}>{image.error}</div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div css={{ padding: '0 12px 12px' }}>
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
              <div
                css={{
                  marginTop: '24px',
                  padding: '20px',
                  border: '2px solid #3182ce',
                  borderRadius: '8px',
                  backgroundColor: '#ebf8ff',
                }}
              >
                <h3 css={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                  ✏️ 编辑图片: {selectedImage.filename}
                </h3>

                <div css={{ display: 'grid', gap: '16px' }}>
                  {/* Individual Filename */}
                  <FieldContainer>
                    <FieldLabel>文件名 (Filename)</FieldLabel>
                    <TextInput
                      value={selectedImage.filename}
                      onChange={(e) => updateImage(selectedImage.id, { filename: e.target.value })}
                      placeholder="例如: glass-standoff-product.jpg"
                    />
                  </FieldContainer>

                  {/* Individual Alt Text (zh) */}
                  <FieldContainer>
                    <FieldLabel>替代文本 (中文)</FieldLabel>
                    <TextInput
                      value={selectedImage.altText?.zh || ''}
                      onChange={(e) =>
                        updateImage(selectedImage.id, {
                          altText: { ...selectedImage.altText, zh: e.target.value },
                        })
                      }
                      placeholder="例如: 玻璃固定夹产品图"
                    />
                  </FieldContainer>

                  {/* Individual Alt Text (en) */}
                  <FieldContainer>
                    <FieldLabel>Alt Text (English)</FieldLabel>
                    <TextInput
                      value={selectedImage.altText?.en || ''}
                      onChange={(e) =>
                        updateImage(selectedImage.id, {
                          altText: { ...selectedImage.altText, en: e.target.value },
                        })
                      }
                      placeholder="e.g. Glass Standoff Product Image"
                    />
                  </FieldContainer>

                  {/* Individual Primary Category */}
                  <FieldContainer>
                    <FieldLabel>主分类 (Primary Category)</FieldLabel>
                    <Select
                      value={
                        selectedImage.primaryCategory
                          ? {
                              label:
                                categories.find((c: any) => c.id === selectedImage.primaryCategory)?.displayName ||
                                categories.find((c: any) => c.id === selectedImage.primaryCategory)?.name ||
                                '',
                              value: selectedImage.primaryCategory,
                            }
                          : null
                      }
                      onChange={(option: any) =>
                        updateImage(selectedImage.id, { primaryCategory: option?.value || '' })
                      }
                      options={[
                        { label: '请选择', value: '' },
                        ...categories.map((c: any) => ({
                          label: c.displayName || c.name,
                          value: c.id,
                        })),
                      ]}
                    />
                  </FieldContainer>

                  {/* Individual Tags */}
                  <FieldContainer>
                    <FieldLabel>标签 (Tags)</FieldLabel>
                    <div css={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(tagsByType).map(([type, typeTags]) => (
                        <div key={type}>
                          <div css={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#4a5568' }}>
                            {type}
                          </div>
                          <div css={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(typeTags as any[]).map((tag: any) => {
                              const isSelected = selectedImage.tags?.includes(tag.id)
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => {
                                    const currentTags = selectedImage.tags || []
                                    const newTags = isSelected
                                      ? currentTags.filter((id) => id !== tag.id)
                                      : [...currentTags, tag.id]
                                    updateImage(selectedImage.id, { tags: newTags })
                                  }}
                                  css={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    borderRadius: '4px',
                                    border: '1px solid',
                                    borderColor: isSelected ? '#3182ce' : '#e2e8f0',
                                    backgroundColor: isSelected ? '#ebf8ff' : '#fff',
                                    color: isSelected ? '#2c5282' : '#4a5568',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      borderColor: '#3182ce',
                                      backgroundColor: '#ebf8ff',
                                    },
                                  }}
                                >
                                  {tag.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FieldContainer>

                  {/* Individual Metadata */}
                  <div
                    css={{
                      marginTop: '8px',
                      padding: '16px',
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h4 css={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                      📋 元数据 (Metadata)
                    </h4>

                    <div css={{ display: 'grid', gap: '12px' }}>
                      {/* Individual Series Number */}
                      <FieldContainer>
                        <FieldLabel>系列编号 (Series Number)</FieldLabel>
                        <TextInput
                          type="number"
                          value={selectedImage.metadata?.seriesNumber?.toString() || ''}
                          onChange={(e) =>
                            updateImage(selectedImage.id, {
                              metadata: {
                                ...selectedImage.metadata,
                                seriesNumber: e.target.value ? parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="例如: 1, 2, 3..."
                        />
                      </FieldContainer>

                      {/* Individual Combination Number */}
                      <FieldContainer>
                        <FieldLabel>组合编号 (Combination Number)</FieldLabel>
                        <TextInput
                          type="number"
                          value={selectedImage.metadata?.combinationNumber?.toString() || ''}
                          onChange={(e) =>
                            updateImage(selectedImage.id, {
                              metadata: {
                                ...selectedImage.metadata,
                                combinationNumber: e.target.value ? parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="例如: 1, 2, 3..."
                        />
                      </FieldContainer>

                      {/* Individual Scene Number */}
                      <FieldContainer>
                        <FieldLabel>场景编号 (Scene Number)</FieldLabel>
                        <TextInput
                          type="number"
                          value={selectedImage.metadata?.sceneNumber?.toString() || ''}
                          onChange={(e) =>
                            updateImage(selectedImage.id, {
                              metadata: {
                                ...selectedImage.metadata,
                                sceneNumber: e.target.value ? parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="例如: 1, 2, 3..."
                        />
                      </FieldContainer>

                      {/* Individual Specs */}
                      <FieldContainer>
                        <FieldLabel>规格 (Specifications)</FieldLabel>
                        <TextInput
                          value={selectedImage.metadata?.specs?.join(', ') || ''}
                          onChange={(e) => {
                            const specs = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            updateImage(selectedImage.id, {
                              metadata: {
                                ...selectedImage.metadata,
                                specs: specs.length > 0 ? specs : undefined,
                              },
                            })
                          }}
                          placeholder="例如: 50mm, 不锈钢 (用逗号分隔)"
                        />
                      </FieldContainer>

                      {/* Individual Colors */}
                      <FieldContainer>
                        <FieldLabel>颜色 (Colors)</FieldLabel>
                        <TextInput
                          value={selectedImage.metadata?.colors?.join(', ') || ''}
                          onChange={(e) => {
                            const colors = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            updateImage(selectedImage.id, {
                              metadata: {
                                ...selectedImage.metadata,
                                colors: colors.length > 0 ? colors : undefined,
                              },
                            })
                          }}
                          placeholder="例如: 黑色, 银色 (用逗号分隔)"
                        />
                      </FieldContainer>

                      {/* Individual Notes */}
                      <FieldContainer>
                        <FieldLabel>备注 (Notes)</FieldLabel>
                        <textarea
                          value={selectedImage.metadata?.notes || ''}
                          onChange={(e) =>
                            updateImage(selectedImage.id, {
                              metadata: {
                                ...selectedImage.metadata,
                                notes: e.target.value || undefined,
                              },
                            })
                          }
                          placeholder="其他说明..."
                          css={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontFamily: 'inherit',
                          }}
                        />
                      </FieldContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Box>
    </PageContainer>
  )
}
