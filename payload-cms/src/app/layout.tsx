import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Busrom CMS',
  description: 'Busrom Content Management System powered by Payload',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
