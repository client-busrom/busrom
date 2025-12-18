// @ts-nocheck
/**
 * ImageGallery Plugin - 注册命令
 */

'use client'

import type { LexicalCommand, PluginComponent } from '@payloadcms/richtext-lexical'

import {
  createCommand,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from '@payloadcms/richtext-lexical/lexical'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import { useEffect } from 'react'

import { $createImageGalleryNode } from './node.tsx'

export const INSERT_IMAGE_GALLERY_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_IMAGE_GALLERY_COMMAND',
)

export const ImageGalleryPlugin: PluginComponent = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_GALLERY_COMMAND,
      () => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          return false
        }

        const focusNode = selection.focus.getNode()

        if (focusNode !== null) {
          const galleryNode = $createImageGalleryNode({
            images: [],
            layout: 'grid-3',
            spacing: 'normal',
            lightbox: true,
          })
          $insertNodeToNearestRoot(galleryNode)
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
