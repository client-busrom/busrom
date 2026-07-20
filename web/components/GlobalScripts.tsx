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
 * Consent Gating (GDPR):
 * - Analytics scripts (GA4, GTM): Load immediately to receive consent signals
 * - Marketing scripts (Clarity, UET, Meta, etc.): Only load after marketing consent
 *
 * Page-specific scripts should use the PageScripts component.
 */

import Script from 'next/script'
import { getValidatedScripts, type CustomScript } from '@/lib/api/custom-scripts'
import { ConsentAwareScript } from '@/components/consent/ConsentAwareScript'

/** Analytics 模板类型：这些脚本需要立即加载以便接收 consent 信号 */
const ANALYTICS_TEMPLATES = new Set([
  'google_analytics_4',
  'google_tag_manager',
  'google_tag_manager_noscript',
])

/** 判断脚本是否属于 analytics 类（不需要 consent 门控） */
function isAnalyticsScript(script: CustomScript): boolean {
  if (script.scriptType !== 'template') return false
  return ANALYTICS_TEMPLATES.has(script.templateType || '')
}

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
 * Now supports multiple <script> tags and <noscript> tags
 */
function ScriptRenderer({ script, position }: { script: CustomScript; position: string }) {
  // Use generatedContent for template scripts, otherwise use content
  const rawContent = (script.scriptType === 'template' ? script.generatedContent : script.content)?.trim() || ''

  if (!rawContent) {
    return null
  }

  // Determine Next.js Script strategy based on position
  // 'beforeInteractive' is only for scripts that MUST load before hydration
  // 'afterInteractive' is better for most tracking scripts
  const strategy = position === 'header' ? 'afterInteractive' : 'lazyOnload'

  // 决定使用哪个 Script 组件：analytics 脚本用普通 Script，marketing 脚本用 ConsentAwareScript
  const needsConsent = !isAnalyticsScript(script)
  const ScriptComponent = needsConsent ? ConsentAwareScript : Script
  const consentProps = needsConsent ? { purpose: 'marketing' as const } : {}

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
      // Check if it's a noscript tag
      if (staticBefore.toLowerCase().includes('<noscript')) {
        blocks.push(
          <div
            key={`noscript-${script.id}-${lastIndex}`}
            dangerouslySetInnerHTML={{ __html: staticBefore }}
            style={{ display: 'none' }}
          />
        )
      } else if (position !== 'header') {
        // Only render other static HTML outside header (to avoid invalid HTML in head)
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
        <ScriptComponent
          key={`script-${script.id}-${scriptCount++}`}
          id={`custom-script-${script.id}-${scriptCount}`}
          src={src}
          strategy={strategy as any}
          async={asyncAttr}
          defer={deferAttr}
          {...consentProps}
        />
      )
    } else if (body) {
      blocks.push(
        <ScriptComponent
          key={`script-${script.id}-${scriptCount++}`}
          id={`custom-script-${script.id}-${scriptCount}`}
          strategy={strategy as any}
          dangerouslySetInnerHTML={{ __html: body }}
          {...consentProps}
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

  // If no scripts were found by regex, but there is content, fallback to raw injection
  if (blocks.length === 0 && rawContent) {
    if (position === 'header') {
      // In header, if it's not a script, we only allow it if it looks like meta/link
      if (rawContent.includes('<meta') || rawContent.includes('<link')) {
        return (
          <>
             <Script
              id={`custom-script-debug-${script.id}`}
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
      // Fallback for header: try to treat whole thing as script body if it doesn't have tags
      if (!rawContent.includes('<')) {
        return (
          <>
            <Script
              id={`custom-script-debug-${script.id}`}
              strategy={strategy as any}
              dangerouslySetInnerHTML={{ __html: debugCode }}
            />
            <ScriptComponent
              id={`custom-script-fallback-${script.id}`}
              strategy={strategy as any}
              dangerouslySetInnerHTML={{ __html: rawContent }}
              {...consentProps}
            />
          </>
       )
      }
    } else {
      // Outside header, just inject in a div
      return (
        <>
          <Script
            id={`custom-script-debug-${script.id}`}
            strategy={strategy as any}
            dangerouslySetInnerHTML={{ __html: debugCode }}
          />
          <div
            id={`custom-content-fallback-${script.id}`}
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
        id={`custom-script-debug-${script.id}`}
        strategy={strategy as any}
        dangerouslySetInnerHTML={{ __html: debugCode }}
      />
      {blocks}
    </>
  )
}
