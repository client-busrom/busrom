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
 * Client component that distributes keywords into existing page elements
 * Runs after page hydration to avoid hydration mismatches
 */
export function SeoAttributeDistributor({ distribution }: SeoAttributeDistributorProps) {
  useEffect(() => {
    if (distribution.totalKeywords === 0) {
      return
    }

    // Delay execution to ensure React hydration is complete
    const timeoutId = setTimeout(() => {
      distributeKeywords()
    }, 100)

    return () => clearTimeout(timeoutId)

    function distributeKeywords() {
      // Collect all keywords into a single pool
      const keywordPool = [
        ...distribution.imgAlts,
        ...distribution.linkTitles,
        ...distribution.ariaLabels,
        ...distribution.ariaDescribedby,
        ...distribution.imgTitles,
        ...distribution.placeholders,
        ...distribution.srOnlyLabels,
        ...distribution.dataAttributes,
        ...distribution.metaTags,
      ]

      let keywordIndex = 0

      // Helper: Get next N keywords from pool
      const getNextKeywords = (count: number): string[] => {
        const keywords: string[] = []
        for (let i = 0; i < count && keywordIndex < keywordPool.length; i++) {
          keywords.push(keywordPool[keywordIndex++])
        }
        return keywords
      }

      // Helper: Check if element is inside header
      const isInsideHeader = (el: Element): boolean => {
        return el.closest('header') !== null
      }

      // ============================================================
      // 1. IMAGE ALT - Primary target, fill as much as possible
      // Exclude header images, overwrite original alt
      // Dynamic calculation: distribute ALL keywords evenly across images
      // ============================================================
      const allImages = Array.from(document.querySelectorAll('img'))
        .filter(img => !isInsideHeader(img))

      if (allImages.length > 0 && keywordIndex < keywordPool.length) {
        // Dynamic: calculate keywords per image based on total keywords and image count
        const totalKeywords = keywordPool.length
        const keywordsPerImage = Math.ceil(totalKeywords / allImages.length)

        allImages.forEach(img => {
          const keywords = getNextKeywords(keywordsPerImage)
          if (keywords.length > 0) {
            // Overwrite alt completely with keywords
            ;(img as HTMLImageElement).alt = keywords.join(', ')
          }
        })
      }

      // ============================================================
      // 2. IMAGE TITLE - Secondary, use remaining keywords
      // Exclude header images
      // ============================================================
      const imagesForTitle = Array.from(document.querySelectorAll('img'))
        .filter(img => !isInsideHeader(img))

      if (imagesForTitle.length > 0 && keywordIndex < keywordPool.length) {
        const remainingKeywords = keywordPool.length - keywordIndex
        const keywordsPerImage = Math.ceil(remainingKeywords / imagesForTitle.length)

        imagesForTitle.forEach(img => {
          const keywords = getNextKeywords(keywordsPerImage)
          if (keywords.length > 0) {
            ;(img as HTMLImageElement).title = keywords.join(', ')
          }
        })
      }

      // ============================================================
      // 3. LINK TITLE - Exclude header links (avoid tooltip exposure)
      // ============================================================
      const links = Array.from(document.querySelectorAll('a'))
        .filter(link => !isInsideHeader(link))

      if (links.length > 0 && keywordIndex < keywordPool.length) {
        const remainingKeywords = keywordPool.length - keywordIndex
        const keywordsPerLink = Math.min(
          Math.ceil(remainingKeywords / links.length),
          10
        )

        links.forEach(link => {
          const keywords = getNextKeywords(keywordsPerLink)
          if (keywords.length > 0) {
            ;(link as HTMLAnchorElement).title = keywords.join(', ')
          }
        })
      }

      // ============================================================
      // 4. ARIA LABELS - For buttons/interactive elements
      // Exclude header elements
      // ============================================================
      const interactiveElements = Array.from(
        document.querySelectorAll('button, [role="button"]')
      ).filter(el => !isInsideHeader(el))

      if (interactiveElements.length > 0 && keywordIndex < keywordPool.length) {
        const remainingKeywords = keywordPool.length - keywordIndex
        const keywordsPerElement = Math.min(
          Math.ceil(remainingKeywords / interactiveElements.length),
          5
        )

        interactiveElements.forEach(el => {
          const keywords = getNextKeywords(keywordsPerElement)
          if (keywords.length > 0) {
            el.setAttribute('aria-label', keywords.join(', '))
          }
        })
      }

      // ============================================================
      // 5. DATA ATTRIBUTES - On structural elements
      // ============================================================
      const structuralElements = Array.from(
        document.querySelectorAll('section, article, main')
      )

      if (structuralElements.length > 0 && keywordIndex < keywordPool.length) {
        const remainingKeywords = keywordPool.length - keywordIndex
        const keywordsPerElement = Math.min(
          Math.ceil(remainingKeywords / structuralElements.length),
          20
        )

        structuralElements.forEach(el => {
          const keywords = getNextKeywords(keywordsPerElement)
          if (keywords.length > 0) {
            el.setAttribute('data-keywords', keywords.join(', '))
          }
        })
      }

      // ============================================================
      // 6. SR-ONLY SPANS - For any remaining keywords
      // ============================================================
      const mainContent = document.querySelector('main') || document.body
      while (keywordIndex < keywordPool.length) {
        const keywords = getNextKeywords(30)
        if (keywords.length > 0) {
          const srOnly = document.createElement('span')
          srOnly.className = 'sr-only'
          srOnly.textContent = keywords.join(', ')
          mainContent.appendChild(srOnly)
        }
      }

    } // end of distributeKeywords function
  }, [distribution])

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
