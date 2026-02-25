// @ts-nocheck
/**
 * SeriesReusableBlock Plugin - Registers command for inserting series reusable block nodes
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createSeriesReusableBlockNode, SeriesReusableBlockData } from './node'

export const INSERT_SERIES_REUSABLE_BLOCK_COMMAND: LexicalCommand<SeriesReusableBlockData | undefined> = createCommand(
  'INSERT_SERIES_REUSABLE_BLOCK_COMMAND',
)

export const SeriesReusableBlockPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_SERIES_REUSABLE_BLOCK_COMMAND,
      (payload) => {
        const defaultData: SeriesReusableBlockData = {
          seriesReusableBlock: '',
        }

        const seriesReusableBlockNode = $createSeriesReusableBlockNode(payload || defaultData)
        $insertNodes([seriesReusableBlockNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
