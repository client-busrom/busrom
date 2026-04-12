import { convertToCDNUrl } from "../cdn-url";
import { ProductOverviewData, CMSLink } from "@/types/product-overview";

/**
 * Extracts raw text from Lexical nodes, preserving linebreaks.
 */
function getNodeTotalText(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getNodeTotalText).join("");
  if (typeof node === "string") return node;
  
  if (node.type === "linebreak") return "\n";
  if (node.text !== undefined) return node.text;
  
  if (node.children) {
    return (node.children as any[]).map(getNodeTotalText).join("");
  }
  
  return "";
}

/**
 * Finds content after a specific marker string in the Lexical tree.
 * Uses aggressive fuzzy matching to prevent minor character differences from breaking the site.
 */
function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false;
  const result: any[] = [];
  const target = markerId.toLowerCase().trim();

  for (const node of children) {
    const rawText = getNodeTotalText(node);
    const text = rawText.toLowerCase().trim();
    
    // Aggressive matching: includes, paragraph/heading/quote/code
    const isMarkerBlock = (
        node.type === "paragraph" || 
        node.type === "heading" || 
        node.type === "quote" || 
        node.type === "code"
    ) && text.includes(target);
    
    if (isMarkerBlock && !foundMarker) {
      foundMarker = true;
      
      // Check if there's content AFTER the marker within the SAME node
      const markerPos = rawText.toLowerCase().indexOf(target);
      const contentAfterMarker = rawText.substring(markerPos + target.length).trim();
      
      if (contentAfterMarker.length > 0) {
        // Create a synthetic node for the remaining text so extraction functions can pick it up
        result.push({
          type: "paragraph",
          children: [{ text: contentAfterMarker }]
        });
      }
      continue;
    }
    
    if (foundMarker) {
      // Logic to stop at the next marker: starts with [something]-marker-name
      // or looks like a typical marker key (lowercase-with-dashes)
      // Tightened logic: starts with a known marker prefix AND is short (likely a tag)
      const isNextMarker = text.length < 50 && text.includes("-") && 
        (text.startsWith("title") || text.startsWith("image") || text.startsWith("item") || 
         text.startsWith("cta") || text.startsWith("content") || text.startsWith("subtitle") || 
         text.startsWith("logo") || text.startsWith("product-guide") || text.startsWith("brand-trust"));
         
      if (isNextMarker) {
         break;
      }
      result.push(node);
    }
  }
  return result;
}

function extractSingleTextAfterMarker(children: any[], markerId: string): string {
  const nodes = extractAfterMarker(children, markerId);
  for (const node of nodes) {
    if (node.type === "paragraph" || node.type === "heading" || node.type === "quote") {
        return getNodeTotalText(node).trim();
    }
  }
  return "";
}

function extractListAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((li: any) => {
        // Flatten list items and preserve linebreaks in each item
        return (li.children || []).map((c: any) => getNodeTotalText(c)).join("").trim();
      }).filter(Boolean);
    }
  }
  return [];
}

function getRandomAppImage(app: any) {
  if (!app?.sceneGallery || app.sceneGallery.length === 0) return app?.image || null;
  const validScenes = app.sceneGallery.filter((s: any) => s.images && s.images.length > 0);
  if (validScenes.length === 0) return app?.image || null;
  const randomScene = validScenes[Math.floor(Math.random() * validScenes.length)];
  const randomImage = randomScene.images?.[Math.floor(Math.random() * (randomScene.images?.length || 1))];
  return randomImage || app.image || null;
}

