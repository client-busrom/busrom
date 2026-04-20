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
  const strategy = undefined; 

  const normalize = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return convertToCDNUrl(url, strategy);

    // Only prepend cmsUrl if it's a media path or looks like a file asset.
    // We want to keep regular internal navigation links (like /contact-us) as relative paths.
    const isMediaPath = url.startsWith('/api/media') || url.startsWith('/media') || /\.(jpg|jpeg|png|gif|svg|webp|avif|pdf|docx|zip)$/i.test(url);
    
    if (isMediaPath) {
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return convertToCDNUrl(`${cmsUrl}${normalizedPath}`, strategy);
    }

    // For other links (internal navigation), just ensure it starts with / and keep it relative
    return url.startsWith('/') ? url : `/${url}`;
  };

  try {
    const pageRes = await fetch(`${cmsUrl}/api/pages?where[slug][equals]=${slug}&locale=${locale}&depth=2`, {
      next: { revalidate: 3600 } 
    });
    
    if (!pageRes.ok) return null;
    
    const result = await pageRes.json();
    if (!result.docs?.length) return null;
    
    const page = result.docs[0];
    const { mediaData } = await resolveAllMedia(page, cmsUrl, normalize);
    
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

    let products: any[] = [];
    let series: any[] = [];
    let applications: any[] = [];
    let formConfig: any = null;

    if (slug === 'one-stop-solution' || slug === 'oem-odm' || slug === 'application' || slug === 'our-story' || slug === 'support' || slug === 'contact-us' || slug === 'product-overview' || slug === 'service-overview' || slug === 'faq') {
      let contentChildren = page.content?.root?.children || page.contentTranslation?.root?.children || [];
      contentChildren = flattenLexicalChildren(contentChildren);

      // Utility to check if a node is the "contact-form-block" marker
      const isFormMarker = (node: any) => {
        if (node.type !== 'paragraph') return false;
        const text = node.children?.map((c: any) => c.text).join('').trim().toLowerCase();
        return text === 'contact-form-block';
      };

      // 1. Identify pairs of (Marker -> FormBlock)
      const formBlockPairs: Array<{ markerIdx: number, formNode: any }> = [];
      contentChildren.forEach((node: any, idx: number) => {
        if (isFormMarker(node)) {
          // Look at next few nodes for the formBlock (handling potential linebreaks/formatting nodes)
          for (let i = idx + 1; i < Math.min(idx + 5, contentChildren.length); i++) {
            if (contentChildren[i].type === 'formBlock') {
              formBlockPairs.push({ markerIdx: idx, formNode: contentChildren[i] });
              break;
            }
          }
        }
      });

      // 2. Extract IDs and Fetch
      const uniqueFormIds = Array.from(new Set(
        formBlockPairs.map(p => p.formNode.data?.formConfig?.id || p.formNode.data?.formConfig).filter(Boolean)
      ));

      if (uniqueFormIds.length > 0) {
        const formConfigsMap: Record<string, any> = {};
        await Promise.all(uniqueFormIds.map(async (id: any) => {
          try {
            // Using the requested URL format with depth=2
            const res = await fetch(`${cmsUrl}/api/form-configs/${id}?depth=2&draft=false&locale=${locale}&trash=false`, { 
              next: { revalidate: 3600 } 
            });
            if (res.ok) {
              formConfigsMap[id] = normalizeMediaObject(await res.json());
            }
          } catch (e) {
            console.error(`[SSR Enrichment] Failed to fetch formConfig ${id}:`, e);
          }
        }));

        // 3. Inject Full Objects back into the Lexical Tree
        formBlockPairs.forEach(pair => {
          const fid = pair.formNode.data?.formConfig?.id || pair.formNode.data?.formConfig;
          if (fid && formConfigsMap[fid]) {
            pair.formNode.data = {
              ...pair.formNode.data,
              formConfig: formConfigsMap[fid]
            };
            console.log(`[SSR Enrichment] Injected full formConfig for ID: ${fid}`);
          }
        });

        // Set the global formConfig for templates that still rely on it
        formConfig = Object.values(formConfigsMap)[0] || null;
      }

      // Existing Carousel/Other enrichment logic...
      const productCarouselNodes = contentChildren.filter((n: any) => n.type === 'productCarousel');
      const applicationCarouselNodes = contentChildren.filter((n: any) => n.type === 'applicationCarousel');
      const faqSelectionNodes = contentChildren.filter((n: any) => n.type === 'faqSelection');
      const formBlockNodes = contentChildren.filter((n: any) => n.type === 'formBlock');

      const manualIds: string[] = [];
      const seriesIds: string[] = [];
      productCarouselNodes.forEach((node: any) => {
        (node.data?.items || []).forEach((it: any) => {
          if (it.selectionMode === 'manual' && it.product) manualIds.push(typeof it.product === 'object' ? it.product.id : it.product);
          if (it.selectionMode === 'auto' && it.productSeries) seriesIds.push(typeof it.productSeries === 'object' ? it.productSeries.id : it.productSeries);
        });
      });

      if (seriesIds.length > 0 || slug === 'product-overview') {
        const seriesIdsSet = Array.from(new Set(seriesIds));
        let seriesUrl = `${cmsUrl}/api/product-series?locale=${locale}&limit=1000&depth=3`;
        if (seriesIdsSet.length > 0 && slug !== 'product-overview') {
          seriesUrl += `&where[id][in]=${seriesIdsSet.join(',')}`;
        }
        
        const seriesRes = await fetch(seriesUrl, { next: { revalidate: 3600 } });
        if (seriesRes.ok) {
          const seriesData = await seriesRes.json();
          series = (seriesData.docs || []).map(normalizeMediaObject);
        }
      }

      if (manualIds.length > 0 || seriesIds.length > 0) {
        let productUrl = `${cmsUrl}/api/products?locale=${locale}&limit=1000&depth=3`;
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

      const appIds: string[] = [];
      applicationCarouselNodes.forEach((node: any) => {
        const ids = node.data?.applicationIds || node.data?.applications || [];
        appIds.push(...ids.map((id: any) => typeof id === 'object' ? id.id : id));
      });

      // Special case: Scan faqSelection for galleries (Case Galleries)
      faqSelectionNodes.forEach((node: any) => {
        (node.data?.categories || []).forEach((cat: any) => {
          (cat.questions || []).forEach((q: any) => {
            if (q.gallery) {
              const gid = typeof q.gallery === 'object' ? q.gallery.id : q.gallery;
              if (gid) appIds.push(String(gid));
            }
          });
        });
      });

      if (appIds.length > 0) {
        const uniqueAppIds = Array.from(new Set(appIds));
        const appRes = await fetch(`${cmsUrl}/api/applications?locale=${locale}&where[id][in]=${uniqueAppIds.join(',')}&depth=2`, { next: { revalidate: 3600 } });
        if (appRes.ok) {
          const appData = await appRes.json();
          applications = (appData.docs || []).map(normalizeMediaObject);
        }
      }

      if (formBlockNodes.length > 0) {
        const formId = formBlockNodes[0].data?.formConfig?.id || formBlockNodes[0].data?.formConfig;
        if (formId) {
          const formRes = await fetch(`${cmsUrl}/api/form-configs/${formId}?locale=${locale}&depth=2`, { next: { revalidate: 3600 } });
          if (formRes.ok) formConfig = normalizeMediaObject(await formRes.json());
        }
      }
    }

    if (products.length > 0) {
      const { mediaData: productMediaData } = await resolveAllMedia(products, cmsUrl, normalize);
      Object.assign(mediaData, productMediaData);
    }
    if (series.length > 0) {
      const { mediaData: seriesMediaData } = await resolveAllMedia(series, cmsUrl, normalize);
      Object.assign(mediaData, seriesMediaData);
    }
    if (applications.length > 0) {
      const { mediaData: appMediaData } = await resolveAllMedia(applications, cmsUrl, normalize);
      Object.assign(mediaData, appMediaData);
    }

    // Flatten the Lexical tree before returning to ensure parsers can find markers inside layouts
    const resolvedPage = { ...page };
    if (resolvedPage.content?.root?.children) {
      resolvedPage.content.root.children = flattenLexicalChildren(resolvedPage.content.root.children);
    }
    if (resolvedPage.contentTranslation?.root?.children) {
      resolvedPage.contentTranslation.root.children = flattenLexicalChildren(resolvedPage.contentTranslation.root.children);
    }

    let navigationMenus: any[] = [];
    const navRes = await fetch(`${cmsUrl}/api/navigation-menus?locale=${locale}&limit=1000&depth=2`, { 
      next: { revalidate: 3600 } 
    });
    if (navRes.ok) {
      const navData = await navRes.json();
      navigationMenus = (navData.docs || []).map(normalizeMediaObject);
    }

    return { ...resolvedPage, mediaData, products, series, applications, formConfig, navigationMenus };
  } catch (e) {
    console.error(`Error fetching page data for ${slug}:`, e);
    return null;
  }
}
