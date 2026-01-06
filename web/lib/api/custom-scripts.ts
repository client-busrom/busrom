/**
 * Custom Scripts API
 *
 * Fetches custom scripts from Payload CMS and matches them based on
 * current page path and type.
 *
 * Security Features:
 * - Domain whitelist validation for external scripts
 * - Dangerous pattern detection
 * - Template-based scripts are pre-approved and bypass validation
 */

// CMS URL for API calls
const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || 'http://localhost:3002')

// ============================================================================
// Security: Allowed external script domains (whitelist)
// Must match the list in payload-cms/src/collections/CustomScripts.ts
// ============================================================================
const ALLOWED_SCRIPT_DOMAINS = [
  // Analytics
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'googleads.g.doubleclick.net',
  // Facebook/Meta
  'connect.facebook.net',
  'www.facebook.com',
  // TikTok
  'analytics.tiktok.com',
  's.tiktok.com',
  // Microsoft
  'clarity.ms',
  'www.clarity.ms',
  'bat.bing.com',
  // Hotjar
  'static.hotjar.com',
  'script.hotjar.com',
  // Other common analytics
  'cdn.segment.com',
  'cdn.amplitude.com',
  'cdn.mxpnl.com', // Mixpanel
  'plausible.io',
  'js.hs-scripts.com', // HubSpot
  'js.hsforms.net',
  'snap.licdn.com', // LinkedIn
  'static.ads-twitter.com', // Twitter
  'www.redditstatic.com', // Reddit
  'widget.intercom.io', // Intercom
  'js.intercomcdn.com',
]

