import { convertToCDNUrl } from "../cdn-url";

interface MediaObject {
  id: string;
  url: string;
  alt?: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
  };
}

export interface SupportData {
  hero: {
    title: any[];
    tips: string;
    subtitle: string;
    cta: {
      title: string;
      content: string;
      buttonText: string;
    };
    image: MediaObject | null;
  } | null;
  commitment: {
    mainTitle: any[];
    subtitle: any[];
    technical: { title: string; items: any[] };
    marketing: { title: string; items: any[] };
  } | null;
  customized: {
    mainTitle: any[];
    product: { title: string; items: any[] };
    manufacturing: { title: string; items: any[] };
  } | null;
  qualityControl: {
    title: any[];
    items: any[];
  } | null;
  decorator: {
    leftText: string;
    rightText: string;
    image: MediaObject | null;
  } | null;
  remote: {
    titleNodes: any[];
    descNodes: any[];
    cta: { title: string; description: string; url: string };
    image: MediaObject | null;
  } | null;
  process: {
    titleNodes: any[];
    subtitleNodes: any[];
    items: any[];
  } | null;
  marketingSales: {
    title: string;
    decoratorText: string;
    area1: { title: string; items: any[] };
    area2: { title: string; items: any[] };
  } | null;
  contactForm: {
    title?: string;
    description?: string;
    images: MediaObject[];
    formConfig: any;
  } | null;
  applications: {
    items: any[];
    applicationIds: string[];
    carouselConfig: any;
  };
  quote: {
    slides: any[];
    autoplay: boolean;
    interval: number;
  } | null;
}

// --------------------------------------------------------------------------
// Helpers (Adapted from SupportTemplate)
// --------------------------------------------------------------------------

function getNodeTotalText(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getNodeTotalText).join("");
  if (typeof node === "string") return node;
  if (node.type === "linebreak") return "\n";
  if (node.type === "paragraph" || node.type === "quote" || node.type === "heading") return getNodeTotalText(node.children) + "\n";
  if (node.text) return node.text;
  if (node.children) return getNodeTotalText(node.children);
  return "";
}

function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false;
  const result: any[] = [];
  const target = markerId.toLowerCase().trim();

  for (const node of children) {
    const totalText = getNodeTotalText(node).trim().toLowerCase();
    
    const isMarkerBlock = 
      (node.type === "paragraph" || node.type === "quote" || node.type === "code") &&
      totalText === target;

    if (isMarkerBlock) {
      if (foundMarker) break; 
      foundMarker = true;
      continue;
    }

    const isNewMarker = 
      foundMarker && 
      (node.type === "paragraph" || node.type === "code" || node.type === "quote") && 
      (node.children?.[0]?.format === 16 || (totalText.includes("-") && totalText.length > 5 && !totalText.includes(" ") && !totalText.startsWith(target + "-")));

    if (isNewMarker) break;

    if (foundMarker) result.push(node);
  }
  
  if (result.length === 0 && markerId === "support-request-process-subtitle") {
    let startCollecting = false;
    for (const node of children) {
        const text = getNodeTotalText(node).toLowerCase();
        if (text.includes("process-title")) { startCollecting = true; continue; }
        if (text.includes("process-item")) break;
        if (startCollecting && text.includes("process")) {
            result.push(node);
            break;
        }
    }
  }

  return result;
}

// --------------------------------------------------------------------------
// Main Parser
// --------------------------------------------------------------------------

