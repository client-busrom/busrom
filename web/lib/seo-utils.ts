import { locales, defaultLocale } from '@/i18n.config'

/**
 * Generate hreflang alternates for a given path across all supported locales
 */
export function getAlternateLanguages(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'
  const alternates: Record<string, string> = {}

  // Ensure path doesn't start with double slash if it's empty
  const sanitizedPath = path === '/' ? '' : path

  locales.forEach((loc) => {
    // English (default) has no prefix
    if (loc === defaultLocale) {
      alternates[loc] = `${siteUrl}${sanitizedPath}`
    } else {
      alternates[loc] = `${siteUrl}/${loc}${sanitizedPath}`
    }
  })

  // Add x-default pointing to English
  alternates['x-default'] = `${siteUrl}${sanitizedPath}`

  return alternates
}
