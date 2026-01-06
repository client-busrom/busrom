/**
 * Page Scripts Component
 *
 * Renders custom scripts that match the current page based on:
 * - page_type: matches specific page types (home, blog, product, etc.)
 * - exact_path: matches exact URL path
 * - path_pattern: matches URL pattern with wildcards
 *
 * This component should be used in individual page components,
 * NOT in the root layout (use GlobalScripts for that).
 */

import Script from 'next/script'
import { getMatchingScripts, type CustomScript } from '@/lib/api/custom-scripts'

interface PageScriptsProps {
  path: string
  pageType?: string
  position: 'header' | 'body_start' | 'footer'
}

/**
 * Server component that renders page-specific scripts
 */
export async function PageScripts({ path, pageType, position }: PageScriptsProps) {
  try {
    const scripts = await getMatchingScripts(path, pageType)

    // Get scripts for the specified position, excluding global (handled by GlobalScripts)
    const positionKey = position === 'body_start' ? 'bodyStart' : position
    const pageScripts = scripts[positionKey as keyof typeof scripts].filter(
      script => script.scope !== 'global' // Global scripts are handled by GlobalScripts
    )

    if (pageScripts.length === 0) {
      return null
    }

    return (
      <>
        {pageScripts.map(script => (
          <ScriptRenderer key={script.id} script={script} position={position} />
        ))}
      </>
    )
  } catch (error) {
    console.error('[PageScripts] Error loading scripts:', error)
    return null
  }
}

/**
 * Generate debug tracking code for script loading
 */
function getDebugTrackingCode(script: CustomScript, position: string): string {
  return `
    (function() {
      if (typeof window !== 'undefined') {
        window.__LOADED_SCRIPTS__ = window.__LOADED_SCRIPTS__ || [];
        window.__LOADED_SCRIPTS__.push({
          id: '${script.id}',
          name: '${script.name?.replace(/'/g, "\\'")}',
          position: '${position}',
          scope: '${script.scope}',
          template: '${script.templateType || ''}',
          status: 'loaded'
        });
      }
    })();
  `
}

/**
 * Parse script content and determine how to render it
 */
function ScriptRenderer({ script, position }: { script: CustomScript; position: string }) {
  // Use generatedContent for template scripts, otherwise use content
  const content = (script.scriptType === 'template' ? script.generatedContent : script.content)?.trim() || ''

  if (!content) {
    return null
  }

  // Determine Next.js Script strategy based on position
  const strategy = position === 'header' ? 'beforeInteractive' : 'afterInteractive'

  // Add debug tracking
  const debugCode = getDebugTrackingCode(script, position)

  // Check for external script with src attribute
  const externalMatch = content.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/i)
  if (externalMatch) {
    const src = externalMatch[1]
    const asyncAttr = /\basync\b/i.test(content)
    const deferAttr = /\bdefer\b/i.test(content)

    return (
      <>
        <Script
          id={`page-script-debug-${script.id}`}
          strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
          dangerouslySetInnerHTML={{ __html: debugCode }}
        />
        <Script
          id={`page-script-${script.id}`}
          src={src}
          strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
          async={asyncAttr}
          defer={deferAttr}
        />
      </>
    )
  }

  // Check for inline script
  const inlineMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  if (inlineMatch) {
    const inlineCode = inlineMatch[1].trim()
    if (inlineCode) {
      const combinedCode = debugCode + '\n' + inlineCode
      return (
        <Script
          id={`page-script-${script.id}`}
          strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
          dangerouslySetInnerHTML={{ __html: combinedCode }}
        />
      )
    }
  }

  // For non-script content (noscript, img pixels, etc.)
  if (!content.includes('<script')) {
    return (
      <>
        <Script
          id={`page-script-debug-${script.id}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: debugCode }}
        />
        <div
          id={`page-content-${script.id}`}
          data-script-name={script.name}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ display: 'none' }}
        />
      </>
    )
  }

  // Fallback
  const combinedCode = debugCode + '\n' + content
  return (
    <Script
      id={`page-script-${script.id}`}
      strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
      dangerouslySetInnerHTML={{ __html: combinedCode }}
    />
  )
}
