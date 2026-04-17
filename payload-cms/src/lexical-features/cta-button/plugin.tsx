// @ts-nocheck
/**
 * CtaButton Plugin - Command Handler
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createCtaButtonNode, type CtaButtonData } from './node'

export const INSERT_CTA_BUTTON_COMMAND: LexicalCommand<CtaButtonData | undefined> = createCommand(
  'INSERT_CTA_BUTTON_COMMAND',
)

export const CtaButtonPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<CtaButtonData | undefined>(
      INSERT_CTA_BUTTON_COMMAND,
      (payload) => {
        console.log('🔘 INSERT_CTA_BUTTON_COMMAND triggered with payload:', payload)

        const data: CtaButtonData = payload || {
          text: '',
          url: '',
          style: 'primary',
          size: 'medium',
          openInNewTab: false,
        }

        const ctaButtonNode = $createCtaButtonNode(data)
        $insertNodeToNearestRoot(ctaButtonNode)

        console.log('✅ CtaButton node inserted')

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
