/**
 * Global Scripts Component
 *
 * Fetches and renders only GLOBAL custom scripts from CMS.
 * Supports:
 * - Inline scripts (<script>...</script>)
 * - External scripts (<script src="..."></script>)
 * - Other HTML elements (noscript, img pixels, etc.)
 *
 * Security Features:
 * - All scripts are validated before rendering
 * - External domains must be in whitelist
 * - Dangerous patterns are blocked
 * - Template-based scripts are pre-approved
 *
 * Page-specific scripts should use the PageScripts component.
 */

import Script from 'next/script'
import { getValidatedScripts, type CustomScript } from '@/lib/api/custom-scripts'

interface GlobalScriptsProps {
  position: 'header' | 'body_start' | 'footer'
}

/**
 * Server component that fetches and renders global custom scripts
 * Only validated scripts are rendered (security check passed)
 */
export async function GlobalScripts({ position }: GlobalScriptsProps) {
  try {
    // Use getValidatedScripts instead of getAllCustomScripts for security
    const validatedScripts = await getValidatedScripts()

    // Filter only global scripts for the specified position
    const globalScripts = validatedScripts.filter(
      script =>
        script.isEnabled &&
        script.scope === 'global' &&
        script.scriptPosition === position
    )

    // Sort by priority (higher first)
    globalScripts.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    if (globalScripts.length === 0) {
      return null
    }

    return (
      <>
        {globalScripts.map(script => (
          <ScriptRenderer key={script.id} script={script} position={position} />
        ))}
      </>
    )
  } catch (error) {
    console.error('[GlobalScripts] Error loading scripts:', error)
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
    // Extract additional attributes
    const asyncAttr = /\basync\b/i.test(content)
    const deferAttr = /\bdefer\b/i.test(content)

    return (
      <>
        {/* Debug tracking script */}
        <Script
          id={`custom-script-debug-${script.id}`}
          strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
          dangerouslySetInnerHTML={{ __html: debugCode }}
        />
        <Script
          id={`custom-script-${script.id}`}
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
      // Combine debug tracking with inline code
      const combinedCode = debugCode + '\n' + inlineCode
      return (
        <Script
          id={`custom-script-${script.id}`}
          strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
          dangerouslySetInnerHTML={{ __html: combinedCode }}
        />
      )
    }
  }

  // For non-script content (noscript, img pixels, etc.), render as raw HTML
  // This needs to be done differently based on position
  if (!content.includes('<script')) {
    return (
      <>
        <Script
          id={`custom-script-debug-${script.id}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: debugCode }}
        />
        <div
          id={`custom-content-${script.id}`}
          data-script-name={script.name}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ display: 'none' }}
        />
      </>
    )
  }

  // Fallback: treat as inline script code
  const combinedCode = debugCode + '\n' + content
  return (
    <Script
      id={`custom-script-${script.id}`}
      strategy={strategy as 'beforeInteractive' | 'afterInteractive'}
      dangerouslySetInnerHTML={{ __html: combinedCode }}
    />
  )
}
