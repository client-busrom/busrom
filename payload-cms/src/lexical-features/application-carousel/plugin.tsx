// @ts-nocheck
/**
 * Application Carousel Plugin - Registers command for inserting application carousel nodes
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createApplicationCarouselNode, ApplicationCarouselData } from './node'

export const INSERT_APPLICATION_CAROUSEL_COMMAND: LexicalCommand<ApplicationCarouselData | undefined> = createCommand(
  'INSERT_APPLICATION_CAROUSEL_COMMAND',
)

export const ApplicationCarouselPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    console.log('🚀 ApplicationCarouselPlugin: registering command')
    console.log('🚀 ApplicationCarouselPlugin: editor key:', editor._key)
    console.log('🚀 ApplicationCarouselPlugin: command object:', INSERT_APPLICATION_CAROUSEL_COMMAND)
    return editor.registerCommand(
      INSERT_APPLICATION_CAROUSEL_COMMAND,
      (payload) => {
        console.log('🚀 ApplicationCarouselPlugin: command received, payload:', payload)
        const defaultData: ApplicationCarouselData = {
          applications: [],
          autoplay: true,
          interval: 5,
          itemsPerView: 3,
          showTitle: true,
          showDescription: true,
        }

        const node = $createApplicationCarouselNode(payload || defaultData)
        console.log('🚀 ApplicationCarouselPlugin: node created:', node)
        $insertNodes([node])
        console.log('🚀 ApplicationCarouselPlugin: node inserted')
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
