import { convertToCDNUrl } from "../cdn-url";

export interface MediaObject {
  id: string;
  url: string;
  alt?: string;
}

export interface OneStopProduct {
  id: string;
  name: string;
  slug: string;
  image: MediaObject | null;
  category?: { name: string };
  series?: { id: string };
  // Mapped fields
  title: string;
  link: string;
  showName: boolean;
  showCategory: boolean;
  categoryName: string;
}

export interface OneStopApplication {
  id: string;
  title: string;
  description: string;
  image: MediaObject | null;
  link: string;
}

export interface OneStopSection {
  title: string;
  subtitle: string;
  items: any[];
  autoplay?: boolean;
  interval?: number;
}

export interface ParsedOneStopData {
  hero: OneStopSection;
  problems: OneStopSection;
  advantages: OneStopSection;
  process: OneStopSection;
  showcase: OneStopSection & { viewMoreText: string; viewMoreLink: string; products: OneStopProduct[] };
  categories: { title: string; subtitle: string; products: OneStopProduct[] };
  productSeries: { title: string; products: OneStopProduct[] };
  brandHighlights: { titleLine1: string; titleLine2: string; items: any[] };
  trust: { title: string; items: any[]; images: any[]; bgImage: MediaObject | null };
  cta: { title: string; description: string; image: MediaObject | null; formConfig: any };
  applications: { title: string; items: OneStopApplication[] };
  oemOdmGuide: { title: string; description: string; bgImage: MediaObject | null; ctaText: string; ctaLink: string };
}

function getRandomAppImage(app: any) {
  if (!app?.sceneGallery || app.sceneGallery.length === 0) return app?.image || null;
  const validScenes = app.sceneGallery.filter((s: any) => s.images && s.images.length > 0);
  if (validScenes.length === 0) return app?.image || null;
  const randomScene = validScenes[Math.floor(Math.random() * validScenes.length)];
  const randomImage = randomScene.images?.[Math.floor(Math.random() * (randomScene.images?.length || 1))];
  return randomImage || app.image || null;
}

const getDeepText = (node: any, useHtml = false): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text !== undefined) {
    let text = node.text;
    if (useHtml && node.format && (node.format & 1)) {
        return `<b>${text}</b>`;
    }
    return text;
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map((child: any) => child.type === "linebreak" ? (useHtml ? "<br />" : "\n") : getDeepText(child, useHtml)).join("");
  }
  return "";
};

const isMarkerNode = (node: any, markerId: string) => {
  if (!node) return false;
  const text = node.children?.[0]?.text || "";
  const isLexicalMarker = node.format === 16 || node.children?.some((c: any) => c.format === 16);
  return isLexicalMarker && text === markerId;
};

const isAnyMarkerNode = (node: any) => {
  if (!node) return false;
  return node.format === 16 || node.children?.some((c: any) => c.format === 16);
};

