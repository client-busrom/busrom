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
/**
 * Parse script content and determine how to render it
 * Now supports multiple <script> tags and <noscript> tags
 */
function ScriptRenderer({ script, position }: { script: CustomScript; position: string }) {
  // Use generatedContent for template scripts, otherwise use content
  const rawContent = (script.scriptType === 'template' ? script.generatedContent : script.content)?.trim() || ''

  if (!rawContent) {
    return null
  }

  // Determine Next.js Script strategy based on position
  const strategy = position === 'header' ? 'afterInteractive' : 'lazyOnload'

  // Add debug tracking
  const debugCode = getDebugTrackingCode(script, position)

  // Regex to find all script tags
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  const blocks: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let scriptCount = 0

  while ((match = scriptRegex.exec(rawContent)) !== null) {
    // 1. Process static content BEFORE this script tag
    const staticBefore = rawContent.substring(lastIndex, match.index).trim()
    if (staticBefore) {
      if (staticBefore.toLowerCase().includes('<noscript')) {
        blocks.push(
          <div
            key={`noscript-${script.id}-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: staticBefore }}
            style={{ display: 'none' }}
          />
        )
      } else if (position !== 'header') {
        blocks.push(
          <div
            key={`static-${script.id}-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: staticBefore }}
            style={{ display: 'none' }}
          />
        )
      }
    }

    // 2. Process the script tag itself
    const attrs = match[1]
    const body = match[2].trim()
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i)

    if (srcMatch) {
      const src = srcMatch[1]
      const asyncAttr = /\basync\b/i.test(attrs)
      const deferAttr = /\bdefer\b/i.test(attrs)
      blocks.push(
        <Script
          key={`script-${script.id}-${scriptCount++}`}
          id={`page-script-${script.id}-${scriptCount}`}
          src={src}
          strategy={strategy as any}
          async={asyncAttr}
          defer={deferAttr}
        />
      )
    } else if (body) {
      blocks.push(
        <Script
          key={`script-${script.id}-${scriptCount++}`}
          id={`page-script-${script.id}-${scriptCount}`}
          strategy={strategy as any}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )
    }

    lastIndex = scriptRegex.lastIndex
  }

  // 3. Process remaining content AFTER last script tag
  const staticAfter = rawContent.substring(lastIndex).trim()
  if (staticAfter) {
    if (staticAfter.toLowerCase().includes('<noscript')) {
      blocks.push(
        <div
          key={`noscript-after-${script.id}`}
          dangerouslySetInnerHTML={{ __html: staticAfter }}
          style={{ display: 'none' }}
        />
      )
    } else if (position !== 'header') {
      blocks.push(
        <div
          key={`static-after-${script.id}`}
          dangerouslySetInnerHTML={{ __html: staticAfter }}
          style={{ display: 'none' }}
        />
      )
    }
  }

  // Fallback
  if (blocks.length === 0 && rawContent) {
    if (position === 'header') {
      if (rawContent.includes('<meta') || rawContent.includes('<link')) {
        return (
          <>
             <Script
              id={`page-script-debug-${script.id}`}
              strategy={strategy as any}
              dangerouslySetInnerHTML={{ __html: debugCode }}
            />
            <div
              style={{ display: 'none' }}
              dangerouslySetInnerHTML={{ __html: rawContent }}
            />
          </>
        )
      }
      if (!rawContent.includes('<')) {
        return (
          <>
            <Script
              id={`page-script-debug-${script.id}`}
              strategy={strategy as any}
              dangerouslySetInnerHTML={{ __html: debugCode }}
            />
            <Script
              id={`page-script-fallback-${script.id}`}
              strategy={strategy as any}
              dangerouslySetInnerHTML={{ __html: rawContent }}
            />
          </>
        )
      }
    } else {
      return (
        <>
          <Script
            id={`page-script-debug-${script.id}`}
            strategy={strategy as any}
            dangerouslySetInnerHTML={{ __html: debugCode }}
          />
          <div
            id={`page-content-fallback-${script.id}`}
            style={{ display: 'none' }}
            dangerouslySetInnerHTML={{ __html: rawContent }}
          />
        </>
      )
    }
  }

  return (
    <>
      <Script
        id={`page-script-debug-${script.id}`}
        strategy={strategy as any}
        dangerouslySetInnerHTML={{ __html: debugCode }}
      />
      {blocks}
    </>
  )
}