export function parseSupportData(locale: string, rawData: any): SupportData {
  const children = rawData.contentTranslation?.root?.children || 
                   rawData.content?.root?.children || 
                   rawData.content?.children || [];
  
  const mediaData = rawData.mediaData || {};

  // Resolve image helper
  const resolveMedia = (id: any) => {
    if (!id) return null;
    const mediaId = typeof id === "object" ? id.id : String(id);
    return mediaData[mediaId] || null;
  };

  // 1. Hero
  let heroData = null;
  const hasHeroMarker = children.some((node: any) => {
    const txt = getNodeTotalText(node).trim();
    return txt === "hero-section" || (node.children?.[0]?.format === 16 && txt === "hero-section");
  });

  if (hasHeroMarker) {
    const titleNodes = extractAfterMarker(children, "hero-section-title");
    let title: any[] = [];
    titleNodes.forEach(node => {
      if (node.children) title = [...title, ...node.children];
      else if (node.text || node.type === "linebreak") title.push(node);
    });

    const tips = getNodeTotalText(extractAfterMarker(children, "hero-section-title-tips")).trim();
    const subtitle = getNodeTotalText(extractAfterMarker(children, "hero-section-subtitle")).trim();
    const ctaTitle = getNodeTotalText(extractAfterMarker(children, "hero-section-cta-title")).trim();
    const ctaContent = getNodeTotalText(extractAfterMarker(children, "hero-section-cta-content")).trim();
    const ctaBtn = getNodeTotalText(extractAfterMarker(children, "hero-section-cta-btn")).trim();

    const imgNodes = extractAfterMarker(children, "hero-section-image");
    const imgId = imgNodes.length > 0 && imgNodes[0].type === "singleImage" 
       ? imgNodes[0].data?.image?.id 
       : null;
    const image = resolveMedia(imgId);

    heroData = {
      title,
      tips,
      subtitle,
      cta: { title: ctaTitle, content: ctaContent, buttonText: ctaBtn },
      image
    };
  }

  // 2. Commitment
  const mainTitleNodes = extractAfterMarker(children, "support-commitment-title");
  const mainTitleStr = getNodeTotalText(mainTitleNodes);
  const subtitleNodes = extractAfterMarker(children, "support-commitment-subtitle");
  
  const techTitle = getNodeTotalText(extractAfterMarker(children, "support-commitment-technical-title")).trim();
  const techItemNodes = extractAfterMarker(children, "support-commitment-technical-item");
  const techItems: any[] = [];
  techItemNodes.forEach(node => {
    if (node.type === "iconList" && node.data?.items) techItems.push(...node.data.items);
  });

  const marketTitle = getNodeTotalText(extractAfterMarker(children, "support-commitment-marketing-title")).trim();
  const marketItemNodes = extractAfterMarker(children, "support-commitment-marketing-item");
  const marketItems: any[] = [];
  marketItemNodes.forEach(node => {
    if (node.type === "iconList" && node.data?.items) marketItems.push(...node.data.items);
  });

  const commitmentData = (mainTitleStr || techItems.length > 0 || marketItems.length > 0) ? {
    mainTitle: mainTitleNodes,
    subtitle: subtitleNodes,
    technical: { title: techTitle, items: techItems },
    marketing: { title: marketTitle, items: marketItems }
  } : null;

  // 3. Customized
  const customTitleNodes = extractAfterMarker(children, "support-customized-title");
  let customizedData = null;
  if (customTitleNodes.length > 0) {
    const productTitleStr = getNodeTotalText(extractAfterMarker(children, "support-customized-product-title")).trim();
    const productItemNodes = extractAfterMarker(children, "support-customized-product-item");
    const productItems: any[] = [];
    productItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        productItems.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: resolveMedia(item.image?.id || item.image)
        })));
      }
    });

    const manufactureTitleStr = getNodeTotalText(extractAfterMarker(children, "support-customized-manufacturing-title")).trim();
    const manufactureItemNodes = extractAfterMarker(children, "support-customized-manufacturing-item");
    const manufactureItems: any[] = [];
    manufactureItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        manufactureItems.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: resolveMedia(item.image?.id || item.image)
        })));
      }
    });

    customizedData = {
      mainTitle: customTitleNodes,
      product: { title: productTitleStr, items: productItems },
      manufacturing: { title: manufactureTitleStr, items: manufactureItems }
    };
  }

  // 4. Quality Control
  let qualityTitleNodes = extractAfterMarker(children, "support-quality-control-title");
  if (qualityTitleNodes.length === 0) qualityTitleNodes = extractAfterMarker(children, "quality-control-title");

  let qualityItemNodes = extractAfterMarker(children, "support-quality-control-item");
  if (qualityItemNodes.length === 0) qualityItemNodes = extractAfterMarker(children, "quality-control-item");
  if (qualityItemNodes.length === 0) qualityItemNodes = extractAfterMarker(children, "support-quality-control-slides");

  const qualityItems: any[] = [];
  qualityItemNodes.forEach(node => {
    if (node.type === "carousel" && node.data?.slides) {
      qualityItems.push(...node.data.slides.map((item: any) => ({
        id: item.id || Math.random().toString(),
        title: item.title,
        description: item.description,
        buttonText: item.buttonText,
        image: resolveMedia(item.image?.id || item.image)
      })));
    }
  });

  const qualityControlData = (qualityTitleNodes.length > 0 || qualityItems.length > 0) ? {
    title: qualityTitleNodes,
    items: qualityItems
  } : null;

  // 5. Decorator
  const decoratorLeftNodes = extractAfterMarker(children, "support-decorator-left");
  const decoratorRightNodes = extractAfterMarker(children, "support-decorator-right");
  const decoratorImageNodes = extractAfterMarker(children, "support-decorator-image");

  const leftText = decoratorLeftNodes.length > 0 ? getNodeTotalText(decoratorLeftNodes[0]).trim() : "busrom";
  const rightText = decoratorRightNodes.length > 0 ? getNodeTotalText(decoratorRightNodes[0]).trim() : "support";
  
  let decoratorImage = null;
  const decImgNode = decoratorImageNodes.find(n => n.type === "image" || n.type === "singleImage");
  if (decImgNode) {
    decoratorImage = resolveMedia(decImgNode.type === "singleImage" ? decImgNode.data?.image?.id : decImgNode.image?.id);
  }

  const decoratorData = { leftText, rightText, image: decoratorImage };

  // 6. Remote
  const remoteTitleNodes = extractAfterMarker(children, "support-remote-title");
  const remoteDescNodes = extractAfterMarker(children, "support-remote-description");
  const remoteCtaNodes = extractAfterMarker(children, "support-remote-cta");
  const remoteImageNodes = extractAfterMarker(children, "support-remote-image");

  let remoteCta = { title: "24H Response", description: "Lightning-Fast Resolution", url: "/support" };
  const remoteCtaNode = remoteCtaNodes.find(n => n.type === "linkJump");
  if (remoteCtaNode?.data) {
    remoteCta = {
      title: remoteCtaNode.data.title || "24H Response",
      description: remoteCtaNode.data.description || "Lightning-Fast Resolution",
      url: (remoteCtaNode.data.url || "/support").replace('/pages/', '/')
    };
  }

  let remoteImage = null;
  const remImgNode = remoteImageNodes.find(n => n.type === "singleImage" || n.type === "image");
  if (remImgNode) {
    remoteImage = resolveMedia(remImgNode.type === "singleImage" ? remImgNode.data?.image?.id : (remImgNode as any).image?.id);
  }

  const remoteData = { titleNodes: remoteTitleNodes, descNodes: remoteDescNodes, cta: remoteCta, image: remoteImage };

  // 7. Process
  const processTitleNodes = extractAfterMarker(children, "support-request-process-title");
  const processSubtitleNodes = extractAfterMarker(children, "support-request-process-subtitle");
  const processItemNodes = extractAfterMarker(children, "support-request-process-item");
  const processItems: any[] = [];
  
  const iconListNode = processItemNodes.find(n => n.type === "iconList");
  if (iconListNode?.data?.items) {
    iconListNode.data.items.forEach((item: any, idx: number) => {
      processItems.push({
        id: `item-${idx + 1}`,
        title: item.title,
        content: [{ type: "text", text: item.title, format: 0 }],
        icon: item.icon ? { url: convertToCDNUrl(item.icon) } : null
      });
    });
  }

  const processData = (processTitleNodes.length > 0 || processSubtitleNodes.length > 0 || processItems.length > 0) ? {
    titleNodes: processTitleNodes,
    subtitleNodes: processSubtitleNodes,
    items: processItems
  } : null;

  // 8. Marketing Sales
  let marketSalesTitleNodes = extractAfterMarker(children, "marketing-and-sales-title");
  if (marketSalesTitleNodes.length === 0) {
    const marketGuard = extractAfterMarker(children, "marketing-and-sales");
    if (marketGuard.length > 0) marketSalesTitleNodes = marketGuard; 
  }

  let marketingSalesData = null;
  if (marketSalesTitleNodes.length > 0) {
    const area1Title = getNodeTotalText(extractAfterMarker(children, "marketing-and-sales-area1-title")).trim();
    const area1ItemNodes = extractAfterMarker(children, "marketing-and-sales-area1-item");
    const area1Items: any[] = [];
    area1ItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        area1Items.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: resolveMedia(item.image?.id || item.image)
        })));
      }
    });

    const area2Title = getNodeTotalText(extractAfterMarker(children, "marketing-and-sales-area2-title")).trim();
    const area2ItemNodes = extractAfterMarker(children, "marketing-and-sales-area2-item");
    const area2Items: any[] = [];
    area2ItemNodes.forEach(node => {
      if (node.type === "carousel" && node.data?.slides) {
        area2Items.push(...node.data.slides.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          description: item.description,
          image: resolveMedia(item.image?.id || item.image)
        })));
      }
    });

    const decoratorText = getNodeTotalText(extractAfterMarker(children, "marketing-and-sales-decorator")).trim() || "SUPPORT";

    marketingSalesData = {
      title: getNodeTotalText(marketSalesTitleNodes).trim(),
      decoratorText,
      area1: { title: area1Title, items: area1Items },
      area2: { title: area2Title, items: area2Items }
    };
  }

  // 9. Contact Form
  const contactTerritory = extractAfterMarker(children, "contact-form");
  const contactScope = contactTerritory.length > 0 ? contactTerritory : children;
  const contactTitle = getNodeTotalText(extractAfterMarker(contactScope, "contact-form-title")).trim();
  const contactDesc = getNodeTotalText(extractAfterMarker(contactScope, "contact-form-description")).trim();
  
  const contactImgNodes = extractAfterMarker(contactScope, "contact-form-image");
  const scavengedImgs = contactImgNodes.length > 0 ? contactImgNodes : contactScope;
  const contactImages: any[] = [];
  
  scavengedImgs.forEach((node: any) => {
    if (node.type === "carousel" && node.data?.slides) {
      contactImages.push(...node.data.slides.map((s: any) => resolveMedia(s.image?.id || s.image)).filter(Boolean));
    }
    if (node.type === "custom-image-gallery" && node.data?.images) {
      contactImages.push(...node.data.images.map((s: any) => resolveMedia(s.image?.id || s.image || s.media?.id || s.media)).filter(Boolean));
    }
  });

  if (contactImages.length === 0) {
    children.forEach((node: any) => {
      if (node.type === "custom-image-gallery" && node.data?.images) {
        contactImages.push(...node.data.images.map((s: any) => resolveMedia(s.image?.id || s.image || s.media?.id || s.media)).filter(Boolean));
      }
    });
  }

  const blockMarkerNodes = extractAfterMarker(contactScope, "contact-form-block");
  const formNode = blockMarkerNodes.find(n => n.type === "formBlock") || contactScope.find((n: any) => n.type === "formBlock");
  const formConfig = formNode?.data?.formConfig || formNode?.data || (rawData as any).formConfig || null;

  const contactFormData = (contactImages.length > 0 || formConfig) ? {
    title: contactTitle,
    description: contactDesc,
    images: contactImages,
    formConfig
  } : null;

  // 10. Applications
  let appItems: any[] = [];
  let applicationIds: string[] = [];
  let carouselConfig = {} as any;

  let appTerritory = extractAfterMarker(children, "applications") || [];
  if (appTerritory.length === 0) appTerritory = extractAfterMarker(children, "applications-section") || [];
  if (appTerritory.length === 0) appTerritory = extractAfterMarker(children, "support-applications") || [];
  if (appTerritory.length === 0) appTerritory = extractAfterMarker(children, "applications-item") || [];

  const appScope = (appTerritory && appTerritory.length > 0) ? appTerritory : children;
  
  for (const node of appScope) {
    if (node.type === "applicationCarousel" && node.data?.applications) {
      applicationIds = node.data.applications.map((a: any) => String(a.id || a)).filter(Boolean);
      carouselConfig = node.data;
      break;
    }
    if (node.type === "carousel" && node.data?.slides) {
      appItems.push(...node.data.slides.map((s: any) => ({
        id: s.id || Math.random().toString(),
        title: s.title || "",
        image: resolveMedia(s.image?.id || s.image)
      })));
      break;
    }
  }

  if (appItems.length === 0 && applicationIds.length === 0) {
    const globalAppNode = children.find((n: any) => n.type === "applicationCarousel");
    if (globalAppNode?.data?.applications) {
      applicationIds = globalAppNode.data.applications.map((a: any) => String(a.id || a)).filter(Boolean);
      carouselConfig = globalAppNode.data;
    }
  }

  // 11. Quote
  const quoteScope = extractAfterMarker(children, "quote-item");
  let quoteData = null;
  const quoteNode = quoteScope.find((n: any) => n.type === "carousel");
  if (quoteNode?.data?.slides) {
    quoteData = {
      slides: quoteNode.data.slides.map((s: any) => ({
        ...s,
        image: resolveMedia(s.image?.id || s.image)
      })),
      autoplay: quoteNode.data.autoplay !== false,
      interval: quoteNode.data.interval || 5
    };
  }

  return {
    hero: heroData,
    commitment: commitmentData,
    customized: customizedData,
    qualityControl: qualityControlData,
    decorator: decoratorData,
    remote: remoteData,
    process: processData,
    marketingSales: marketingSalesData,
    contactForm: contactFormData,
    applications: { items: appItems, applicationIds, carouselConfig },
    quote: quoteData
  };
}
