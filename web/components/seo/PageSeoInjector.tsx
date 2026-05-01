/**
 * PageSeoInjector - Server Component
 *
 * Fetches distributed SEO keywords and injects them into page attributes.
 * Use this component in page layouts to enable intelligent keyword distribution.
 *
 * This new approach:
 * - Distributes keywords across existing HTML attributes
 * - No hidden content or black-hat techniques
 * - Complies with Google's webmaster guidelines
 * - Makes keyword copying harder for competitors
 *
 * Usage:
 * ```tsx
 * // In any page.tsx
 * import { PageSeoInjector } from '@/components/seo/PageSeoInjector'
 *
 * export default async function MyPage() {
 *   return (
 *     <>
 *       <PageSeoInjector path="/my-page" pageType="product_series_detail" locale="en" />
 *       <main>...</main>
 *     </>
 *   )
 * }
 * ```
 */

import { getHomePageSeo, getNonHomePageSeo } from "@/lib/api/seo-settings";
import { SeoAttributeDistributor, SeoMetaInjector } from "./SeoHiddenInjector";

interface PageSeoInjectorProps {
  path: string;
  pageType?: string;
  locale?: string;
  isHomePage?: boolean;
}

/**
 * Server component that fetches distributed keywords and injects them
 * Uses new global-based priority logic:
 * - Homepage: global title/description + all matching keywords distributed
 * - Other pages: best match or global fallback
 */
export async function PageSeoInjector({
  path,
  pageType,
  locale = "en",
  isHomePage = false,
}: PageSeoInjectorProps) {
  // Use different logic for homepage vs other pages
  const { distributedKeywords } = isHomePage
    ? await getHomePageSeo(locale)
    : await getNonHomePageSeo(path, pageType, locale);

  // Skip rendering if no keywords
  if (distributedKeywords.totalKeywords === 0) {
    return null;
  }

  return (
    <>
      {/* Server-rendered meta tags */}
      <SeoMetaInjector distribution={distributedKeywords} />
      {/* Client-side attribute distribution */}
      <SeoAttributeDistributor distribution={distributedKeywords} />
    </>
  );
}

export default PageSeoInjector;
