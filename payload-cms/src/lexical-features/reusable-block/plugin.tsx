/**
 * ReusableBlock Plugin - Registers command for inserting reusable block nodes
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createReusableBlockNode, ReusableBlockData } from './node'

export const INSERT_REUSABLE_BLOCK_COMMAND: LexicalCommand<ReusableBlockData | undefined> = createCommand(
  'INSERT_REUSABLE_BLOCK_COMMAND',
)

export const ReusableBlockPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_REUSABLE_BLOCK_COMMAND,
      (payload) => {
        const defaultData: ReusableBlockData = {
          reusableBlock: '',
        }

        const reusableBlockNode = $createReusableBlockNode(payload || defaultData)
        $insertNodes([reusableBlockNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
