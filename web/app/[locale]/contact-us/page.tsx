import type { Locale } from "@/i18n.config"
import { ContactPageClient } from "./ContactPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Busrom",
  description: "Get in touch with Busrom for high-quality stainless steel glass hardware solutions",
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return <ContactPageClient locale={locale} />
}
