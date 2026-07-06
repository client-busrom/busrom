import { convertToCDNUrl } from "../cdn-url";
import {
  extractNodesAfterMarker,
  resolveMediaFromNodes,
  MediaObject
} from "../lexical-utils";

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
  titleHtml?: string;
  subtitleHtml?: string;
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
  productSeries: { title: string; titleHtml?: string; products: OneStopProduct[] };
  brandHighlights: {
    titleLine1: string;
    titleLine1Html?: string;
    titleLine2: string;
    titleLine2Html?: string;
    items: any[]
  };
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
    const isCode = (node.format & 16) === 16 || (node.textFormat & 16) === 16;
    if (isCode) return "";

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
  if (node.type !== "paragraph" && node.type !== "quote") return false;

  const nodeIsCode = (node.format & 16) === 16 || (node.textFormat & 16) === 16;
  if (nodeIsCode) {
    const text = (node.children || [])
      .map((c: any) => c.text || "")
      .join("")
      .trim()
      .toLowerCase();
    return text === markerId.toLowerCase();
  }

  const children = node.children || [];
  return children.some((child: any) => {
    const isCode = (child.format & 16) === 16 || (child.textFormat & 16) === 16;
    const text = (child.text || "").trim().toLowerCase();
    return isCode && text === markerId.toLowerCase();
  });
};

const isAnyMarkerNode = (node: any) => {
  if (!node) return false;
  if ((node.format & 16) === 16 || (node.textFormat & 16) === 16) return true;

  const textChildren = (node.children || []).filter((c: any) => c.type === "text" && (c.text || "").trim().length > 0);
  if (textChildren.length > 0 && textChildren.every((c: any) => (c.format & 16) === 16 || (c.textFormat & 16) === 16)) {
    return true;
  }
  return false;
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

  const targetSection = sections.find(sec => sec.some(node => isMarkerNode(node, markerId)));
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
      items.push(...node.data.images.map((g: any) => {
        // Support gallery images sourced from an Application (case gallery)
        if (g.sourceType === 'application' && g.application) {
          const appId = String(typeof g.application === 'object' ? g.application.id : g.application);
          return {
            id: appId,
            image: mediaData[appId] || null,
            title: g.title || "",
            link: g.linkUrl || "",
            sourceType: 'application'
          };
        }
        const imageId = typeof g.image === 'object' ? g.image.id : String(g.image || "");
        return {
          id: imageId,
          image: mediaData[imageId] || (typeof g.image === 'object' ? g.image : null),
          title: g.title || "",
          link: g.linkUrl || "",
          sourceType: node.type
        };
      }));
    }
    if (node.type === "productCarousel") {
      items.push({ sourceType: "productCarousel", carouselItems: node.data?.items || [] });
    }
    if (node.type === "applicationCarousel") {
      const appIds = node.data?.applicationIds || node.data?.applications;
      if (appIds) items.push({ sourceType: "applicationCarousel", applicationIds: appIds });
    }
  });

  const titleNodes = targetSection.filter(n => (n.type === "heading" || n.type === "paragraph") && !isAnyMarkerNode(n));
  let title = "";
  let subtitle = "";
  let titleHtml = "";
  let subtitleHtml = "";
  if (titleNodes.length > 0) {
    title = getDeepText(titleNodes[0], false).trim();
    titleHtml = getDeepText(titleNodes[0], true).trim();
    if (titleNodes.length > 1) {
      subtitle = getDeepText(titleNodes[1], false).trim();
      subtitleHtml = getDeepText(titleNodes[1], true).trim();
    }
  }

  return { title, subtitle, titleHtml, subtitleHtml, items, autoplay, interval, titleNodes };
};

