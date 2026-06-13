import { SeoKeywordProvider } from "@/components/product-series/SeoKeywordProvider"
import type { Locale } from "@/i18n.config"
import { ProductDetailClient } from "./ProductDetailClient"
import { ShopPageClient } from "../ShopPageClient"
import { PageScripts } from "@/components/PageScripts"
import { PageSeoInjector } from "@/components/seo"
import { getNonHomePageSeo, buildMetadata } from "@/lib/api/seo-settings"
import { getAlternateLanguages } from "@/lib/seo-utils"
import { getProductBySlug } from "@/lib/api/products"
import { getCategoryBySlug } from "@/lib/api/categories"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/shop/${slug}`

  // First check if this slug is a category
  const category = await getCategoryBySlug(slug, locale)
  if (category) {
    // It's a category page - use category name for title
    const categoryName = category.name?.[locale] || category.name?.en || category.name || slug
    return {
      title: `${categoryName} | Busrom`,
      description: `Browse ${categoryName} products from Busrom`,
      alternates: {
        languages: getAlternateLanguages(path),
      },
    }
  }

  // Not a category, try as product
  const product = await getProductBySlug(slug, locale)

  // SEO Protection: If not translated in current locale, set to noindex
  let robots: any = undefined
  if (locale !== 'en') {
    const checkProduct = await getProductBySlug(slug, locale, true)
    if (!checkProduct || !checkProduct.name) {
      robots = { index: false, follow: true }
    }
  }

  if (!product) {
    return {
      title: 'Product Not Found | Busrom',
    }
  }

  const metaTitle = product.meta?.title || product.name || slug
  const metaDescription = product.meta?.description || (product.name ? `${product.name} - High-quality glass hardware from Busrom` : undefined)

  const defaultMetadata: Metadata = {
    title: metaTitle,
    ...(metaDescription ? { description: metaDescription } : {}),
    alternates: {
      languages: getAlternateLanguages(path),
    },
    ...(robots ? { robots } : {})
  }

  const { setting } = await getNonHomePageSeo(path, 'shop_detail', locale)
  if (setting) {
    setting.metaTitle = undefined
    setting.metaDescription = undefined
  }
  return buildMetadata(setting, defaultMetadata, 'https://www.busromhouse.com', path)
}

export default async function ShopSlugPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const path = `/shop/${slug}`

  // First check if this slug is a category
  const category = await getCategoryBySlug(slug, locale)

  if (category) {
    // Render as shop list page with category pre-selected
    
  let distribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo(path, "shop_list", locale);
    distribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', path, e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={distribution}>
        <PageScripts path={path} pageType="shop_list" position="header" />
        <PageScripts path={path} pageType="shop_list" position="body_start" />
                <ShopPageClient
          locale={locale}
          searchParams={{ category: slug }}
          slugMode={true}
        />
        <PageScripts path={path} pageType="shop_list" position="footer" />
      </SeoKeywordProvider>
    </>
  )
  }

  // Not a category, render as product detail
  const productData = await getProductBySlug(slug, locale)

  if (!productData) {
    notFound()
  }

  // Load localized messages for SSR
  const messages = (await import(`@/messages/${locale}.json`)).default
  const footerHint = messages.shop?.inquiryFooterHint

  let productDistribution = undefined;
  try {
    const { distributedKeywords } = await getNonHomePageSeo(path, "shop_detail", locale);
    productDistribution = distributedKeywords;
  } catch (e) {
    console.error('Failed to fetch seo keywords for', path, e);
  }

  return (
    <>
      <SeoKeywordProvider distribution={productDistribution}>
        <PageScripts path={path} pageType="shop_detail" position="header" />
        <PageScripts path={path} pageType="shop_detail" position="body_start" />
                <ProductDetailClient locale={locale} slug={slug} initialData={productData} footerHint={footerHint} />
        <PageScripts path={path} pageType="shop_detail" position="footer" />
      </SeoKeywordProvider>
    </>
  )
}
