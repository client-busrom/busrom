/**
 * Root Layout
 *
 * This is the root layout for the entire Next.js application.
 * It wraps all pages and defines global HTML structure.
 */

import type { Metadata } from 'next'
import './globals.css'

/**
 * Metadata Configuration
 *
 * Default metadata for SEO (can be overridden on individual pages)
 */
export const metadata: Metadata = {
  title: {
    default: 'Busrom - Professional Glass Hardware Manufacturer',
    template: '%s | Busrom',
  },
  description: 'Leading manufacturer of premium glass hardware products for global markets. Specializing in door handles, hinges, and architectural hardware.',
  keywords: ['glass hardware', 'door handles', 'window hardware', 'architectural hardware', 'stainless steel', 'brass hardware'],
  authors: [{ name: 'Busrom' }],
  creator: 'Busrom',
  publisher: 'Busrom',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-gold-b.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-gold-b.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Busrom',
    title: 'Busrom - Professional Glass Hardware Manufacturer',
    description: 'Leading manufacturer of premium glass hardware products for global markets.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Busrom - Professional Glass Hardware Manufacturer',
    description: 'Leading manufacturer of premium glass hardware products for global markets.',
  },
  verification: {
    // Add Google Search Console verification code
    // google: 'your-google-verification-code',
  },
}

/**
 * Root Layout Component
 *
 * This is a pass-through layout. The actual html/body structure
 * is defined in app/[locale]/layout.tsx to support i18n.
 *
 * @param children - Child components to render
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