const extractSectionRaw = (children: any[], markerId: string, mediaData: Record<string, any>) => {
  const sections: any[][] = [];
  let currentSection: any[] = [];
  for (const node of children) {
    if (node.type === "quote") {
      if (currentSection.length > 0) sections.push(currentSection);
      currentSection = [node];
    } else {
      currentSection.push(node);
    }
  }
  if (currentSection.length > 0) sections.push(currentSection);

  const targetSection = sections.find(sec => JSON.stringify(sec).includes(markerId));
  if (!targetSection) return { title: "", subtitle: "", items: [], autoplay: false, interval: 5, titleNodes: [] };

  const carouselNode = targetSection.find(n => n.type === "carousel");
  const autoplay = carouselNode?.data?.autoplay ?? false;
  const interval = carouselNode?.data?.interval ?? 5;

  const items: any[] = [];
  targetSection.forEach(node => {
    if (node.type === "carousel" && node.data?.slides) {
      items.push(...node.data.slides.map((s: any) => ({
        title: s.title || "",
        description: s.description || "",
        image: s.image ? (mediaData[typeof s.image === 'object' ? s.image.id : String(s.image)] || (typeof s.image === 'object' ? s.image : null)) : null,
        sourceType: node.type
      })));
    }
    if (node.type === "custom-image-gallery" && node.data?.images) {
      items.push(...node.data.images.map((g: any) => ({
        id: typeof g.image === 'object' ? g.image.id : String(g.image || ""),
        image: mediaData[typeof g.image === 'object' ? g.image.id : String(g.image || "")] || (typeof g.image === 'object' ? g.image : null),
        title: g.title || "",
        link: g.linkUrl || "",
        sourceType: node.type
      })));
    }
    if (node.type === "productCarousel") {
      items.push({ sourceType: "productCarousel", carouselItems: node.data?.items || [] });
    }
    if (node.type === "applicationCarousel") {
      const appIds = node.data?.applicationIds || node.data?.applications;
      if (appIds) items.push({ sourceType: "applicationCarousel", applicationIds: appIds });
    }
  });

  const titleNodes = targetSection.filter(n => (n.type === "heading" || n.type === "paragraph") && !isMarkerNode(n, markerId) && !isAnyMarkerNode(n));
  let title = "";
  let subtitle = "";
  if (titleNodes.length > 0) {
    title = getDeepText(titleNodes[0], true).trim();
    if (titleNodes.length > 1) subtitle = getDeepText(titleNodes[1], true).trim();
  }

  return { title, subtitle, items, autoplay, interval, titleNodes };
};

const mapProductsWithCarouselConfig = (products: any[], carouselItems: any[] = [], locale: string) => {
  const usedProductIds = new Set<string>();
  return carouselItems.map((item: any) => {
    let product = null;
    if (item.selectionMode === 'manual') {
      const targetId = typeof item.product === 'object' ? item.product.id : item.product;
      product = products.find(p => String(p.id) === String(targetId));
    } else {
      const targetSeriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
      // Try to find a unique product in this series
      product = products.find(p => String(p.series?.id || p.series) === String(targetSeriesId) && !usedProductIds.has(p.id));
      
      // Fallback: If no more unique products, but we need more for the carousel, reuse products from the same series
      if (!product && targetSeriesId) {
        product = products.find(p => String(p.series?.id || p.series) === String(targetSeriesId));
      }
    }
    
    if (!product) return null;
    if (item.selectionMode !== 'manual') usedProductIds.add(product.id);
    
    // Support multiple image field names used in different collections
    const displayImage = 
      product.showImage || 
      product.image || 
      product.featuredImage || 
      product.mainImage || 
      (product.images && product.images.length > 0 ? (product.images[0].image || product.images[0]) : null) ||
      null;

    const categoryName = product.category?.name || "";
    const title = item?.customName?.trim() || ((item?.showCategory === true || item?.showName === false) ? categoryName : product.name);
    
    return {
      ...product,
      title,
      image: displayImage, // Normalize to single 'image' prop for standard components
      showImage: displayImage, // Also keep 'showImage' for components that prefer it
      link: `/${locale}/product/${product.slug}`,
      showName: item.showName !== false,
      showCategory: !!item.showCategory,
      categoryName
    };
  }).filter(Boolean);
};

