'use client'

/**
 * Compressed Upload Component
 *
 * Custom upload component that compresses images on the client-side
 * before uploading to reduce bandwidth and storage costs.
 *
 * Supports: JPEG, PNG, WebP, GIF, BMP
 * Max dimension: 3000px (configurable)
 * Max file size: 2MB after compression (configurable)
 */

import React, { useCallback } from 'react'
import imageCompression from 'browser-image-compression'

// Compression options
const COMPRESSION_OPTIONS = {
  maxSizeMB: 10, // Max file size after compression
  maxWidthOrHeight: 3000, // Max dimension (width or height)
  useWebWorker: true, // Use web worker for better performance
  preserveExif: false, // Remove EXIF data to reduce size
  fileType: undefined as string | undefined, // Keep original format
}

// File types that can be compressed
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']

/**
 * Compress an image file before upload
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-image files or unsupported formats
  if (!COMPRESSIBLE_TYPES.includes(file.type)) {
    console.log(`[CompressedUpload] Skipping non-compressible file: ${file.type}`)
    return file
  }

  // Skip small files (< 500KB)
  if (file.size < 500 * 1024) {
    console.log(`[CompressedUpload] Skipping small file: ${(file.size / 1024).toFixed(1)}KB`)
    return file
  }

  try {
    console.log(`[CompressedUpload] Compressing ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB`)

    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS)

    const originalSize = file.size
    const compressedSize = compressedFile.size
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1)

    console.log(
      `[CompressedUpload] Compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${reduction}% smaller)`
    )

    // Return the compressed file with original name
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    })
  } catch (error) {
    console.error('[CompressedUpload] Compression failed:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Compress multiple files
 */
export async function compressImages(files: FileList | File[]): Promise<File[]> {
  const fileArray = Array.from(files)
  const compressedFiles = await Promise.all(fileArray.map(compressImage))
  return compressedFiles
}

/**
 * Hook to use compressed upload
 * Returns a function that processes files before they are uploaded
 */
export function useCompressedUpload() {
  const processFiles = useCallback(async (files: FileList | File[]): Promise<File[]> => {
    return compressImages(files)
  }, [])

  return { processFiles, compressImage }
}

export default compressImage
