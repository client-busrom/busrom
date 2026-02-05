'use client'

/**
 * Compressed Upload Field Component
 *
 * Wraps Payload's default upload field to add client-side image compression.
 * Images are compressed before upload to reduce bandwidth and storage costs.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { compressImage } from './CompressedUpload'

// Compressible image types
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']

// Flag to track if we're currently processing (prevent re-entry)
const PROCESSING_FLAG = '__compressedUploadProcessing'

/**
 * Hook to intercept file inputs and compress images before upload
 */
export function useUploadInterceptor() {
  const interceptorRef = useRef<boolean>(false)

  useEffect(() => {
    // Only set up once
    if (interceptorRef.current) return
    interceptorRef.current = true

    // Intercept all file input changes
    const handleFileInputChange = async (event: Event) => {
      const input = event.target as HTMLInputElement
      if (!input || input.type !== 'file' || !input.files?.length) return

      // Skip if this event was dispatched by us (prevent infinite loop)
      if ((input as any)[PROCESSING_FLAG]) {
        delete (input as any)[PROCESSING_FLAG]
        return
      }

      // Check if this is an image upload
      const files = Array.from(input.files)
      const hasCompressibleImages = files.some((f) => COMPRESSIBLE_TYPES.includes(f.type))

      if (!hasCompressibleImages) return

      // Prevent default behavior temporarily
      event.stopPropagation()
      event.preventDefault()

      console.log('[UploadInterceptor] Intercepting file upload...')

      try {
        // Compress all images
        const compressedFiles = await Promise.all(
          files.map(async (file) => {
            if (COMPRESSIBLE_TYPES.includes(file.type)) {
              return compressImage(file)
            }
            return file
          })
        )

        // Create new FileList-like object
        const dataTransfer = new DataTransfer()
        compressedFiles.forEach((file) => dataTransfer.items.add(file))

        // Mark that we're about to dispatch our own event
        ;(input as any)[PROCESSING_FLAG] = true

        // Replace the input files
        input.files = dataTransfer.files

        // Dispatch a new change event
        const newEvent = new Event('change', { bubbles: true })
        input.dispatchEvent(newEvent)
      } catch (error) {
        console.error('[UploadInterceptor] Compression error:', error)
        // On error, clear the flag and let the original files through
        delete (input as any)[PROCESSING_FLAG]
      }
    }

    // Add listener with capture to intercept before other handlers
    document.addEventListener('change', handleFileInputChange, { capture: true })

    return () => {
      document.removeEventListener('change', handleFileInputChange, { capture: true })
    }
  }, [])
}

/**
 * Provider component to enable upload interception globally
 */
export function CompressedUploadProvider({ children }: { children: React.ReactNode }) {
  useUploadInterceptor()
  return <>{children}</>
}

export default CompressedUploadProvider
