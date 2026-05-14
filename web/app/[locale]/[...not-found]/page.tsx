import { notFound } from "next/navigation"

/**
 * Catch-all route for 404s within a locale
 * 
 * This ensures that any invalid URL under a locale (or rewritten to a locale)
 * triggers the localized not-found.tsx while remaining within the localized layout.tsx,
 * thus preserving the Header, Footer, and fonts.
 */
export default function CatchAllNotFound() {
  notFound()
}
