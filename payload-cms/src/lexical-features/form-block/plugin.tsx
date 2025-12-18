/**
 * FormBlock Plugin - Registers command for inserting form block nodes
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createFormBlockNode, FormBlockData } from './node'

export const INSERT_FORM_BLOCK_COMMAND: LexicalCommand<FormBlockData | undefined> = createCommand(
  'INSERT_FORM_BLOCK_COMMAND',
)

export const FormBlockPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_FORM_BLOCK_COMMAND,
      (payload) => {
        const defaultData: FormBlockData = {
          formConfig: '',
          displayTitle: true,
        }

        const formBlockNode = $createFormBlockNode(payload || defaultData)
        $insertNodes([formBlockNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
