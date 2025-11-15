import type { Locale } from "@/i18n.config"
import { ProductsPageClient } from "./ProductsPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products | Busrom",
  description: "Explore Busrom's comprehensive range of high-quality stainless steel glass hardware solutions",
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // Page ID from CMS
  const pageId = "be2d59b9-dc31-4298-9d33-a956eadd52de"

  return <ProductsPageClient locale={locale} pageId={pageId} />
}
