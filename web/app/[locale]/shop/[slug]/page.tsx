import type { Locale } from "@/i18n.config"
import { ProductDetailClient } from "./ProductDetailClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/shop/${slug}`

  return (
    <>
      <PageScripts path={path} pageType="shop_detail" position="header" />
      <PageScripts path={path} pageType="shop_detail" position="body_start" />
      <PageSeoInjector path={path} pageType="shop_detail" locale={locale} />
      <ProductDetailClient locale={locale} slug={slug} />
      <PageScripts path={path} pageType="shop_detail" position="footer" />
    </>
  )
}
