// @ts-nocheck
/**
 * SingleImage Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createSingleImageNode, type SingleImageData } from './node'

export const INSERT_SINGLE_IMAGE_COMMAND: LexicalCommand<SingleImageData | undefined> = createCommand(
  'INSERT_SINGLE_IMAGE_COMMAND',
)

export const SingleImagePlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<SingleImageData | undefined>(
      INSERT_SINGLE_IMAGE_COMMAND,
      (payload) => {
        console.log('🖼️ INSERT_SINGLE_IMAGE_COMMAND triggered with payload:', payload)

        const data: SingleImageData = payload || {
          image: '',
          caption: '',
          alignment: 'center',
          size: 'large',
        }

        const singleImageNode = $createSingleImageNode(data)
        $insertNodeToNearestRoot(singleImageNode)

        console.log('✅ SingleImage node inserted')

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
