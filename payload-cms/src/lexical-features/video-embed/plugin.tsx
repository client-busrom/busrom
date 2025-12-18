/**
 * VideoEmbed Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createVideoEmbedNode, type VideoEmbedData } from './node'

export const INSERT_VIDEO_EMBED_COMMAND: LexicalCommand<VideoEmbedData | undefined> = createCommand(
  'INSERT_VIDEO_EMBED_COMMAND',
)

export const VideoEmbedPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<VideoEmbedData | undefined>(
      INSERT_VIDEO_EMBED_COMMAND,
      (payload) => {
        console.log('🎥 INSERT_VIDEO_EMBED_COMMAND triggered with payload:', payload)

        const data: VideoEmbedData = payload || {
          url: '',
          caption: '',
          aspectRatio: '16:9',
        }

        const videoEmbedNode = $createVideoEmbedNode(data)
        $insertNodeToNearestRoot(videoEmbedNode)

        console.log('✅ VideoEmbed node inserted')

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
