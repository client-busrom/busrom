import { convertToCDNUrl } from "../cdn-url";
import { resolveAllMedia } from "../media-resolver";
import { flattenLexicalChildren } from "@/lib/lexical-utils";
import { PAGE_SLUGS } from "../constants";

const getCmsUrl = () => {
  if (process.env.CMS_URL) return process.env.CMS_URL;
  if (process.env.NEXT_PUBLIC_CMS_URL) return process.env.NEXT_PUBLIC_CMS_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3002';
  return 'https://cms.busromhouse.com';
};

/**
 * Server-side utility to fetch page content and resolve media.
 * Optimized with Parallel Fetching to reduce TTFB.
 */
export async function fetchPageData(slug: string, locale: string = 'en') {
  const cmsUrl = getCmsUrl();
  const strategy = undefined; 

  const normalize = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return convertToCDNUrl(url, strategy);
    const isMediaPath = url.startsWith('/api/media') || url.startsWith('/media') || /\.(jpg|jpeg|png|gif|svg|webp|avif|pdf|docx|zip)$/i.test(url);
    if (isMediaPath) {
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return convertToCDNUrl(`${cmsUrl}${normalizedPath}`, strategy);
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  const normalizeMediaObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(normalizeMediaObject);
    const newObj = { ...obj };
    for (const key in newObj) {
      if (key === 'url' && typeof newObj[key] === 'string') {
        newObj[key] = normalize(newObj[key]);
      } else if (typeof newObj[key] === 'object') {
        newObj[key] = normalizeMediaObject(newObj[key]);
      }
    }
    return newObj;
  };

  try {
    // 1. Fetch initial Page Data and Navigation Menus in Parallel
    const [pageRes, navRes] = await Promise.all([
      fetch(`${cmsUrl}/api/pages?where[slug][equals]=${slug}&locale=${locale}&depth=2`, { next: { revalidate: 3600 } }),
      fetch(`${cmsUrl}/api/navigation-menus?locale=${locale}&limit=1000&depth=2`, { next: { revalidate: 3600 } })
    ]);

    if (!pageRes.ok) return null;
    const [result, navData] = await Promise.all([
      pageRes.json(),
      navRes.ok ? navRes.json() : { docs: [] }
    ]);

    if (!result.docs?.length) return null;
    const page = result.docs[0];
    const navigationMenus = (navData.docs || []).map(normalizeMediaObject);

    // 2. Resolve Page Media and Scan for Enrichment Needs
    const { mediaData } = await resolveAllMedia(page, cmsUrl, normalize);
    
    let products: any[] = [];
    let series: any[] = [];
    let applications: any[] = [];
    let formConfig: any = null;

    let contentChildren = page.content?.root?.children || page.contentTranslation?.root?.children || [];
    contentChildren = flattenLexicalChildren(contentChildren);

    // Extract all potential IDs for Parallel Fetching
    const manualIds: string[] = [];
    const seriesIds: string[] = [];
    const appIds: string[] = [];
    const uniqueFormIdsSet = new Set<string>();

    const isFormMarker = (node: any) => {
      if (node.type !== 'paragraph') return false;
      const text = node.children?.map((c: any) => c.text).join('').trim().toLowerCase();
      return text === 'contact-form-block';
    };

    contentChildren.forEach((node: any, idx: number) => {
      // Products/Series from carousels
      if (node.type === 'productCarousel') {
        (node.data?.items || []).forEach((it: any) => {
          if (it.selectionMode === 'manual' && it.product) manualIds.push(typeof it.product === 'object' ? it.product.id : it.product);
          if (it.selectionMode === 'auto' && it.productSeries) seriesIds.push(typeof it.productSeries === 'object' ? it.productSeries.id : it.productSeries);
        });
      }
      // Applications from carousels
      if (node.type === 'applicationCarousel') {
        const ids = node.data?.applicationIds || node.data?.applications || [];
        appIds.push(...ids.map((id: any) => typeof id === 'object' ? id.id : id));
      }
      // FAQ categories
      if (node.type === 'faqSelection') {
        (node.data?.categories || []).forEach((cat: any) => {
          (cat.questions || []).forEach((q: any) => {
            if (q.gallery) {
              const gid = typeof q.gallery === 'object' ? q.gallery.id : q.gallery;
              if (gid) appIds.push(String(gid));
            }
          });
        });
      }
      // Form Markers
      if (isFormMarker(node)) {
        for (let i = idx + 1; i < Math.min(idx + 5, contentChildren.length); i++) {
          if (contentChildren[i].type === 'formBlock') {
            const fid = contentChildren[i].data?.formConfig?.id || contentChildren[i].data?.formConfig;
            if (fid) uniqueFormIdsSet.add(String(fid));
            break;
          }
        }
      }
      // Standard FormBlocks
      if (node.type === 'formBlock') {
        const fid = node.data?.formConfig?.id || node.data?.formConfig;
        if (fid) uniqueFormIdsSet.add(String(fid));
      }
    });

    // 3. Parallel Enrichment Fetching
    const fetchPromises: Promise<any>[] = [];

    // Series Fetch
    if (seriesIds.length > 0 || slug === 'product-overview') {
      const sIdsSet = Array.from(new Set(seriesIds));
      // Only select necessary fields for list/overview, exclude heavy contentTemplate
      const seriesSelect = 'name,slug,category,featuredImage,order,isFeatured,description';
      let seriesUrl = `${cmsUrl}/api/product-series?locale=${locale}&limit=1000&depth=1&select=${seriesSelect}`;
      if (sIdsSet.length > 0 && slug !== 'product-overview') seriesUrl += `&where[id][in]=${sIdsSet.join(',')}`;
      fetchPromises.push(fetch(seriesUrl, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null));
    } else {
      fetchPromises.push(Promise.resolve(null));
    }

    // Products Fetch
    const mIdsSet = Array.from(new Set(manualIds));
    const sIdsSetForProds = Array.from(new Set(seriesIds));
    if (mIdsSet.length > 0 || sIdsSetForProds.length > 0) {
      // CRITICAL: Exclude heavy contentTemplate (rich text) and linkedForm for performance
      const productSelect = 'name,slug,sku,showImage,series,category,attributePage,shortDescription';
      let productUrl = `${cmsUrl}/api/products?locale=${locale}&limit=1000&depth=1&select=${productSelect}`;
      if (mIdsSet.length > 0 && sIdsSetForProds.length > 0) {
        productUrl += `&where[or][0][id][in]=${mIdsSet.join(',')}&where[or][1][series][in]=${sIdsSetForProds.join(',')}`;
      } else if (mIdsSet.length > 0) {
        productUrl += `&where[id][in]=${mIdsSet.join(',')}`;
      } else if (sIdsSetForProds.length > 0) {
        productUrl += `&where[series][in]=${sIdsSetForProds.join(',')}`;
      }
      fetchPromises.push(fetch(productUrl, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null));
    } else {
      fetchPromises.push(Promise.resolve(null));
    }

    // Applications Fetch
    const aIdsSet = Array.from(new Set(appIds));
    if (aIdsSet.length > 0) {
      const appUrl = `${cmsUrl}/api/applications?locale=${locale}&where[id][in]=${aIdsSet.join(',')}&depth=1`;
      fetchPromises.push(fetch(appUrl, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null));
    } else {
      fetchPromises.push(Promise.resolve(null));
    }

    // Form Configs Fetch (Parallel inside Parallel)
    const uniqueFormIds = Array.from(uniqueFormIdsSet);
    const formConfigsMap: Record<string, any> = {};
    if (uniqueFormIds.length > 0) {
      const formFetchPromise = Promise.all(uniqueFormIds.map(async (id) => {
        try {
          const res = await fetch(`${cmsUrl}/api/form-configs/${id}?depth=2&draft=false&locale=${locale}&trash=false`, { next: { revalidate: 3600 } });
          if (res.ok) formConfigsMap[id] = normalizeMediaObject(await res.json());
        } catch (e) {}
      }));
      fetchPromises.push(formFetchPromise.then(() => formConfigsMap));
    } else {
      fetchPromises.push(Promise.resolve({}));
    }

    // Wait for all enrichment data
    const [seriesResult, productsResult, applicationsResult, formsMap] = await Promise.all(fetchPromises);

    series = (seriesResult?.docs || []).map(normalizeMediaObject);
    products = (productsResult?.docs || []).map(normalizeMediaObject);
    applications = (applicationsResult?.docs || []).map(normalizeMediaObject);
    formConfig = Object.values(formsMap)[0] || null;

    // 4. Parallel Media Resolution for Enriched Data
    const mediaResolutionPromises: Promise<any>[] = [];
    if (products.length > 0) mediaResolutionPromises.push(resolveAllMedia(products, cmsUrl, normalize));
    if (series.length > 0) mediaResolutionPromises.push(resolveAllMedia(series, cmsUrl, normalize));
    if (applications.length > 0) mediaResolutionPromises.push(resolveAllMedia(applications, cmsUrl, normalize));

    const mediaResResults = await Promise.all(mediaResolutionPromises);
    mediaResResults.forEach(res => {
      if (res?.mediaData) Object.assign(mediaData, res.mediaData);
    });

    // 5. Finalize Lexical Tree with FormConfigs
    contentChildren.forEach((node: any, idx: number) => {
      if (isFormMarker(node)) {
        for (let i = idx + 1; i < Math.min(idx + 5, contentChildren.length); i++) {
          if (contentChildren[i].type === 'formBlock') {
            const fid = contentChildren[i].data?.formConfig?.id || contentChildren[i].data?.formConfig;
            if (fid && formsMap[fid]) contentChildren[i].data.formConfig = formsMap[fid];
            break;
          }
        }
      }
      if (node.type === 'formBlock') {
        const fid = node.data?.formConfig?.id || node.data?.formConfig;
        if (fid && formsMap[fid]) node.data.formConfig = formsMap[fid];
      }
    });

    const resolvedPage = { ...page };
    if (resolvedPage.content?.root?.children) resolvedPage.content.root.children = contentChildren;
    if (resolvedPage.contentTranslation?.root?.children) resolvedPage.contentTranslation.root.children = contentChildren;

    return { ...resolvedPage, mediaData, products, series, applications, formConfig, navigationMenus };
  } catch (e) {
    console.error(`Error fetching page data for ${slug}:`, e);
    return null;
  }
}
