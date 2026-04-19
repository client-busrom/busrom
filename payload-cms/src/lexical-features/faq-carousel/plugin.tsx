import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodes, createCommand, LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import { useEffect } from 'react'
import { $createFaqCarouselNode, FaqCarouselNode } from './node'

export const INSERT_FAQ_CAROUSEL_COMMAND: LexicalCommand<any> = createCommand('INSERT_FAQ_CAROUSEL_COMMAND')

export function FaqCarouselPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([FaqCarouselNode])) {
      throw new Error('FaqCarouselPlugin: FaqCarouselNode not registered on editor')
    }

    return editor.registerCommand(
      INSERT_FAQ_CAROUSEL_COMMAND,
      (payload) => {
        const node = $createFaqCarouselNode(payload || {
          title: { en: 'Trending Questions', zh: '热门问答推荐' },
          items: []
        })
        $insertNodes([node])
        return true
      },
      0
    )
  }, [editor])

  return null
}
