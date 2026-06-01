/**
 * Iconify API Utilities
 *
 * 用于 IconPicker 组件的 Iconify API 调用工具函数
 * - 搜索图标
 * - 获取图标 SVG
 * - Lucide PascalCase → Iconify 格式转换
 */

/** Popular icon set prefixes */
export const POPULAR_PREFIXES = [
  { value: '', label: 'All / 全部' },
  { value: 'lucide', label: 'Lucide' },
  { value: 'mdi', label: 'Material Design' },
  { value: 'ph', label: 'Phosphor' },
  { value: 'tabler', label: 'Tabler' },
  { value: 'solar', label: 'Solar' },
  { value: 'heroicons', label: 'Heroicons' },
  { value: 'ri', label: 'Remix Icon' },
  { value: 'carbon', label: 'Carbon' },
  { value: 'bi', label: 'Bootstrap' },
  { value: 'ion', label: 'Ionicons' },
]

export interface IconifySearchResult {
  icons: string[]
  total: number
}

/**
 * Search icons via Iconify API
 */
export async function searchIcons(
  query: string,
  limit = 60,
  prefix?: string,
): Promise<IconifySearchResult> {
  if (!query.trim()) return { icons: [], total: 0 }

  const params = new URLSearchParams({
    query: query.trim(),
    limit: limit.toString(),
  })

  if (prefix) {
    params.set('prefix', prefix)
  }

  const qs = params.toString()
  const hosts = ['api.iconify.design', 'api.simplesvg.com', 'api.unisvg.com']

  for (const host of hosts) {
    try {
      const controller = new AbortController()
      // 5 seconds timeout per host
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`https://${host}/search?${qs}`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      return {
        icons: data.icons || [],
        total: data.total || 0,
      }
    } catch (error) {
      console.warn(`Iconify search failed for ${host}:`, error instanceof Error ? error.message : error)
      // Continue to the next host
    }
  }

  return { icons: [], total: 0 }
}

/**
 * Get SVG URL for an icon from Iconify API
 * Format: "prefix:name" → https://api.iconify.design/prefix/name.svg
 */
export function getIconSvgUrl(iconName: string, color?: string): string {
  if (!iconName || !iconName.includes(':')) return ''
  const [prefix, name] = iconName.split(':')
  const params = new URLSearchParams()
  if (color) params.set('color', color)
  const qs = params.toString()
  return `https://api.iconify.design/${prefix}/${name}.svg${qs ? `?${qs}` : ''}`
}

/**
 * Convert PascalCase Lucide name to Iconify format
 * "ArrowRight" → "lucide:arrow-right"
 * "CheckCircle" → "lucide:check-circle"
 */
export function lucideToIconify(name: string): string {
  if (!name) return ''
  // Already in iconify format
  if (name.includes(':')) return name

  // PascalCase → kebab-case
  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

  return `lucide:${kebab}`
}

/**
 * Check if a string is in Iconify format (contains ":")
 */
export function isIconifyFormat(name: string): boolean {
  return !!name && name.includes(':')
}

/**
 * Normalize icon name: auto-detect and convert legacy Lucide PascalCase names
 */
export function normalizeIconName(name: string): string {
  if (!name) return ''
  if (isIconifyFormat(name)) return name
  return lucideToIconify(name)
}
