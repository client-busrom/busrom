import { convertToCDNUrl } from "../cdn-url";
import { ProductOverviewData, CMSLink } from "@/types/product-overview";
import { resolveInternalLink } from "@/lib/utils";

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
 * Extracts HTML string from Lexical nodes, preserving bold (format & 1) and linebreaks.
 */
function getNodeHtml(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getNodeHtml).join("");
  if (typeof node === "string") return node;
  
  if (node.type === "linebreak") return "\n";
  
  if (node.text !== undefined) {
    let text = node.text;
    if (node.format & 1) { // 1 = Bold
      text = `<strong>${text}</strong>`;
    }
    return text;
  }
  
  if (node.children) {
    return (node.children as any[]).map(getNodeHtml).join("");
  }
  
  return "";
}

/**
 * Extracts rich text fragments for specific styling (e.g. bold color).
 */
function getRichText(nodes: any[]): { text: string; bold: boolean; italic: boolean; linebreak?: boolean }[] {
  if (!nodes) return [];
  const result: any[] = [];

  const processNode = (node: any) => {
    if (typeof node === "string") {
      result.push({ text: node, bold: false, italic: false });
      return;
    }
    if (node.type === "linebreak") {
      result.push({ text: "", bold: false, italic: false, linebreak: true });
      return;
    }
    if (node.text !== undefined) {
      result.push({ 
        text: node.text, 
        bold: !!(node.format & 1), 
        italic: !!(node.format & 2) 
      });
      return;
    }
    if (node.children) {
      node.children.forEach(processNode);
    }
  };

  nodes.forEach(processNode);
  return result;
}

/**
 * Finds content after a specific marker string in the Lexical tree.
 */
function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false;
  const result: any[] = [];
  const target = markerId.toLowerCase().trim();

  for (const node of children) {
    const rawText = getNodeTotalText(node);
    const text = rawText.toLowerCase().trim();
    
    const isMarkerBlock = (
        node.type === "paragraph" || 
        node.type === "heading" || 
        node.type === "quote" || 
        node.type === "code"
    ) && text.includes(target);
    
    if (isMarkerBlock && !foundMarker) {
      foundMarker = true;
      const markerPos = rawText.toLowerCase().indexOf(target);
      const contentAfterMarker = rawText.substring(markerPos + target.length).trim();
      if (contentAfterMarker.length > 0) {
        result.push({ type: "paragraph", children: [{ text: contentAfterMarker }] });
      }
      continue;
    }
    
    if (foundMarker) {
      const isNextMarker = text.length < 50 && text.includes("-") && 
        (text.startsWith("title") || text.startsWith("image") || text.startsWith("item") || 
         text.startsWith("cta") || text.startsWith("content") || text.startsWith("subtitle") || 
         text.startsWith("logo") || text.startsWith("product-guide") || text.startsWith("brand-trust") ||
         text.startsWith("quote"));
          
      if (isNextMarker) break;
      result.push(node);
    }
  }
  return result;
}

function extractLexicalNodesAfterMarker(children: any[], markerId: string): any {
  const target = markerId.toLowerCase().trim();
  let foundMarker = false;
  const resultNodes: any[] = [];

  for (const node of children) {
    const rawText = getNodeTotalText(node);
    const text = rawText.toLowerCase().trim();

    if (!foundMarker && text.includes(target)) {
      foundMarker = true;
      // If content exists after marker in the same block, extract original children
      if (node.children) {
        let foundMarkerInChild = false;
        const remaining: any[] = [];
        for (const child of node.children) {
          if (foundMarkerInChild) {
            remaining.push(child);
            continue;
          }
          if (getNodeTotalText(child).toLowerCase().includes(target)) {
            foundMarkerInChild = true;
          }
        }
        if (remaining.length > 0) {
          resultNodes.push({ ...node, children: remaining });
        }
      }
      continue;
    }

    if (foundMarker) {
      const isNextMarker = text.length < 50 && text.includes("-") && 
        (text.startsWith("title") || text.startsWith("image") || text.startsWith("item") || 
         text.startsWith("cta") || text.startsWith("content") || text.startsWith("subtitle") || 
         text.startsWith("logo") || text.startsWith("product-guide") || text.startsWith("brand-trust") ||
         text.startsWith("quote") || text.startsWith("exclusive-solutions-"));
          
      if (isNextMarker) break;
      resultNodes.push(node);
    }
  }
  
  if (resultNodes.length === 0) return null;
  return { children: resultNodes };
}

