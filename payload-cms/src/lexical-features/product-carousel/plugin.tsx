// @ts-nocheck
/**
 * Product Carousel Plugin - Registers command for inserting product carousel nodes
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createProductCarouselNode, ProductCarouselData } from './node'

export const INSERT_PRODUCT_CAROUSEL_COMMAND: LexicalCommand<ProductCarouselData | undefined> = createCommand(
  'INSERT_PRODUCT_CAROUSEL_COMMAND',
)

export const ProductCarouselPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    console.log('🛒 ProductCarouselPlugin registering on editor:', editor._key)
    console.log('🛒 Command object ID:', INSERT_PRODUCT_CAROUSEL_COMMAND)
    return editor.registerCommand(
      INSERT_PRODUCT_CAROUSEL_COMMAND,
      (payload) => {
        console.log('🛒 Command received!')
        const defaultData: ProductCarouselData = {
          items: [],
          autoplay: true,
          interval: 5,
          itemsPerView: 3,
        }

        const node = $createProductCarouselNode(payload || defaultData)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