export function parseProductOverviewData(locale: string, rawData: any): ProductOverviewData {
  const children = rawData.contentTranslation?.root?.children || rawData.content?.root?.children || [];
  const products = rawData.products || [];
  const allSeries = rawData.productSeries || rawData.series || rawData.allSeries || [];
  const applications = rawData.applications || [];
  const navigationMenus = rawData.navigationMenus || [];
  const mediaData = rawData.mediaData || {}; 

  const productRootMenu = navigationMenus.find((m: any) => m.slug === 'product' || (m.type === 'product_cards' && m.link?.includes('products')));
  const productRootId = productRootMenu?.id;
  const productRootPath = (productRootMenu?.link || "/products").replace('/pages/', '/');

  const resolveTargetLink = (categoryName: string, fallbackSlug: string) => {
    if (!navigationMenus.length) return `${productRootPath}/${fallbackSlug}`;
    const match = navigationMenus.find((m: any) => {
      const isCorrectParent = m.parent?.id === productRootId || (m.link && m.link.startsWith(productRootPath));
      return isCorrectParent && (m.name === categoryName || m.slug?.includes(fallbackSlug));
    });
    return (match?.link || `${productRootPath}/${fallbackSlug}`).replace('/pages/', '/');
  };

  const resolveMedia = (img: any) => {
    if (!img) return null;
    
    // 1. Direct object with URL
    if (img.url) return { ...img, url: convertToCDNUrl(img.url) };
    
    // 2. Lexical mediaData lookup
    const id = typeof img === 'object' ? img.id : img;
    const media = mediaData[id];
    if (media) return { ...media, url: convertToCDNUrl(media.url) };
    
    // 3. Last resort: Return raw object (OptimizedImage might handle it)
    if (typeof img === 'object' && (img.url || img.id)) return img;
    
    return null;
  }

  // --- Exclusive Solutions Section ---
  const logoText = extractSingleTextAfterMarker(children, "exclusive-solutions-logo-text") || "Busrom";
  const title = extractSingleTextAfterMarker(children, "exclusive-solutions-title") || "";
  const subtitle = extractSingleTextAfterMarker(children, "exclusive-solutions-subtitle") || "";
  const content = extractSingleTextAfterMarker(children, "exclusive-solutions-content") || "";

  let rawSlides: any[] = [];
  const escItemNodes = extractAfterMarker(children, "exclusive-solutions-item");
  for (const node of escItemNodes) {
    if (node.type === 'carousel' && node.data?.slides) {
      rawSlides = node.data.slides;
      break;
    }
  }

  let galleryImages: any[] = [];
  const escImageNodes = extractAfterMarker(children, "exclusive-solutions-image");
  for (const node of escImageNodes) {
    if (node.type === 'custom-image-gallery' && node.data?.images) {
      galleryImages = node.data.images;
      break;
    }
  }

  const items = rawSlides.map((slide, idx) => {
    const galleryImageConfig = galleryImages[idx];
    let rightImg = null;
    if (galleryImageConfig?.sourceType === 'application' && galleryImageConfig.application) {
      const targetAppId = String(galleryImageConfig.application);
      const app = applications.find((a: any) => String(a.id) === targetAppId);
      if (app) rightImg = getRandomAppImage(app);
    } else {
      rightImg = resolveMedia(galleryImageConfig?.image);
    }
    return {
      id: idx,
      title: slide.title,
      description: slide.description,
      leftImage: resolveMedia(slide.image), 
      rightImage: rightImg 
    };
  });

  // --- Hero Section ---
  const heroContent1 = extractListAfterMarker(children, "hero-section-content-1");
  const heroContent2 = extractListAfterMarker(children, "hero-section-content-2");
  const heroContent3 = extractListAfterMarker(children, "hero-section-content-3");
  
  let heroCta: CMSLink = { title: "View More", url: productRootPath, openInNewTab: false };
  const heroCtaNodes = extractAfterMarker(children, "hero-section-cta");
  for (const node of heroCtaNodes) {
    if (node.type === "linkJump" && node.data) {
      heroCta = { title: node.data.title || "View More", url: (node.data.url || productRootPath).replace('/pages/', '/'), openInNewTab: !!node.data.openInNewTab };
      break;
    }
  }

  let heroProductItems: any[] = [];
  const heroImageNodes = extractAfterMarker(children, "hero-section-image");
  for (const node of heroImageNodes) {
    if (node.type === "productCarousel" && node.data?.items) {
      heroProductItems = node.data.items.map((item: any) => {
        let product = null;
        
        if (item.selectionMode === 'manual') {
          const prodId = typeof item.product === 'object' ? item.product.id : item.product;
          product = products.find((p: any) => String(p.id) === String(prodId));
        } else {
          const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
          // For auto mode, find products belonging to this series
          product = products.find((p: any) => String(p.series?.id || p.series) === String(seriesId));
        }

        if (!product) return null;

        const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
        const seriesObj = allSeries.find((s: any) => String(s.id) === String(seriesId || product.series?.id || product.series));
        const targetPath = resolveTargetLink(seriesObj?.category?.name || "", seriesObj?.slug || seriesId);
        
        return { 
          id: product.id, 
          title: product.title, 
          mainImage: product.mainImage,
          gallery: product.gallery,
          images: product.images,
          image: product.image,
          featuredImage: product.featuredImage,
          href: `/${locale}${targetPath}` 
        };
      }).filter(Boolean);
      break;
    }
  }

  // --- Series Overview Section ---
  const seriesTitle = extractSingleTextAfterMarker(children, "product-overview-title");
  const seriesSubtitle = extractSingleTextAfterMarker(children, "product-overview-subtitle");
  let seriesItems: any[] = [];
  let seriesConfig = { autoplay: true, interval: 5, itemsPerView: 5 };
  const seriesNodes = extractAfterMarker(children, "product-overview-item");
  for (const node of seriesNodes) {
    if (node.type === "productCarousel" && node.data?.items) {
      seriesConfig = { 
        autoplay: node.data.autoplay !== false, 
        interval: node.data.interval || 5, 
        itemsPerView: node.data.itemsPerView || 5 
      };
      seriesItems = node.data.items.map((item: any) => {
        const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
        const seriesObj = allSeries.find((s: any) => String(s.id) === String(seriesId));
        
        // Find a representative product from this series just for the image
        const repProduct = products.find((p: any) => String(p.series?.id || p.series) === String(seriesId));
        const targetPath = resolveTargetLink(seriesObj?.category?.name || "", seriesObj?.slug || seriesId);

        if (!seriesObj) return null;

        return {
          id: seriesId,
          title: item.customName || seriesObj.name || seriesObj.title || "",
          image: resolveMedia(repProduct?.showImage || repProduct?.image || repProduct?.featuredImage),
          href: `/${locale}${targetPath}`
        };
      }).filter(Boolean);
      break;
    }
  }

  // --- Applications Section ---
  const appTitle = extractSingleTextAfterMarker(children, "applications-title");
  const appSubtitle = extractSingleTextAfterMarker(children, "applications-subtitle");
  let appItems: any[] = [];
  let appConfig = { autoplay: true, interval: 5, itemsPerView: 3 };
  let appCta: CMSLink = { title: "View More", url: "/application", openInNewTab: false };
  const appCtaNodes = extractAfterMarker(children, "applications-cta");
  for (const node of appCtaNodes) {
    if (node.type === "linkJump" && node.data) {
      appCta = { title: node.data.title || "View More", url: (node.data.url || "/application").replace('/pages/', '/'), openInNewTab: !!node.data.openInNewTab };
      break;
    }
  }
  const appNodes = extractAfterMarker(children, "applications-item");
  for (const node of appNodes) {
    if (node.type === "applicationCarousel" && node.data) {
      appConfig = { autoplay: node.data.autoplay !== false, interval: node.data.interval || 5, itemsPerView: node.data.itemsPerView || 3 };
      appItems = (node.data.applications || []).map((ref: any) => {
        const appId = typeof ref === 'object' ? ref.id : ref;
        const appObj = applications.find((a: any) => String(a.id) === String(appId));
        return appObj ? { id: appId, title: appObj.title, subtitle: appObj.subtitle || appObj.name, image: resolveMedia(getRandomAppImage(appObj)), href: `/${locale}/application/${appObj.slug}` } : null;
      }).filter(Boolean);
      break;
    }
  }

  // --- Selection Guide Section ---
  const selectionGuideSlides: any[] = [];
  // Support more slides dynamically (up to 5 for now)
  for (let i = 1; i <= 5; i++) {
    const list = extractListAfterMarker(children, `product-guide-${i}`);
    
    // Also try to find a heading or paragraph that just says "product-guide-i" 
    // in case it's nested or slightly different.
    if (list.length > 0) {
      let slideImages: any[] = [];
      const imageNodes = extractAfterMarker(children, `product-guide-image-${i}`);
      for (const node of imageNodes) {
        if (node.type === 'custom-image-gallery' && node.data?.images) {
          slideImages = node.data.images.map((imgConfig: any) => {
            if (imgConfig.sourceType === 'application' && imgConfig.application) {
              const app = applications.find((a: any) => String(a.id) === String(imgConfig.application));
              return app ? resolveMedia(getRandomAppImage(app)) : null;
            }
            return resolveMedia(imgConfig.image);
          }).filter(Boolean);
          break;
        }
      }

      selectionGuideSlides.push({
        id: `slide-${i}-${Date.now()}`, // Unique ID
        title1: list[0] || "",
        title2: list[1] || "",
        highlightText: list[2] || "",
        content1: list[3] || "",
        content2: list[4] || "",
        images: slideImages
      });
    }
  }

  // --- Brand Trust Section ---
  const brandTrustTitle = extractSingleTextAfterMarker(children, "brand-trust-title");
  const brandTrustContent = extractSingleTextAfterMarker(children, "brand-trust-content");
  let brandTrustImage = null;
  const brandTrustImageNodes = extractAfterMarker(children, "brand-trust-image");
  for (const node of brandTrustImageNodes) {
    if (node.type === 'custom-image-gallery' && node.data?.images?.[0]) {
      brandTrustImage = resolveMedia(node.data.images[0].image);
      break;
    }
    // Fallback if it's a direct image block
    if (node.type === 'image' && node.data?.image) {
      brandTrustImage = resolveMedia(node.data.image);
      break;
    }
  }

  return {
    hero: { content1: heroContent1, content2: heroContent2, content3: heroContent3, cta: heroCta, productItems: heroProductItems },
    seriesOverview: { title: seriesTitle || "Product Series", subtitle: seriesSubtitle || "Overview", items: seriesItems, config: seriesConfig },
    applications: { title: appTitle || "APPLICATIONS", subtitle: appSubtitle || "Professional project support and cases", cta: appCta, items: appItems, config: appConfig },
    exclusiveSolutions: { logoText, title, subtitle, content, items },
    selectionGuide: selectionGuideSlides.length > 0 ? { slides: selectionGuideSlides } : undefined,
    brandTrust: brandTrustTitle ? { title: brandTrustTitle, content: brandTrustContent, image: brandTrustImage } : undefined
  };
}
