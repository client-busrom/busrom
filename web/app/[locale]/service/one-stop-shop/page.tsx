import type { Locale } from "@/i18n.config"
import { TemplatePage } from "@/components/templates/TemplatePage"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getPageMetadata } from "@/lib/api/seo-settings"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const defaultMetadata: Metadata = {
    title: "One-Stop Shop | Busrom",
    description: "Complete one-stop solution for all your glass hardware needs",
  }

  return getPageMetadata('/service/one-stop-shop', 'one_stop_shop', locale, defaultMetadata)
}

export default async function OneStopShopPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <>
      <PageScripts path="/service/one-stop-shop" pageType="one_stop_shop" position="header" />
      <PageScripts path="/service/one-stop-shop" pageType="one_stop_shop" position="body_start" />
      <PageSeoInjector path="/service/one-stop-shop" pageType="one_stop_shop" locale={locale} />
      <TemplatePage locale={locale} slug="one-stop-shop" template="ONE_STOP_SHOP" />
      <PageScripts path="/service/one-stop-shop" pageType="one_stop_shop" position="footer" />
    </>
  )
}
