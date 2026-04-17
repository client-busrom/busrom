// @ts-nocheck
/**
 * MarqueeLinks Plugin - Registers command for inserting marquee links nodes
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createMarqueeLinksNode, MarqueeLinksData } from './node'

export const INSERT_MARQUEE_LINKS_COMMAND: LexicalCommand<MarqueeLinksData | undefined> = createCommand(
  'INSERT_MARQUEE_LINKS_COMMAND',
)

export const MarqueeLinksPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_MARQUEE_LINKS_COMMAND,
      (payload) => {
        const defaultData: MarqueeLinksData = {
          links: [
            {
              title: '链接标题',
              url: '',
              icon: '',
            },
          ],
          speed: 'medium',
        }

        const marqueeLinksNode = $createMarqueeLinksNode(payload || defaultData)
        $insertNodes([marqueeLinksNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
