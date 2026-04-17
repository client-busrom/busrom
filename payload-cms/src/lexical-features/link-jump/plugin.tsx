// @ts-nocheck
/**
 * LinkJump Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createLinkJumpNode, type LinkJumpData } from './node'

export const INSERT_LINK_JUMP_COMMAND: LexicalCommand<LinkJumpData | undefined> = createCommand(
  'INSERT_LINK_JUMP_COMMAND',
)

export const LinkJumpPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<LinkJumpData | undefined>(
      INSERT_LINK_JUMP_COMMAND,
      (payload) => {
        const data: LinkJumpData = payload || {
          title: '',
          url: '',
          openInNewTab: false,
        }

        const linkJumpNode = $createLinkJumpNode(data)
        $insertNodeToNearestRoot(linkJumpNode)

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
