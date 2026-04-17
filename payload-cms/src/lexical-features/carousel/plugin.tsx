// @ts-nocheck
/**
 * Carousel Plugin - Registers command for inserting carousel nodes
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createCarouselNode, CarouselData } from './node'

export const INSERT_CAROUSEL_COMMAND: LexicalCommand<CarouselData | undefined> = createCommand(
  'INSERT_CAROUSEL_COMMAND',
)

export const CarouselPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_CAROUSEL_COMMAND,
      (payload) => {
        const defaultData: CarouselData = {
          slides: [
            {
              image: '',
              title: '',
              description: '',
              showButton: false,
              buttonText: '',
              buttonLink: '',
              openInNewTab: false,
            },
          ],
          autoplay: true,
          interval: 5,
          itemsPerView: 3,
        }

        const carouselNode = $createCarouselNode(payload || defaultData)
        $insertNodes([carouselNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