function extractRichTextAfterMarker(children: any[], markerId: string): any[] {
  const nodes = extractAfterMarker(children, markerId);
  for (const node of nodes) {
    if (node.type === "paragraph" || node.type === "heading" || node.type === "quote") {
      return getRichText(node.children || []);
    }
  }
  return [];
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

function extractHtmlAfterMarker(children: any[], markerId: string): string {
  const nodes = extractAfterMarker(children, markerId);
  for (const node of nodes) {
    if (node.type === "paragraph" || node.type === "heading" || node.type === "quote") {
        return getNodeHtml(node).trim();
    }
  }
  return "";
}

function extractListAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((li: any) => {
        return (li.children || []).map((c: any) => getNodeHtml(c)).join("").trim();
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
  const children = rawData.content?.root?.children || rawData.contentTranslation?.root?.children || [];
  const products = rawData.products || [];
  const allSeries = rawData.productSeries || rawData.series || rawData.allSeries || [];
  const applications = rawData.applications || [];
  const navigationMenus = rawData.navigationMenus || [];
  const mediaData = rawData.mediaData || {}; 

  const productRootMenu = navigationMenus.find((m: any) => m.slug === 'product' || m.name === 'Product' || (m.type === 'product_cards' && (m.link?.includes('products') || m.link?.includes('product'))));
  const productRootId = productRootMenu?.id;
  const productRootPath = resolveInternalLink(productRootMenu?.link || "/products");

  const resolveTargetLink = (categoryName: string, fallbackSlug: string) => {
    if (!navigationMenus.length) return resolveInternalLink(`${productRootPath}/${fallbackSlug}`);
    const match = navigationMenus.find((m: any) => {
      const isCorrectParent = m.parent?.id === productRootId || (m.link && (m.link.startsWith(productRootPath) || m.link.includes('/product/')));
      return isCorrectParent && (m.name === categoryName || m.slug?.includes(fallbackSlug));
    });
    return resolveInternalLink(match?.link || `${productRootPath}/${fallbackSlug}`);
  };

  const resolveMedia = (img: any) => {
    if (!img) return null;
    if (img.url) return { ...img, url: convertToCDNUrl(img.url) };
    const id = typeof img === 'object' ? img.id : img;
    const media = mediaData[id];
    if (media) return { ...media, url: convertToCDNUrl(media.url) };
    if (typeof img === 'object' && (img.url || img.id)) return img;
    return null;
  }

  // --- Exclusive Solutions Section ---
  const logoText = extractSingleTextAfterMarker(children, "exclusive-solutions-logo-text") || "Busrom";
  const title = extractLexicalNodesAfterMarker(children, "exclusive-solutions-title");
  const subtitle = extractLexicalNodesAfterMarker(children, "exclusive-solutions-subtitle");
  const content = extractLexicalNodesAfterMarker(children, "exclusive-solutions-content");

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
      const appOrId = galleryImageConfig.application;
      if (typeof appOrId === 'object' && appOrId !== null) {
        // 已经被 hydration 替换成完整 app 对象，直接取图
        rightImg = resolveMedia(getRandomAppImage(appOrId));
      } else {
        const targetAppId = String(appOrId);
        // 优先从 mediaData 取（resolveAllMedia 已做好 appId -> image 的映射）
        if (mediaData[targetAppId]) {
          rightImg = resolveMedia(mediaData[targetAppId]);
        } else {
          // 降级：从 applications 数组里找
          const app = applications.find((a: any) => String(a.id) === targetAppId);
          if (app) rightImg = resolveMedia(getRandomAppImage(app));
        }
      }
    } else {
      rightImg = resolveMedia(galleryImageConfig?.image);
    }
    return { id: idx, title: slide.title, description: slide.description, leftImage: resolveMedia(slide.image), rightImage: rightImg };
  });

  // --- Hero Section (RESTORED FULL FIELDS) ---
  const heroContent1 = extractListAfterMarker(children, "hero-section-content-1");
  const heroContent2 = extractListAfterMarker(children, "hero-section-content-2");
  const heroContent3 = extractListAfterMarker(children, "hero-section-content-3");
  
  let heroCta: CMSLink = { title: "View More", url: productRootPath, openInNewTab: false };
  const heroCtaNodes = extractAfterMarker(children, "hero-section-cta");
  for (const node of heroCtaNodes) {
    if (node.type === "linkJump" && node.data) {
      heroCta = { title: node.data.title || "View More", url: resolveInternalLink(node.data.url || productRootPath), openInNewTab: !!node.data.openInNewTab };
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
          product = products.find((p: any) => String(p.series?.id || p.series) === String(seriesId));
        }
        if (!product) {
          return null;
        }

        const seriesIdField = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
        const seriesObj = allSeries.find((s: any) => String(s.id) === String(seriesIdField || product.series?.id || product.series));
        const targetPath = resolveTargetLink(seriesObj?.category?.name || "", seriesObj?.slug || seriesIdField);
        
        return { 
          id: product.id, 
          title: product.title, 
          mainImage: Array.isArray(product.mainImage) 
            ? product.mainImage.map(resolveMedia).filter(Boolean) 
            : resolveMedia(product.mainImage),
          showImage: resolveMedia(product.showImage),
          gallery: Array.isArray(product.gallery) ? product.gallery.map(resolveMedia).filter(Boolean) : [],
          images: Array.isArray(product.images) ? product.images.map(resolveMedia).filter(Boolean) : [],
          image: resolveMedia(product.image),
          featuredImage: resolveMedia(product.featuredImage),
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
      seriesConfig = { autoplay: node.data.autoplay !== false, interval: node.data.interval || 5, itemsPerView: node.data.itemsPerView || 5 };
      seriesItems = node.data.items.map((item: any) => {
        const getTargetId = (val: any) => (typeof val === 'object' && val !== null ? val.id : val);
        let product = null;
        if (item.selectionMode === 'manual') {
          const prodId = getTargetId(item.product);
          product = products.find((p: any) => String(p.id) === String(prodId));
        } else {
          const seriesId = getTargetId(item.productSeries);
          product = products.find((p: any) => {
            const pSeriesId = typeof p.series === 'object' && p.series !== null ? p.series.id : p.series;
            return String(pSeriesId) === String(seriesId);
          });
        }
        if (!product) return null;

        const seriesIdField = getTargetId(item.productSeries);
        const seriesObj = allSeries.find((s: any) => String(s.id) === String(seriesIdField || (typeof product.series === 'object' ? product.series.id : product.series)));
        const seriesId = seriesIdField || (typeof product.series === 'object' ? product.series.id : product.series);
        const targetPath = resolveTargetLink(seriesObj?.category?.name || "", seriesObj?.slug || seriesId);
        
        if (!seriesObj) return null;
        
        const categoryName = seriesObj.category?.name || "";
        const seriesName = seriesObj.name || seriesObj.title || "";
        const title = item.customName?.trim() || ((item.showCategory === true || item.showName === false) ? categoryName : seriesName);
        
        return { 
          id: seriesId, 
          title: title || seriesName || categoryName || "", 
          image: resolveMedia(product?.showImage || product?.image || product?.featuredImage), 
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
      appCta = { title: node.data.title || "View More", url: resolveInternalLink(node.data.url || "/application"), openInNewTab: !!node.data.openInNewTab };
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
        return appObj ? { id: appId, title: appObj.title, subtitle: appObj.subtitle || appObj.name, image: resolveMedia(getRandomAppImage(appObj)) } : null;
      }).filter(Boolean);
      break;
    }
  }

  // --- Selection Guide Section ---
  const selectionGuideSlides: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const list = extractListAfterMarker(children, `product-guide-${i}`);
    if (list.length > 0) {
      let slideImages: any[] = [];
      const imageNodes = extractAfterMarker(children, `product-guide-image-${i}`);
      for (const node of imageNodes) {
        if (node.type === 'custom-image-gallery' && node.data?.images) {
          slideImages = node.data.images.map((imgConfig: any) => {
            if (imgConfig.sourceType === 'application' && imgConfig.application) {
              const appOrId = imgConfig.application;
              if (typeof appOrId === 'object' && appOrId !== null) {
                return resolveMedia(getRandomAppImage(appOrId));
              }
              const appId = String(appOrId);
              if (mediaData[appId]) return resolveMedia(mediaData[appId]);
              const app = applications.find((a: any) => String(a.id) === appId);
              return app ? resolveMedia(getRandomAppImage(app)) : null;
            }
            return resolveMedia(imgConfig.image);
          }).filter(Boolean);
          break;
        }
      }
      selectionGuideSlides.push({ id: `slide-${i}-${Date.now()}`, title1: list[0] || "", title2: list[1] || "", highlightText: list[2] || "", content1: list[3] || "", content2: list[4] || "", images: slideImages });
    }
  }

  // --- Brand Trust Section ---
  const brandTrustTitle = extractHtmlAfterMarker(children, "brand-trust-title");
  const brandTrustContent = extractHtmlAfterMarker(children, "brand-trust-content");
  let brandTrustImage = null;
  const brandTrustImageNodes = extractAfterMarker(children, "brand-trust-image");
  for (const node of brandTrustImageNodes) {
    if (node.type === 'custom-image-gallery' && node.data?.images?.[0]) {
      brandTrustImage = resolveMedia(node.data.images[0].image);
      break;
    }
    if ((node.type === 'image' || node.type === 'singleImage') && node.data?.image) {
      brandTrustImage = resolveMedia(node.data.image);
      break;
    }
  }

  // --- Quote Section ---
  const quoteTitleFragments = extractRichTextAfterMarker(children, "quote-title");
  const quoteDescription = extractSingleTextAfterMarker(children, "quote-description");
  let quoteCta: CMSLink = { title: "Contact Us", url: "/contact-us", openInNewTab: false };
  const quoteCtaNodes = extractAfterMarker(children, "quote-cta");
  for (const node of quoteCtaNodes) {
    if (node.type === "linkJump" && node.data) {
      quoteCta = { title: node.data.title || "Contact Us", url: resolveInternalLink(node.data.url || "/contact-us"), openInNewTab: !!node.data.openInNewTab };
      break;
    }
  }
  let quoteLogo = null;
  const quoteLogoNodes = extractAfterMarker(children, "quote-logo");
  for (const node of quoteLogoNodes) {
    if ((node.type === 'image' || node.type === 'singleImage') && node.data?.image) {
      quoteLogo = resolveMedia(node.data.image);
      break;
    }
  }
  let quoteImage = null;
  const quoteImageNodes = extractAfterMarker(children, "quote-image");
  for (const node of quoteImageNodes) {
    if ((node.type === 'image' || node.type === 'singleImage') && node.data?.image) {
      quoteImage = resolveMedia(node.data.image);
      break;
    }
  }

  return {
    hero: { content1: heroContent1, content2: heroContent2, content3: heroContent3, cta: heroCta, productItems: heroProductItems },
    seriesOverview: { title: seriesTitle || "Product Series", subtitle: seriesSubtitle || "Overview", items: seriesItems, config: seriesConfig },
    applications: { title: appTitle || "APPLICATIONS", subtitle: appSubtitle || "Professional project support and cases", cta: appCta, items: appItems, config: appConfig },
    exclusiveSolutions: { logoText, title, subtitle, content, items },
    selectionGuide: selectionGuideSlides.length > 0 ? { slides: selectionGuideSlides } : undefined,
    brandTrust: brandTrustTitle ? { title: brandTrustTitle, content: brandTrustContent, image: brandTrustImage } : undefined,
    quote: quoteTitleFragments.length > 0 ? { title: quoteTitleFragments, description: quoteDescription, cta: quoteCta, logo: quoteLogo, image: quoteImage } : undefined
  };
}