const getDeterministicIndex = (str: string, max: number) => {
  if (max <= 1) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

const mapProductsWithCarouselConfig = (products: any[], carouselItems: any[] = [], locale: string) => {
  const usedProductIds = new Set<string>();
  return carouselItems.map((item: any, idx: number) => {
    const getTargetId = (val: any) => (typeof val === 'object' && val !== null ? val.id : val);

    let product = null;
    if (item.selectionMode === 'manual') {
      const targetId = getTargetId(item.product);
      product = products.find(p => String(p.id) === String(targetId));
    } else {
      const targetSeriesId = getTargetId(item.productSeries);

      // Find all products belonging to this series
      const seriesProducts = products.filter(p => {
        const pSeriesId = typeof p.series === 'object' && p.series !== null ? p.series.id : p.series;
        return String(pSeriesId) === String(targetSeriesId);
      });

      // Filter to unused products
      const unusedProducts = seriesProducts.filter(p => !usedProductIds.has(p.id));

      if (unusedProducts.length > 0) {
        // Deterministically pick one based on seed
        const seed = `${item.id || ''}-${targetSeriesId || ''}-${idx}`;
        const pickIdx = getDeterministicIndex(seed, unusedProducts.length);
        product = unusedProducts[pickIdx];
      } else if (seriesProducts.length > 0) {
        // Fallback: reuse products from same series
        const seed = `${item.id || ''}-${targetSeriesId || ''}-${idx}`;
        const pickIdx = getDeterministicIndex(seed, seriesProducts.length);
        product = seriesProducts[pickIdx];
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

    // Hydrate Product Attributes + Custom Attributes — deterministically shuffle by product ID, pick 4
    let resolvedAttrs: string[] = [];
    const attributePage = product.attributePage;
    if (attributePage && typeof attributePage === 'object') {
      const getArray = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'object') {
          return val[locale] || val['en'] || val['zh'] || val['cn'] || [];
        }
        return [];
      };

      const prodAttrs = getArray(attributePage.productAttributes);
      const custAttrs = getArray(attributePage.customAttributes);

      // Merge and extract 'value' property
      const merged = [...prodAttrs, ...custAttrs];
      resolvedAttrs = merged
        .map((attr: any) => {
          if (!attr) return '';
          if (typeof attr === 'string') return attr;
          return attr.value || '';
        })
        .filter((val: string) => val.trim().length > 0);
    }

    if (resolvedAttrs.length === 0 && product.productAttributes) {
      if (Array.isArray(product.productAttributes)) {
        resolvedAttrs = product.productAttributes.map((attr: any) => {
          if (typeof attr === 'string') return attr;
          return attr.value || '';
        }).filter(Boolean);
      } else if (typeof product.productAttributes === 'string') {
        resolvedAttrs = product.productAttributes.split('\n').filter((line: string) => line.trim());
      }
    }

    // 用 product.id 取模算起始偏移，O(1)，不同产品自动取到不同的 4 条属性
    const n = resolvedAttrs.length;
    const offset = n > 0 ? Number(product.id) % n : 0;
    const finalProductAttributes = n === 0 ? [] :
      Array.from({ length: Math.min(4, n) }, (_, i) => resolvedAttrs[(offset + i) % n]);

    return {
      ...product,
      title,
      image: displayImage, // Normalize to single 'image' prop for standard components
      showImage: displayImage, // Also keep 'showImage' for components that prefer it
      link: `/${locale}/shop/${product.slug}`,
      showName: item.showName !== false,
      showCategory: !!item.showCategory,
      categoryName,
      productAttributes: finalProductAttributes,
      _carouselItem: {
        showName: item.showName,
        showCategory: item.showCategory,
        showDescription: item.showDescription,
        showButton: item.showButton,
        showHighlights: item.showHighlights,
        highlightsCount: item.highlightsCount,
        buttonText: item.buttonText,
        openInNewTab: item.openInNewTab,
      }
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
  const processIconList = extractNodesAfterMarker(contentChildren, "how-to-make-item").find((n: any) => n.type === "iconList");
  const processImageGallery = extractNodesAfterMarker(contentChildren, "how-to-make-image").find((n: any) => n.type === "custom-image-gallery");

  const combinedProcessItems: any[] = [];
  if (processIconList || processImageGallery) {
    const iconItems = processIconList?.data?.items || [];
    const imageItems = processImageGallery?.data?.images || [];
    const maxLen = Math.max(iconItems.length, imageItems.length);
    for (let i = 0; i < maxLen; i++) {
      const iconItem = iconItems[i] || {};
      const imgItem = imageItems[i] || {};
      let finalImage = null;
      if (imgItem.sourceType === 'application' && imgItem.application) {
        const appId = String(typeof imgItem.application === 'object' ? imgItem.application.id : imgItem.application);
        // resolveAllMedia pre-computes a random image for each Application id
        finalImage = mediaData[appId] || null;
        if (!finalImage) {
          const app = applicationsRes.find((a: any) => String(a.id) === appId);
          if (app) {
            const picked = getRandomAppImage(app);
            finalImage = picked?.image || picked || null;
          }
        }
      } else {
        finalImage = imgItem.image ? (mediaData[typeof imgItem.image === 'object' ? imgItem.image.id : String(imgItem.image)] || (typeof imgItem.image === 'object' ? imgItem.image : null)) : null;
      }

      combinedProcessItems.push({
        title: iconItem.title || "",
        description: iconItem.subtitle || "",
        icon: iconItem.icon || "",
        image: finalImage,
      });
    }
  }


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
  const btnNodes = extractNodesAfterMarker(contentChildren, "product-show-btn");
  const btnNode = btnNodes.find((n: any) => n.type === "linkJump");
  if (btnNode && btnNode.data) {
    viewMoreText = (btnNode.data.title || btnNode.data.description || "VIEW MORE").toUpperCase();
    if (btnNode.data.url) viewMoreLink = `/${locale}${btnNode.data.url.replace('/pages/', '/').replace(/^\/(en|cn|ja|de|...)\//, '/')}`;
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
    : products.map((p: any) => ({ ...p, title: p.category?.name || p.name, link: `/${locale}/shop/${p.slug}` }));

  // Series
  const seriesRaw = extractSectionRaw(contentChildren, "product-attribute", mediaData);
  const seriesCarousel = seriesRaw.items.find((it: any) => it.sourceType === 'productCarousel');
  const seriesProducts = seriesCarousel ? mapProductsWithCarouselConfig(products, seriesCarousel.carouselItems, locale) : products.map((p: any) => ({ ...p, title: p.category?.name || p.name, link: `/${locale}/shop/${p.slug}` }));

  // Brand Highlights
  const brandHighlightsRaw = extractSectionRaw(contentChildren, "brand-highlights-item", mediaData);

  // Trust
  const trustRaw = extractSectionRaw(contentChildren, "why-contractors-trust-us-item", mediaData);
  const trustListNodes = extractNodesAfterMarker(contentChildren, "why-contractors-trust-us-item");
  const trustList = trustListNodes.find((n: any) => n.type === "list")?.children || [];
  const trustItems = [];
  for (let i = 0; i < trustList.length; i += 2) {
    if (trustList[i]) trustItems.push({ title: getDeepText(trustList[i]).trim(), description: trustList[i + 1] ? getDeepText(trustList[i + 1]).trim() : "" });
  }
  const trustBgImage = resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, "why-contractors-trust-us-bg-image"), mediaData)[0] || null;

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
  const ctaImage = resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, "contact-form-image"), mediaData)[0] || null;
  const formNode = contentChildren.find((n: any) => n.type === "formBlock");

  // OEM ODM Guide
  const oemRaw = extractSectionRaw(contentChildren, "oem-odm-guide", mediaData);
  let oemTitle = oemRaw.title || "READY TO\nJOIN IN BUSROM?";
  const oemTitleNodes = extractNodesAfterMarker(contentChildren, "oem-odm-guide-title");
  if (oemTitleNodes.length > 0) oemTitle = getDeepText(oemTitleNodes[0], false);
  const oemBgImage = resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, "oem-odm-guide-bg-image"), mediaData)[0] || (oemRaw.items[0]?.image || null);

  const blockConfig = formNode?.data?.formConfig;
  const pageConfig = pageContent.formConfig;
  // Prefer populated object with fields, fallback to whatever is available
  const bestFormConfig = (blockConfig?.fields ? blockConfig : (pageConfig?.fields ? pageConfig : (blockConfig || pageConfig)));


  return {
    hero: { ...heroRaw },
    problems: { ...problemsRaw },
    advantages: { title: advantagesRaw.title, subtitle: "", items: advantagesRaw.items },
    process: { title: processRaw.title, subtitle: "", items: combinedProcessItems.length > 0 ? combinedProcessItems : processRaw.items },
    showcase: {
      title: showcaseRaw.title,
      titleHtml: showcaseRaw.titleHtml,
      subtitle: showcaseRaw.subtitle,
      subtitleHtml: showcaseRaw.subtitleHtml,
      items: showcaseRaw.items,
      viewMoreText,
      viewMoreLink,
      products: showcaseProducts
    },
    categories: { title: categoriesRaw.title, subtitle: categoriesRaw.subtitle, products: categoriesProducts },
    productSeries: {
      title: seriesRaw.title,
      titleHtml: seriesRaw.titleHtml,
      products: seriesProducts
    },
    brandHighlights: {
      titleLine1: brandHighlightsRaw.title,
      titleLine1Html: brandHighlightsRaw.titleHtml,
      titleLine2: brandHighlightsRaw.subtitle,
      titleLine2Html: brandHighlightsRaw.subtitleHtml,
      items: brandHighlightsRaw.items
    },
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
