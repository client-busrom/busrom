/**
 * Notice Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createNoticeNode, type NoticeData } from './node'

export const INSERT_NOTICE_COMMAND: LexicalCommand<NoticeData | undefined> = createCommand(
  'INSERT_NOTICE_COMMAND',
)

export const NoticePlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<NoticeData | undefined>(
      INSERT_NOTICE_COMMAND,
      (payload) => {
        console.log('📢 INSERT_NOTICE_COMMAND triggered with payload:', payload)

        const data: NoticeData = payload || {
          type: 'info',
          content: '',
        }

        const noticeNode = $createNoticeNode(data)
        $insertNodeToNearestRoot(noticeNode)

        console.log('✅ Notice node inserted')

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
