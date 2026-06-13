import { 
  flattenLexicalChildren, 
  extractNodesAfterMarker, 
  getMediaIdFromNode,
  resolveMediaFromNodes,
  MediaObject
} from "@/lib/lexical-utils";
import { convertToCDNUrl } from "@/lib/cdn-url";

export interface HeroSlide {
  gradientTitle: string;
  mainTitle: string;
  subtitle: string;
}

export interface WhyChooseUsItem {
  id: string;
  number: string;
  title: string;
  description: string;
  descriptionParts: { text: string; bold?: boolean }[];
  imageLeft: string;
  imageRight: string;
}

export interface ApplicationData {
  hero: {
    slides: HeroSlide[];
    images: MediaObject[];
    titleText: string;
    topSubtitleText: string;
    rightBoxText: string;
    bottomBoxText: string;
    seeAllText: string;
    seeAllHref: string;
  };
  productNavigation: {
    ctaText: string;
    ctaHref: string;
    navigationItems: any[];
  };
  engineerSaid: {
    title?: string;
    mainQuote?: string;
    leftQuote?: string;
    rightQuote?: string;
    ctaText: string;
    ctaHref: string;
    engineerImageUrl?: string;
    workImageUrl?: string;
  };
  whyChooseUs: {
    decorate?: string;
    title?: string;
    items: WhyChooseUsItem[];
  };
  applicationCases: {
    title?: string;
    subtitle?: string;
    titleImage?: string;
    applicationIds: string[];
  };
  moreApplications: {
    hasMore: boolean;
    title: { text: string; bold?: boolean }[];
    tips: string;
    ctaText: string;
    ctaHref: string;
    applicationIds: string[];
  };
  contactForm: {
    bgImage?: string;
    displayImage?: string;
    logoImage?: string;
    richText: { text: string; bold?: boolean }[];
    formId?: string;
    formConfig?: any;
  };
  guide: {
    title: { text: string; bold?: boolean; linebreak?: boolean }[];
    image?: string;
    description: { text: string; bold?: boolean; linebreak?: boolean }[];
    serviceCta?: { title: string; url: string };
    oemCta?: { title: string; url: string };
  };
}

