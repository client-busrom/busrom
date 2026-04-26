/**
 * SeoAttributeDistributor Component
 *
 * Distributes SEO keywords across existing HTML element attributes
 * to improve SEO without visible changes or black-hat techniques.
 *
 * Strategy:
 * - Prioritize filling image alt attributes with keywords (overwrite original)
 * - Exclude header elements to avoid exposing keywords via tooltips
 * - Use remaining keywords for other attributes
 */

'use client'

import { useEffect } from 'react'
import type { KeywordDistribution } from '@/lib/api/seo-settings'

interface SeoAttributeDistributorProps {
  distribution: KeywordDistribution
}

// No fixed limit - dynamically calculate based on available keywords and images

/**
 * Client component that monitors keyword distribution status.
 * DOM modifications are handled via SSR.
 */
export function SeoAttributeDistributor({ distribution }: SeoAttributeDistributorProps) {
  // 关键词分发现在已通过 SSR 在解析器阶段完成。
  // 客户端不再需要动态修改 DOM 属性，这样可以避免水合冲突并提高性能。
  useEffect(() => {
    if (distribution.totalKeywords > 0) {
      console.log(`[SEO] SSR Keyword distribution active. Total keywords in pool: ${distribution.totalKeywords}`);
    }
  }, [distribution]);

  // This component doesn't render anything visible
  return null
}

/**
 * Server-side component that only injects sr-only CSS
 */
export function SeoMetaInjector({ distribution }: SeoAttributeDistributorProps) {
  if (distribution.totalKeywords === 0) {
    return null
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          }
        `,
        }}
      />
    </>
  )
}

export default SeoAttributeDistributor
