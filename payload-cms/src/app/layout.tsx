import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Busrom CMS',
  description: 'Busrom Content Management System powered by Payload',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