export function parseApplicationData(locale: string, pageContent: any): ApplicationData {
  const root = pageContent?.contentTranslation?.root || pageContent?.content?.root;
  const children: any[] = root?.children || [];
  const mediaData: Record<string, MediaObject> = pageContent?.mediaData || {};

  const extractText = (markerId: string) => {
    const nodes = extractNodesAfterMarker(children, markerId);
    if (nodes.length === 0) return "";
    return (nodes[0]?.children || []).map((c: any) => {
      if (c.type === 'linebreak') return "\n";
      return c.text || "";
    }).join("").trim();
  };

  const findImgUrlByMarker = (marker: string) => {
    const nodes = extractNodesAfterMarker(children, marker);
    const mediaNodes = resolveMediaFromNodes(nodes, mediaData);
    return mediaNodes[0]?.url;
  };

  const findRichTextByMarker = (marker: string) => {
    const nodes = extractNodesAfterMarker(children, marker);
    return nodes.flatMap(n => n.children || []).map((c: any) => ({
      text: c.type === 'linebreak' ? "\n" : (c.text || ""),
      bold: typeof c.format === 'number' && (c.format & 1) !== 0,
      italic: typeof c.format === 'number' && (c.format & 2) !== 0,
      linebreak: c.type === 'linebreak'
    }));
  };

  const findLinkByMarker = (marker: string) => {
    const nodes = extractNodesAfterMarker(children, marker);
    const linkNode = nodes.find(n => n.type === 'linkJump');
    if (linkNode) {
      // Prioritize description for CTA text as it often contains manual linebreaks
      const title = (linkNode.data?.description || linkNode.data?.title || "").trim();
      return { 
        title, 
        url: linkNode.data?.url || "" 
      };
    }
    return undefined;
  };

  // 1. Hero
  const heroItemNodes = extractNodesAfterMarker(children, "hero-section-item");
  const slides: HeroSlide[] = [];
  const listNode = heroItemNodes.find(n => n.type === "list");
  if (listNode && listNode.children) {
    const items = listNode.children;
    for (let i = 0; i < items.length; i += 2) {
      const titleItem = items[i];
      const subtitleItem = items[i + 1];
      if (!titleItem) break;

      let gradientTitle = "";
      let mainTitle = "";
      for (const child of titleItem.children || []) {
        if (child.type === "text") {
          if (child.format === 1) gradientTitle += child.text;
          else mainTitle += child.text;
        } else if (child.type === "linebreak") {
          // If we have a linebreak, we need to decide where to put it. 
          // Usually it should go to mainTitle if it's not explicitly formatted,
          // but for safety we can append it to whichever title is currently being built.
          mainTitle += "\n";
        }
      }

      let subtitle = "";
      if (subtitleItem) {
        const nestedList = subtitleItem.children?.find((c: any) => c.type === "list");
        const subNodes = nestedList ? (nestedList.children?.[0]?.children || []) : (subtitleItem.children || []);
        subtitle = subNodes.map((c: any) => {
          if (c.type === "text") return c.text;
          if (c.type === "linebreak") return "\n";
          return "";
        }).join("");
      }

      slides.push({
        gradientTitle: gradientTitle.trim(),
        mainTitle: mainTitle.trim(),
        subtitle: subtitle.trim(),
      });
    }
  }

  const ctaHero = findLinkByMarker("hero-section-cta");

  // 2. Product Navigation
  const navCta = findLinkByMarker("product-navigation-cta");
  const navItemNodes = extractNodesAfterMarker(children, "product-navigation-item");
  const prodCarouselNode = navItemNodes.find((n: any) => n.type === "carousel");

  const navigationItems: any[] = [];
  if (prodCarouselNode && prodCarouselNode.data?.slides) {
    prodCarouselNode.data.slides.forEach((slide: any) => {
      const mediaId = slide.image?.id;
      const media = mediaId ? mediaData[mediaId] : null;
      navigationItems.push({
        name: slide.title || "",
        showImage: media ? { url: media.url } : null,
        slug: slide.buttonLink || "",
        openInNewTab: !!slide.openInNewTab,
        description: slide.description || "",
      });
    });
  }

  // 3. Engineer Said
  const engImgNodes = extractNodesAfterMarker(children, "engineer-said-image");
  const engMedia = resolveMediaFromNodes(engImgNodes, mediaData);
  
  // Restore fallback support for explicit work image marker if it exists
  const workImgNodes = extractNodesAfterMarker(children, "engineer-said-work");
  const workMedia = resolveMediaFromNodes(workImgNodes, mediaData);
  
  const engCta = findLinkByMarker("engineer-said-cta");

  // 4. Why Choose Us
  const whyItemNodes = extractNodesAfterMarker(children, "why-contractors-choose-us-item");
  const whyImgNodes = extractNodesAfterMarker(children, "why-contractors-choose-us-image");
  const whyMedia = resolveMediaFromNodes(whyImgNodes, mediaData);
  
  const whyChooseUsItems: WhyChooseUsItem[] = [];
  const whyListNode = whyItemNodes.find(n => n.type === "list");
  if (whyListNode && whyListNode.children) {
    const listItems = whyListNode.children;
    for (let i = 0; i < listItems.length; i += 2) {
      const titleItem = listItems[i];
      const contentItem = listItems[i + 1];
      if (!titleItem) break;

      const title = (titleItem.children || []).map((c: any) => (c.type === 'linebreak' ? '\n' : c.text || '')).join("");
      
      const descriptionParts: { text: string, bold?: boolean }[] = [];
      if (contentItem) {
        const nestedList = contentItem.children?.find((c: any) => c.type === "list");
        const targetNodes = nestedList ? (nestedList.children || []).flatMap((li: any, idx: number, arr: any[]) => [...(li.children || []), ...(idx < arr.length - 1 ? [{ type: 'linebreak' }] : [])]) : (contentItem.children || []);
        
        targetNodes.forEach((node: any) => {
          if (node.type === 'text') descriptionParts.push({ text: node.text, bold: (node.format & 1) === 1 });
          else if (node.type === 'linebreak') descriptionParts.push({ text: '\n' });
        });
      }

      const itemIdx = i / 2;
      whyChooseUsItems.push({
        id: String(itemIdx + 1),
        number: String(itemIdx + 1).padStart(2, '0'),
        title,
        description: descriptionParts.map(p => p.text).join(""),
        descriptionParts,
        imageLeft: whyMedia[itemIdx * 2]?.url || "",
        imageRight: whyMedia[itemIdx * 2 + 1]?.url || ""
      });
    }
  }

  // 5. Application Cases
  const casesNodes = extractNodesAfterMarker(children, "applications-item");
  const caseCarousel = casesNodes.find((n: any) => n.type === "applicationCarousel");

  // 6. More Applications
  const moreAppNodes = extractNodesAfterMarker(children, "more-applications");
  
  const findSubContent = (nodes: any[], marker: string) => {
    const target = marker.trim().toLowerCase();
    const idx = nodes.findIndex(n => (n.children || []).map((c: any) => c.text || "").join("").trim().toLowerCase() === target);
    if (idx === -1) return [];
    const result: any[] = [];
    for (let i = idx + 1; i < nodes.length; i++) {
       const text = (nodes[i].children || []).map((c: any) => c.text || "").join("").trim().toLowerCase();
       if (text.startsWith("more-applications-")) break;
       result.push(nodes[i]);
    }
    return result;
  };

  const moreTitleNodes = findSubContent(moreAppNodes, "more-applications-title");
  const moreCtaNodes = findSubContent(moreAppNodes, "more-applications-cta");
  const moreCta = moreCtaNodes.find(n => n.type === 'linkJump');
  const moreCarousel = moreAppNodes.find(n => n.type === "applicationCarousel" || n.type === "productCarousel");

  // 7. Contact Form
  const contactFormNodes = extractNodesAfterMarker(children, "contact-form-block");
  const formNode = contactFormNodes.find(n => n.type === 'formBlock');

  return {
    hero: {
      slides,
      images: resolveMediaFromNodes(extractNodesAfterMarker(children, "hero-section-image"), mediaData),
      titleText: extractText("hero-section-title"),
      topSubtitleText: extractText("hero-section-subtitle"),
      rightBoxText: extractText("hero-section-right-box-text"),
      bottomBoxText: extractText("hero-section-bottom-box-text"),
      seeAllText: ctaHero?.title || "",
      seeAllHref: ctaHero?.url || ""
    },
    productNavigation: {
      ctaText: navCta?.title || "VIEW MORE",
      ctaHref: navCta?.url || "",
      navigationItems
    },
    engineerSaid: {
      title: extractText("engineer-said-title") || "The Engineer\nSaid",
      mainQuote: extractText("engineer-said-center"),
      leftQuote: extractText("engineer-said-left"),
      rightQuote: extractText("engineer-said-right"),
      ctaText: engCta?.title || "Explore\nMore",
      ctaHref: engCta?.url || "",
      // If we have a dedicated work image gallery, use it. Otherwise, use index 1 from engineer gallery.
      engineerImageUrl: engMedia[0]?.url,
      workImageUrl: workMedia[0]?.url || engMedia[1]?.url
    },
    whyChooseUs: {
      decorate: extractText("why-contractors-choose-us-decorate"),
      title: extractText("why-contractors-choose-us-title"),
      items: whyChooseUsItems
    },
    applicationCases: {
      title: extractText("applications-title") || extractText("applications"),
      subtitle: extractText("applications-subtitle") || extractText("applications-item"),
      titleImage: findImgUrlByMarker("applications-title-image"),
      applicationIds: caseCarousel?.data?.applications?.map((a: any) => typeof a === 'object' && a !== null ? a.id : a) || []
    },
    moreApplications: {
      hasMore: moreAppNodes.length > 0,
      title: moreTitleNodes.flatMap(n => n.children || []).map(c => ({ text: c.text, bold: (c.format & 1) === 1 })),
      tips: (findSubContent(moreAppNodes, "more-applications-tips")[0]?.children || []).map((c: any) => c.text).join("").trim(),
      ctaText: moreCta?.data?.title || "VIEW MORE",
      ctaHref: moreCta?.data?.url || "",
      applicationIds: moreCarousel?.data?.applications?.map((a: any) => typeof a === 'object' && a !== null ? a.id : a) || []
    },
    contactForm: {
      bgImage: findImgUrlByMarker("contact-form-bg-image"),
      displayImage: findImgUrlByMarker("contact-form-image") || findImgUrlByMarker("contact-form-display-image"),
      logoImage: findImgUrlByMarker("contact-form-logo"),
      richText: findRichTextByMarker("contact-form-title"),
      formConfig: formNode?.data?.formConfig
    },
    guide: {
      title: findRichTextByMarker("application-guide-title"),
      image: findImgUrlByMarker("application-guide-image"),
      description: findRichTextByMarker("application-guide-description"),
      serviceCta: findLinkByMarker("application-guide-cta-service"),
      oemCta: findLinkByMarker("application-guide-cta-oem-odm")
    }
  };
}
