import { convertToCDNUrl } from "../cdn-url";
import { resolveAllMedia } from "../media-resolver";
import { flattenLexicalChildren } from "@/lib/lexical-utils";

const getCmsUrl = () => {
  if (process.env.CMS_URL) return process.env.CMS_URL;
  if (process.env.NEXT_PUBLIC_CMS_URL) return process.env.NEXT_PUBLIC_CMS_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3002';
  return 'https://cms.busromhouse.com';
};

/**
 * Server-side utility to fetch page content and resolve media.
 */
export async function fetchPageData(slug: string, locale: string = 'en') {
  const cmsUrl = getCmsUrl();
  
  // Note: In Server Components, we don't have easy access to cookies 
  // unless we explicitly pass them or use 'headers' from 'next/headers'. 
  // defaulting to null/undefined or global strategy.
  const strategy = undefined; 

  const normalize = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return convertToCDNUrl(url, strategy);
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return convertToCDNUrl(`${cmsUrl}${normalizedPath}`, strategy);
  };

  try {
    const pageRes = await fetch(`${cmsUrl}/api/pages?where[slug][equals]=${slug}&locale=${locale}&depth=2`, {
      next: { revalidate: 3600 } // Enable ISR by default (1 hour)
    });
    
    if (!pageRes.ok) return null;
    
    const result = await pageRes.json();
    if (!result.docs?.length) return null;
    
    const page = result.docs[0];
    const { mediaData } = await resolveAllMedia(page, cmsUrl, normalize);
    
    // Helper to normalize media in nested objects (products/apps)
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

    // Check if we need products or applications (for One-Stop Shop)
    let products: any[] = [];
    let applications: any[] = [];
    let formConfig: any = null;

    if (slug === 'one-stop-solution' || slug === 'oem-odm' || slug === 'application' || slug === 'our-story' || slug === 'support' || slug === 'contact-us' || slug === 'product-overview') {
      let contentChildren = page.content?.root?.children || page.contentTranslation?.root?.children || [];
      // Flatten children to find nested carousels (especially important for Application template)
      contentChildren = flattenLexicalChildren(contentChildren);

      const productCarouselNodes = contentChildren.filter((n: any) => n.type === 'productCarousel');
      const applicationCarouselNodes = contentChildren.filter((n: any) => n.type === 'applicationCarousel');
      const formBlockNodes = contentChildren.filter((n: any) => n.type === 'formBlock');

      // 1. Fetch Products
      const manualIds: string[] = [];
      const seriesIds: string[] = [];
      productCarouselNodes.forEach((node: any) => {
        (node.data?.items || []).forEach((it: any) => {
          if (it.selectionMode === 'manual' && it.product) manualIds.push(typeof it.product === 'object' ? it.product.id : it.product);
          if (it.selectionMode === 'auto' && it.productSeries) seriesIds.push(typeof it.productSeries === 'object' ? it.productSeries.id : it.productSeries);
        });
      });

      if (manualIds.length > 0 || seriesIds.length > 0) {
        // Use 'limit' instead of 'pageSize' as it's the standard for Payload
        let productUrl = `${cmsUrl}/api/products?locale=${locale}&limit=1000&depth=2`;
        
        const manualIdsSet = Array.from(new Set(manualIds));
        const seriesIdsSet = Array.from(new Set(seriesIds));

        if (manualIdsSet.length > 0 && seriesIdsSet.length > 0) {
          productUrl += `&where[or][0][id][in]=${manualIdsSet.join(',')}&where[or][1][series][in]=${seriesIdsSet.join(',')}`;
        } else if (manualIdsSet.length > 0) {
          productUrl += `&where[id][in]=${manualIdsSet.join(',')}`;
        } else if (seriesIdsSet.length > 0) {
          productUrl += `&where[series][in]=${seriesIdsSet.join(',')}`;
        }
        
        const prodRes = await fetch(productUrl, { next: { revalidate: 3600 } });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          products = (prodData.docs || []).map(normalizeMediaObject);
        }
      }

      // 2. Fetch Applications
      const appIds: string[] = [];
      applicationCarouselNodes.forEach((node: any) => {
        const ids = node.data?.applicationIds || node.data?.applications || [];
        appIds.push(...ids.map((id: any) => typeof id === 'object' ? id.id : id));
      });

      if (appIds.length > 0) {
        const appRes = await fetch(`${cmsUrl}/api/applications?locale=${locale}&where[id][in]=${appIds.join(',')}&depth=2`, { next: { revalidate: 3600 } });
        if (appRes.ok) {
          const appData = await appRes.json();
          applications = (appData.docs || []).map(normalizeMediaObject);
        }
      }

      // 3. Fetch Form Config
      if (formBlockNodes.length > 0) {
        const formId = formBlockNodes[0].data?.formConfig?.id || formBlockNodes[0].data?.formConfig;
        if (formId) {
          const formRes = await fetch(`${cmsUrl}/api/form-configs/${formId}?locale=${locale}&depth=2`, { next: { revalidate: 3600 } });
          if (formRes.ok) formConfig = normalizeMediaObject(await formRes.json());
        }
      }
    }

    // 4. Resolve media for products and applications
    if (products.length > 0) {
      const { mediaData: productMediaData } = await resolveAllMedia(products, cmsUrl, normalize);
      Object.assign(mediaData, productMediaData);
    }
    if (applications.length > 0) {
      const { mediaData: appMediaData } = await resolveAllMedia(applications, cmsUrl, normalize);
      Object.assign(mediaData, appMediaData);
    }

    return { ...page, mediaData, products, applications, formConfig };
  } catch (e) {
    console.error(`Error fetching page data for ${slug}:`, e);
    return null;
  }
}
