/**
 * Root Page (/)
 *
 * This page handles the root URL and redirects to the default language.
 * All actual content is served through the [locale] dynamic route.
 */

import { redirect } from 'next/navigation'

/**
 * Root Page Component
 *
 * Automatically redirects to the default language (/en)
 * This ensures all content is served through localized routes.
 */
export default function RootPage() {
  // Default locale (can be changed based on user's browser language or preferences)
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en'

  // Redirect to default locale
  redirect(`/${defaultLocale}`)
}
