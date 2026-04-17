// @ts-nocheck
/**
 * IconList Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createIconListNode, IconListData } from './node'

export const INSERT_ICON_LIST_COMMAND: LexicalCommand<IconListData | undefined> = createCommand(
  'INSERT_ICON_LIST_COMMAND',
)

export const IconListPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_ICON_LIST_COMMAND,
      (payload) => {
        const defaultData: IconListData = {
          items: [
            { icon: 'lucide:users', title: '100K+', subtitle: 'Happy Customers' },
            { icon: 'lucide:shield', title: '10 Year', subtitle: 'Warranty' },
            { icon: 'lucide:truck', title: 'Free', subtitle: 'Delivery' },
            { icon: 'lucide:leaf', title: 'Sustainable', subtitle: 'Aluminum' },
          ],
        }

        const iconListNode = $createIconListNode(payload || defaultData)
        $insertNodes([iconListNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
