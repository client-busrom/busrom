// @ts-nocheck
/**
 * ProductReusableBlock Plugin - Registers command for inserting product reusable block nodes
 */

'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'

import { $createProductReusableBlockNode, ProductReusableBlockData } from './node'

export const INSERT_PRODUCT_REUSABLE_BLOCK_COMMAND: LexicalCommand<ProductReusableBlockData | undefined> = createCommand(
  'INSERT_PRODUCT_REUSABLE_BLOCK_COMMAND',
)

export const ProductReusableBlockPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_PRODUCT_REUSABLE_BLOCK_COMMAND,
      (payload) => {
        const defaultData: ProductReusableBlockData = {
          productReusableBlock: '',
        }

        const productReusableBlockNode = $createProductReusableBlockNode(payload || defaultData)
        $insertNodes([productReusableBlockNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
