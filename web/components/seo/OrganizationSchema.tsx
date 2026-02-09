/**
 * Organization Schema Component
 *
 * Renders JSON-LD structured data for organization
 * Helps Google display logo in search results
 */

import { getSiteConfig, getMediaUrl } from '@/lib/api/site-config'

interface OrganizationSchemaProps {
  locale?: string
}

export async function OrganizationSchema({ locale = 'en' }: OrganizationSchemaProps) {
  const siteConfig = await getSiteConfig()
  const logoUrl = getMediaUrl(siteConfig.logo)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busromhouse.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.siteName || 'Busrom',
    url: siteUrl,
    ...(logoUrl && { logo: logoUrl }),
    description: siteConfig.siteTagline || 'Professional Glass Hardware Manufacturer',
    sameAs: [
      // Add social media links here if available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Chinese'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