export const parseOneStopData = (pageContent: any, locale: string): ParsedOneStopData => {
  const contentChildren = pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [];
  const mediaData = pageContent.mediaData || {};
  const products = pageContent.products || [];
  const applicationsRes = pageContent.applications || [];

  const heroRaw = extractSectionRaw(contentChildren, "one-stop-shop-introduction-carousel", mediaData);
  const problemsRaw = extractSectionRaw(contentChildren, "one-stop-shop-value-item", mediaData);
  const advantagesRaw = extractSectionRaw(contentChildren, "one-stop-shop-advantage-item", mediaData);
  const processRaw = extractSectionRaw(contentChildren, "how-to-make-item", mediaData);

  // Showcase
  const showcaseRaw = extractSectionRaw(contentChildren, "product-show-item", mediaData);
  const showcaseCarousel = showcaseRaw.items.find(it => it.sourceType === 'productCarousel');
  const showcaseMapped = mapProductsWithCarouselConfig(products, showcaseCarousel?.carouselItems || [], locale);
  // Also include items from other gallery/carousel blocks in this section
  const showcaseOtherItems = showcaseRaw.items
    .filter(it => it.sourceType !== 'productCarousel')
    .map(it => ({
      id: it.id || Math.random().toString(36).substr(2, 9),
      title: it.title,
      image: it.image,
      link: it.link,
      showName: true,
      showCategory: false
    }));
  const showcaseProducts = [...showcaseMapped, ...showcaseOtherItems];

  let viewMoreText = "VIEW MORE", viewMoreLink = `/${locale}/shop`;
  const btnMarkerIndex = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("product-show-btn"));
  if (btnMarkerIndex !== -1 && btnMarkerIndex + 1 < contentChildren.length) {
    const btnNode = contentChildren[btnMarkerIndex + 1];
    if (btnNode.type === "linkJump" && btnNode.data) {
      viewMoreText = (btnNode.data.title || btnNode.data.description || "VIEW MORE").toUpperCase();
      if (btnNode.data.url) viewMoreLink = `/${locale}${btnNode.data.url.replace('/pages/', '/').replace(/^\/(en|cn|ja|de|...)\//, '/')}`;
    }
  }

  // Categories Grid
  const categoriesRaw = extractSectionRaw(contentChildren, "feature-product-item", mediaData);
  const categoriesCarousel = categoriesRaw.items.find((it: any) => it.sourceType === 'productCarousel');
  const catMapped = categoriesCarousel ? mapProductsWithCarouselConfig(products, categoriesCarousel.carouselItems, locale) : [];
  const catOther = categoriesRaw.items
    .filter(it => it.sourceType !== 'productCarousel')
    .map(it => ({
      ...it,
      name: it.title,
      slug: it.link?.split('/').pop() || "",
      image: it.image,
      title: it.title
    }));
  
  const categoriesProducts = catMapped.length > 0 || catOther.length > 0 
    ? [...catMapped, ...catOther]
    : products.map((p: any) => ({ ...p, title: p.category?.name || p.name, link: `/${locale}/product/${p.slug}` }));

  // Series
  const seriesRaw = extractSectionRaw(contentChildren, "product-attribute", mediaData);
  const seriesCarousel = seriesRaw.items.find((it: any) => it.sourceType === 'productCarousel');
  const seriesProducts = seriesCarousel ? mapProductsWithCarouselConfig(products, seriesCarousel.carouselItems, locale) : products.map((p: any) => ({ ...p, title: p.category?.name || p.name, link: `/${locale}/product/${p.slug}` }));

  // Brand Highlights
  const brandHighlightsRaw = extractSectionRaw(contentChildren, "brand-highlights-item", mediaData);

  // Trust
  const trustRaw = extractSectionRaw(contentChildren, "why-contractors-trust-us-item", mediaData);
  const trustNodes = contentChildren.slice(contentChildren.findIndex((n: any) => isMarkerNode(n, "why-contractors-trust-us-item")) + 1);
  const trustList = trustNodes.find((n: any) => n.type === "list")?.children || [];
  const trustItems = [];
  for (let i = 0; i < trustList.length; i += 2) {
    if (trustList[i]) trustItems.push({ title: getDeepText(trustList[i]).trim(), description: trustList[i + 1] ? getDeepText(trustList[i + 1]).trim() : "" });
  }
  const trustBgMarker = "why-contractors-trust-us-bg-image";
  const trustBgIdx = contentChildren.findIndex((n: any) => JSON.stringify(n).includes(trustBgMarker));
  const trustBgImage = trustBgIdx !== -1 && trustBgIdx + 1 < contentChildren.length ? mediaData[contentChildren[trustBgIdx + 1].data?.image?.id || contentChildren[trustBgIdx + 1].value?.id || String(contentChildren[trustBgIdx + 1].value || "")] : null;

  // Applications
  const appsSectionRaw = extractSectionRaw(contentChildren, "applications-item", mediaData);
  const appsCarouselNode = appsSectionRaw.items.find((it: any) => it.sourceType === 'applicationCarousel');
  const finalApps = (appsCarouselNode?.applicationIds || []).map((idOrObj: any) => {
    const id = typeof idOrObj === 'object' ? idOrObj.id : idOrObj;
    const app = applicationsRes.find((a: any) => String(a.id) === String(id));
    if (!app) return null;
    return { 
      id: String(app.id), 
      title: app.name, 
      description: app.shortDescription, 
      image: getRandomAppImage(app), 
      link: `/${locale}/application/${app.slug}` 
    };
  }).filter(Boolean);

  // CTA
  const ctaRaw = extractSectionRaw(contentChildren, "contact-form", mediaData);
  const ctaImgMarker = "contact-form-image";
  const ctaImgIdx = contentChildren.findIndex((n: any) => JSON.stringify(n).includes(ctaImgMarker));
  const ctaImage = ctaImgIdx !== -1 && ctaImgIdx + 1 < contentChildren.length ? mediaData[contentChildren[ctaImgIdx + 1].data?.image?.id || String(contentChildren[ctaImgIdx + 1].data?.image || "")] : null;
  const formNode = contentChildren.find((n: any) => n.type === "formBlock");

  // OEM ODM Guide
  const oemRaw = extractSectionRaw(contentChildren, "oem-odm-guide", mediaData);
  let oemTitle = oemRaw.title || "READY TO\nJOIN IN BUSROM?";
  const oemTitleIdx = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("oem-odm-guide-title"));
  if (oemTitleIdx !== -1 && oemTitleIdx + 1 < contentChildren.length) oemTitle = getDeepText(contentChildren[oemTitleIdx + 1], true);
  const oemBgIdx = contentChildren.findIndex((n: any) => JSON.stringify(n).includes("oem-odm-guide-bg-image"));
  const oemBgImage = oemBgIdx !== -1 && oemBgIdx + 1 < contentChildren.length ? mediaData[contentChildren[oemBgIdx + 1].data?.image?.id || String(contentChildren[oemBgIdx + 1].value || "")] : (oemRaw.items[0]?.image || null);

    const blockConfig = formNode?.data?.formConfig;
    const pageConfig = pageContent.formConfig;
    // Prefer populated object with fields, fallback to whatever is available
    const bestFormConfig = (blockConfig?.fields ? blockConfig : (pageConfig?.fields ? pageConfig : (blockConfig || pageConfig)));

    return { 
      hero: { ...heroRaw },
      problems: { ...problemsRaw },
      advantages: { title: advantagesRaw.title, subtitle: "", items: advantagesRaw.items },
      process: { title: processRaw.title, subtitle: "", items: processRaw.items },
      showcase: { ...showcaseRaw, viewMoreText, viewMoreLink, products: showcaseProducts },
      categories: { title: categoriesRaw.title, subtitle: categoriesRaw.subtitle, products: categoriesProducts },
      productSeries: { title: seriesRaw.title, products: seriesProducts },
      brandHighlights: { titleLine1: brandHighlightsRaw.title, titleLine2: brandHighlightsRaw.subtitle, items: brandHighlightsRaw.items },
      trust: { title: trustRaw.title, items: trustItems, images: trustRaw.items.filter((it: any) => it.sourceType === 'custom-image-gallery' || it.sourceType === 'carousel'), bgImage: trustBgImage },
      cta: { 
        title: ctaRaw.title || (typeof bestFormConfig === 'object' ? bestFormConfig?.displayName : undefined), 
        description: ctaRaw.subtitle || (typeof bestFormConfig === 'object' ? bestFormConfig?.description : undefined), 
        image: ctaImage, 
        formConfig: bestFormConfig
      },
      applications: { title: appsSectionRaw.title, items: finalApps },
      oemOdmGuide: { title: oemTitle, description: oemRaw.subtitle, bgImage: oemBgImage, ctaText: locale === 'cn' ? "了解更多" : "READ MORE", ctaLink: `/${locale}/oem-odm` }
    };
};
