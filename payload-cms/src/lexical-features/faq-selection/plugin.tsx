
// @ts-nocheck
'use client'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, createCommand, COMMAND_PRIORITY_EDITOR } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'
import { $createFaqSelectionNode } from './node'

export const INSERT_FAQ_SELECTION_COMMAND = createCommand('INSERT_FAQ_SELECTION_COMMAND')

export const FaqSelectionPlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_FAQ_SELECTION_COMMAND,
      () => {
        const node = $createFaqSelectionNode({
          categories: []
        })
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
