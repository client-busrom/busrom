/**
 * SeoAttributeDistributor Component
 *
 * Distributes SEO keywords across existing HTML element attributes
 * to improve SEO without visible changes or black-hat techniques.
 *
 * This approach:
 * - Uses legitimate HTML attributes (alt, title, aria-label, etc.)
 * - No hidden content or CSS tricks
 * - Keywords are scattered, making batch copying harder
 * - Complies with Google's webmaster guidelines
 */

'use client'

import { useEffect } from 'react'
import type { KeywordDistribution } from '@/lib/api/seo-settings'

interface SeoAttributeDistributorProps {
  distribution: KeywordDistribution
}

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
    // This prevents hydration mismatch errors
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

    // Helper: Calculate how many keywords per element for optimal distribution
    const calcKeywordsPerElement = (remainingKeywords: number, elementCount: number): number => {
      if (elementCount === 0) return 0
      // Distribute evenly, but not too many per element (max 10 per attribute for readability)
      return Math.min(Math.ceil(remainingKeywords / elementCount), 10)
    }

    // Strategy: Multiple keywords per attribute
    // Each attribute gets multiple keywords joined by commas

    // 1. Image alt attributes - prioritize images without alt, then append to existing
    const imagesNoAlt = Array.from(document.querySelectorAll('img:not([alt])'))
    const imagesWithAlt = Array.from(document.querySelectorAll('img[alt]'))
    const allImages = [...imagesNoAlt, ...imagesWithAlt]

    if (allImages.length > 0) {
      const perImage = calcKeywordsPerElement(keywordPool.length - keywordIndex, allImages.length)
      allImages.forEach(img => {
        const keywords = getNextKeywords(perImage)
        if (keywords.length > 0) {
          const currentAlt = (img as HTMLImageElement).alt
          const newAlt = currentAlt
            ? `${currentAlt}, ${keywords.join(', ')}`
            : keywords.join(', ')
          ;(img as HTMLImageElement).alt = newAlt
        }
      })
    }

    // 2. Link title attributes
    const linksNoTitle = Array.from(document.querySelectorAll('a:not([title])'))
    const linksWithTitle = Array.from(document.querySelectorAll('a[title]'))
    const allLinks = [...linksNoTitle, ...linksWithTitle]

    if (allLinks.length > 0 && keywordIndex < keywordPool.length) {
      const perLink = calcKeywordsPerElement(keywordPool.length - keywordIndex, allLinks.length)
      allLinks.forEach(link => {
        const keywords = getNextKeywords(perLink)
        if (keywords.length > 0) {
          const currentTitle = (link as HTMLAnchorElement).title
          const newTitle = currentTitle
            ? `${currentTitle}, ${keywords.join(', ')}`
            : keywords.join(', ')
          ;(link as HTMLAnchorElement).title = newTitle
        }
      })
    }

    // 3. Image title attributes
    const imagesNoTitle = Array.from(document.querySelectorAll('img:not([title])'))
    const imagesHasTitle = Array.from(document.querySelectorAll('img[title]'))
    const allImagesForTitle = [...imagesNoTitle, ...imagesHasTitle]

    if (allImagesForTitle.length > 0 && keywordIndex < keywordPool.length) {
      const perImage = calcKeywordsPerElement(keywordPool.length - keywordIndex, allImagesForTitle.length)
      allImagesForTitle.forEach(img => {
        const keywords = getNextKeywords(perImage)
        if (keywords.length > 0) {
          const currentTitle = (img as HTMLImageElement).title
          const newTitle = currentTitle
            ? `${currentTitle}, ${keywords.join(', ')}`
            : keywords.join(', ')
          ;(img as HTMLImageElement).title = newTitle
        }
      })
    }

    // 4. ARIA labels for interactive elements (keep single keyword for accessibility)
    const interactiveNoAria = Array.from(
      document.querySelectorAll('button:not([aria-label]), nav a:not([aria-label])')
    )
    const interactiveWithAria = Array.from(
      document.querySelectorAll('button[aria-label], nav a[aria-label]')
    )
    const allInteractive = [...interactiveNoAria, ...interactiveWithAria]

    if (allInteractive.length > 0 && keywordIndex < keywordPool.length) {
      // For aria-label, use fewer keywords per element (max 3) for accessibility
      const perElement = Math.min(calcKeywordsPerElement(keywordPool.length - keywordIndex, allInteractive.length), 3)
      allInteractive.forEach(el => {
        const keywords = getNextKeywords(perElement)
        if (keywords.length > 0) {
          const currentLabel = el.getAttribute('aria-label')
          const newLabel = currentLabel
            ? `${currentLabel}, ${keywords.join(', ')}`
            : keywords.join(', ')
          el.setAttribute('aria-label', newLabel)
        }
      })
    }

    // 5. Input/textarea placeholders (max 5 keywords for readability)
    const inputsNoPlaceholder = Array.from(
      document.querySelectorAll('input[type="text"]:not([placeholder]), textarea:not([placeholder])')
    )
    const inputsWithPlaceholder = Array.from(
      document.querySelectorAll('input[type="text"][placeholder], textarea[placeholder]')
    )
    const allInputs = [...inputsNoPlaceholder, ...inputsWithPlaceholder]

    if (allInputs.length > 0 && keywordIndex < keywordPool.length) {
      const perInput = Math.min(calcKeywordsPerElement(keywordPool.length - keywordIndex, allInputs.length), 5)
      allInputs.forEach(input => {
        const keywords = getNextKeywords(perInput)
        if (keywords.length > 0) {
          const currentPlaceholder = (input as HTMLInputElement | HTMLTextAreaElement).placeholder
          const newPlaceholder = currentPlaceholder
            ? `${currentPlaceholder}, ${keywords.join(', ')}`
            : keywords.join(', ')
          ;(input as HTMLInputElement | HTMLTextAreaElement).placeholder = newPlaceholder
        }
      })
    }

    // 6. Data-category attributes on structural elements
    const structuralElements = Array.from(
      document.querySelectorAll('section, article, div[class*="container"], div[class*="card"]')
    )

    if (structuralElements.length > 0 && keywordIndex < keywordPool.length) {
      const perElement = calcKeywordsPerElement(keywordPool.length - keywordIndex, structuralElements.length)
      structuralElements.forEach(el => {
        const keywords = getNextKeywords(perElement)
        if (keywords.length > 0) {
          el.setAttribute('data-category', keywords.join(', '))
        }
      })
    }

    // 7. Data-label attributes on more generic elements
    const genericElements = Array.from(
      document.querySelectorAll('div, nav, footer, header, main')
    )

    if (genericElements.length > 0 && keywordIndex < keywordPool.length) {
      const perElement = calcKeywordsPerElement(keywordPool.length - keywordIndex, genericElements.length)
      genericElements.forEach(el => {
        const keywords = getNextKeywords(perElement)
        if (keywords.length > 0) {
          el.setAttribute('data-label', keywords.join(', '))
        }
      })
    }

    // 8. Aria-describedby with sr-only elements
    const describableElements = Array.from(
      document.querySelectorAll('section, article, div[class*="wrapper"]')
    )

    if (describableElements.length > 0 && keywordIndex < keywordPool.length) {
      const perElement = calcKeywordsPerElement(keywordPool.length - keywordIndex, describableElements.length)
      describableElements.forEach((el, index) => {
        const keywords = getNextKeywords(perElement)
        if (keywords.length > 0) {
          const id = `seo-desc-${index}`
          el.setAttribute('aria-describedby', id)

          const srOnly = document.createElement('span')
          srOnly.id = id
          srOnly.className = 'sr-only'
          srOnly.textContent = keywords.join(', ')
          el.appendChild(srOnly)
        }
      })
    }

    // 9. Create standalone sr-only labels for any remaining keywords
    // Group remaining keywords into batches (max 20 per sr-only element)
    const mainContent = document.querySelector('main') || document.body
    while (keywordIndex < keywordPool.length) {
      const keywords = getNextKeywords(20)
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
 * No meta keywords tags - all keywords distributed to HTML attributes
 */
export function SeoMetaInjector({ distribution }: SeoAttributeDistributorProps) {
  if (distribution.totalKeywords === 0) {
    return null
  }

  return (
    <>
      {/* Add sr-only CSS if not already present */}
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