// ============================================================================
// Security: Dangerous patterns to block
// ============================================================================
const DANGEROUS_PATTERNS = [
  /document\.cookie/i,           // Cookie theft
  /localStorage\s*\./i,          // localStorage access
  /sessionStorage\s*\./i,        // sessionStorage access
  /eval\s*\(/i,                  // eval() execution
  /Function\s*\(/i,              // Function constructor
  /innerHTML\s*=/i,              // DOM manipulation (except for known safe patterns)
  /outerHTML\s*=/i,              // DOM manipulation
  /document\.write/i,            // document.write (except for known patterns)
  /\.src\s*=\s*['"`][^'"]*\$/i,  // Dynamic src with template literals
  /window\.location\s*=/i,       // Redirect
  /location\.href\s*=/i,         // Redirect
  /location\.replace/i,          // Redirect
  /<iframe[^>]*src\s*=\s*["'](?!https:\/\/(www\.googletagmanager\.com|www\.facebook\.com))/i, // Non-whitelisted iframes
  /fetch\s*\(\s*['"`](?!https:\/\/(www\.google|connect\.facebook|analytics\.))/i, // Non-whitelisted fetch
  /XMLHttpRequest/i,             // XHR requests
  /new\s+WebSocket/i,            // WebSocket connections
  /importScripts/i,              // Service worker imports
  /crypto\./i,                   // Crypto API (could be mining)
]

// Known safe patterns that should bypass dangerous pattern check
const SAFE_PATTERNS = [
  /gtag\s*\(/i,                  // Google Tag
  /fbq\s*\(/i,                   // Facebook Pixel
  /ttq\./i,                      // TikTok Pixel
  /dataLayer\.push/i,            // GTM dataLayer
  /hj\s*\(/i,                    // Hotjar
  /clarity\s*\(/i,               // Microsoft Clarity
]

export interface CustomScript {
  id: string
  name: string
  description?: string
  scriptType?: 'template' | 'custom'
  templateType?: string
  templateId?: string
  scriptPosition: 'header' | 'footer' | 'body_start'
  content: string
  generatedContent?: string
  scope: 'global' | 'page_type' | 'exact_path' | 'path_pattern'
  pageType?: string
  exactPath?: string
  pathPattern?: string
  isEnabled: boolean
  priority: number
}

interface CustomScriptsResponse {
  docs: CustomScript[]
  totalDocs: number
}

// Cache for custom scripts (revalidate every 5 minutes)
let scriptsCache: CustomScript[] | null = null
let scriptsCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// ============================================================================
// Security Validation Functions
// ============================================================================

/**
 * Check if a URL's domain is in the whitelist
 */
function isDomainAllowed(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return ALLOWED_SCRIPT_DOMAINS.includes(parsedUrl.hostname)
  } catch {
    return false
  }
}

/**
 * Extract all external script URLs from content
 */
function extractExternalUrls(content: string): string[] {
  const urls: string[] = []

  // Match src attributes in script tags
  const srcMatches = content.matchAll(/src\s*=\s*["']([^"']+)["']/gi)
  for (const match of srcMatches) {
    if (match[1] && match[1].startsWith('http')) {
      urls.push(match[1])
    }
  }

  // Match iframe src
  const iframeMatches = content.matchAll(/<iframe[^>]*src\s*=\s*["']([^"']+)["']/gi)
  for (const match of iframeMatches) {
    if (match[1] && match[1].startsWith('http')) {
      urls.push(match[1])
    }
  }

  return urls
}

/**
 * Check if content contains known safe patterns (analytics SDKs)
 */
function containsSafePatterns(content: string): boolean {
  return SAFE_PATTERNS.some(pattern => pattern.test(content))
}

/**
 * Check if content contains dangerous patterns
 */
function containsDangerousPatterns(content: string): { safe: boolean; reason?: string } {
  // If content contains known safe analytics patterns, be more lenient
  const hasSafePatterns = containsSafePatterns(content)

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      // Skip some patterns for known safe analytics code
      if (hasSafePatterns) {
        // Allow document.write for GTM noscript
        if (pattern.source.includes('document.write') && content.includes('googletagmanager')) {
          continue
        }
        // Allow innerHTML for known analytics
        if (pattern.source.includes('innerHTML') && (content.includes('gtag') || content.includes('fbq'))) {
          continue
        }
      }

      return {
        safe: false,
        reason: `Blocked pattern detected: ${pattern.source}`
      }
    }
  }

  return { safe: true }
}

/**
 * Validate a custom script for security
 * Returns the content if safe, or null if blocked
 */
function validateScript(script: CustomScript): { valid: boolean; content: string | null; reason?: string } {
  // Template-based scripts are pre-approved and safe
  if (script.scriptType === 'template' && script.generatedContent) {
    return { valid: true, content: script.generatedContent }
  }

  const content = script.content || script.generatedContent || ''

  if (!content) {
    return { valid: false, content: null, reason: 'Empty content' }
  }

  // Check external URLs against whitelist
  const externalUrls = extractExternalUrls(content)
  for (const url of externalUrls) {
    if (!isDomainAllowed(url)) {
      console.warn(`[CustomScripts] Blocked script "${script.name}" - unauthorized domain: ${url}`)
      return {
        valid: false,
        content: null,
        reason: `Unauthorized external domain: ${new URL(url).hostname}`
      }
    }
  }

  // Check for dangerous patterns (only for custom scripts, not templates)
  if (script.scriptType === 'custom' || !script.scriptType) {
    const dangerCheck = containsDangerousPatterns(content)
    if (!dangerCheck.safe) {
      console.warn(`[CustomScripts] Blocked script "${script.name}" - ${dangerCheck.reason}`)
      return { valid: false, content: null, reason: dangerCheck.reason }
    }
  }

  return { valid: true, content }
}

/**
 * Fetch all enabled custom scripts from CMS
 */
export async function getAllCustomScripts(): Promise<CustomScript[]> {
  const now = Date.now()

  // Return cached data if still valid
  if (scriptsCache && now - scriptsCacheTime < CACHE_TTL) {
    return scriptsCache
  }

  try {
    const response = await fetch(
      `${CMS_URL}/api/custom-scripts?where[isEnabled][equals]=true&limit=100&sort=-priority`,
      {
        next: { revalidate: 300 }, // 5 minutes
      }
    )

    if (!response.ok) {
      console.error('[CustomScripts] Failed to fetch:', response.status)
      return scriptsCache || []
    }

    const data: CustomScriptsResponse = await response.json()
    scriptsCache = data.docs || []
    scriptsCacheTime = now

    return scriptsCache
  } catch (error) {
    console.error('[CustomScripts] Error fetching scripts:', error)
    return scriptsCache || []
  }
}

/**
 * Get validated scripts - filters out any scripts that fail security validation
 */
export async function getValidatedScripts(): Promise<CustomScript[]> {
  const allScripts = await getAllCustomScripts()

  return allScripts.filter(script => {
    const validation = validateScript(script)
    if (!validation.valid) {
      console.warn(`[CustomScripts] Script "${script.name}" failed validation: ${validation.reason}`)
      return false
    }
    // Update content with validated content
    script.content = validation.content || script.content
    return true
  })
}

/**
 * Match a path against a wildcard pattern
 * Supports:
 * - * matches any single path segment
 * - ** matches any number of path segments
 */
function matchPathPattern(pattern: string, path: string): boolean {
  // Normalize paths
  const normalizedPattern = pattern.replace(/^\/|\/$/g, '')
  const normalizedPath = path.replace(/^\/|\/$/g, '')

  // Convert wildcard pattern to regex
  const regexPattern = normalizedPattern
    .split('/')
    .map(segment => {
      if (segment === '**') return '.*'
      if (segment === '*') return '[^/]+'
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(normalizedPath)
}

/**
 * Get scripts that match the current page
 */
export async function getMatchingScripts(
  path: string,
  pageType?: string
): Promise<{
  header: CustomScript[]
  bodyStart: CustomScript[]
  footer: CustomScript[]
}> {
  const allScripts = await getAllCustomScripts()

  // Normalize path (remove locale prefix if present)
  const normalizedPath = path.replace(/^\/(en|zh|de|fr|es|pt|it|nl|pl|ru|ja|ko|ar|th|vi|id|ms|tr|hi|bn)/, '') || '/'

  const matchingScripts = allScripts.filter(script => {
    if (!script.isEnabled) return false

    switch (script.scope) {
      case 'global':
        return true

      case 'page_type':
        return pageType && script.pageType === pageType

      case 'exact_path':
        return script.exactPath === normalizedPath

      case 'path_pattern':
        return script.pathPattern && matchPathPattern(script.pathPattern, normalizedPath)

      default:
        return false
    }
  })

  // Sort by priority (higher first) and group by position
  const sorted = matchingScripts.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return {
    header: sorted.filter(s => s.scriptPosition === 'header'),
    bodyStart: sorted.filter(s => s.scriptPosition === 'body_start'),
    footer: sorted.filter(s => s.scriptPosition === 'footer'),
  }
}
