/**
 * Hero Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createHeroNode, type HeroData } from './node'

export const INSERT_HERO_COMMAND: LexicalCommand<HeroData | undefined> = createCommand(
  'INSERT_HERO_COMMAND',
)

export const HeroPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<HeroData | undefined>(
      INSERT_HERO_COMMAND,
      (payload) => {

        const data: HeroData = payload || {
          title: '',
          subtitle: '',
          height: 'medium',
        }

        const heroNode = $createHeroNode(data)
        $insertNodeToNearestRoot(heroNode)

        console.log('✅ Hero node inserted')

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
