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

export interface CarouselSlide {
  title: string;
  description: string;
  image: MediaObject | null;
  link?: string;
  buttonText?: string;
  showButton?: boolean;
  openInNewTab?: boolean;
}

export interface CarouselData {
  slides: CarouselSlide[];
  autoplay: boolean;
  interval: number;
}

export interface BrandPositionItem {
  title: string;
  description?: string;
  image: MediaObject | null;
  link?: string;
}

export interface OurStoryData {
  hero: {
    titleNodes: any[];
    subtitle: string;
    content: string;
    descriptionNodes: any[];
    items: string[];
    heroImage: string;
  };
  whoWeAre: {
    titleNodes: any[];
    content: string;
    description: string;
    bgImage: string;
  };
  brandPosition: {
    title: string;
    subtitle: string;
    description: string;
    items: {
      slides: BrandPositionItem[];
      autoplay: boolean;
      interval: number;
    };
    image: string;
  };
  brandStory: {
    title: string;
    subtitle: string;
    bgTextTop: string;
    bgTextBottom: string;
    items: CarouselData;
    bgImage: string;
  };
  brandHighlights: {
    title: string;
    slides: any[];
  };
  brandStrengths: {
    title: string;
    items: CarouselData;
  };
  brandTravel: {
    title: string;
    image: string;
    items: CarouselSlide[];
  };
  sustainability: {
    title: string;
    description: string;
    images: MediaObject[];
    content1: string;
    content2: string;
    tips: string;
  };
  prospect: {
    title: string;
    items: CarouselData;
    logoImage: MediaObject | null;
    tips: string;
  };
  contactForm: {
    title: string;
    subtitle: string;
    description: string;
    formConfig: any;
    images: MediaObject[];
    locale: string;
  };
  applications: {
    title: string;
    titleNodes: any[];
    description: string;
    descriptionNodes: any[];
    viewButtonText: string;
    viewButtonLink: string;
    viewButtonNewTab: boolean;
    applicationIds: string[];
  };
  quote: {
    slides: any[];
    autoplay: boolean;
    interval: number;
  };
}

// --------------------------------------------------------------------------
// Helpers (Copied and adapted from OurStoryTemplate)
// --------------------------------------------------------------------------

function getNodeTotalText(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getNodeTotalText).join("");
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.children) return getNodeTotalText(node.children);
  return "";
}

function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false;
  const result: any[] = [];

  for (const node of children) {
    const totalText = getNodeTotalText(node);
    
    const isMarkerBlock = 
      (node.type === "paragraph" || node.type === "quote" || node.type === "code") &&
      totalText.includes(markerId);

    if (isMarkerBlock) {
      if (foundMarker) break; 
      foundMarker = true;
      continue;
    }

    if (foundMarker && (node.children?.[0]?.format === 16 || node.type === "code") && totalText.includes("-")) {
       if (!totalText.startsWith(markerId + "-")) {
          break;
       }
    }

    if (foundMarker) {
      result.push(node);
    }
  }
  return result;
}

function extractNodeChildrenAfterMarker(children: any[], markerId: string): any[] | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  return nodesAfterMarker.length > 0 ? nodesAfterMarker[0].children : null;
}

function extractListItemText(children: any[]): string {
  if (!children) return "";
  return children
    .map((child: any) => {
      if (child.type === "text") return child.text || "";
      if (child.type === "linebreak") return "\n";
      if (child.type === "paragraph" || child.type === "list" || child.type === "listitem") {
        return extractListItemText(child.children || []);
      }
      return "";
    })
    .join("");
}

function extractTextAfterMarker(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  if (nodesAfterMarker.length === 0) return null;
  
  return nodesAfterMarker
    .filter(node => node.type === "paragraph" || node.type === "heading" || node.type === "quote" || node.type === "list")
    .map(node => extractListItemText(node.children || [node]))
    .join("\n");
}

function extractListAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((li: any) => extractListItemText(li.children));
    }
  }
  return [];
}

function extractImageAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "singleImage" && node.data?.image) {
      const imageId = typeof node.data.image === "object" ? node.data.image.id : String(node.data.image || "");
      if (imageId && mediaData[imageId]) {
        return mediaData[imageId];
      }
    }
  }
  return null;
}

function extractCarouselAfterMarker(children: any[], markerId: string, mediaData: Record<string, MediaObject>) {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "carousel" && node.data?.slides) {
      const slides = node.data.slides.map((slide: any) => {
        const imageId = typeof slide.image === "object" ? slide.image.id : String(slide.image || "");
        return {
          title: slide.title || "",
          description: slide.description || slide.content || "",
          image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
          link: slide.link || slide.buttonLink || ""
        };
      });
      return {
        slides,
        autoplay: node.data.autoplay !== false,
        interval: node.data.autoplayInterval || 4000
      };
    }
  }
  return { slides: [], autoplay: false, interval: 4000 };
}

function extractPairedListAfterMarker(children: any[], markerId: string) {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      const listItems = node.children || [];
      const pairs = [];
      for (let i = 0; i < listItems.length; i += 2) {
        if (listItems[i]) {
          const title = extractListItemText(listItems[i].children || []);
          const content = listItems[i+1] ? extractListItemText(listItems[i+1].children || []) : "";
          pairs.push({ title, content });
        }
      }
      return pairs;
    }
  }
  return [];
}

// --------------------------------------------------------------------------
// Main Parser
// --------------------------------------------------------------------------

export function parseOurStoryData(locale: string, rawData: any): OurStoryData {
  const children = rawData.content?.root?.children || rawData.contentTranslation?.root?.children || [];
  const mediaData = rawData.mediaData || {};
  const allApplications = rawData.applications || [];

  // Helper to resolve images from Media or Application sources (Server-side compatible)
  const resolveImage = (source: any, sourceType: "application" | "media" = "media") => {
    if (!source) return null;
    let mediaObj: any = null;

    if (sourceType === "application") {
      const appId = typeof source === "object" ? source.id : String(source);
      const app = allApplications.find((a: any) => String(a.id) === appId);
      if (!app) return null;
      mediaObj = app.image || app.mainImage || (app.sceneGallery?.[0]?.images?.[0]);
    } else {
      const imageId = typeof source === "object" ? source.id : String(source);
      mediaObj = mediaData[imageId] || (typeof source === "object" && source.url ? source : null);
    }

    if (mediaObj?.url) {
      return { ...mediaObj, url: convertToCDNUrl(mediaObj.url) };
    }
    return null;
  };

  const findBlocksInSection = (sectionPrefix: string, blockTypes: string[]) => {
    const results: any[] = [];
    let inSection = false;

    for (const node of children) {
      const text = getNodeTotalText(node);
      const isMarker = (node.type === "code" || node.children?.[0]?.format === 16) && text.includes("-");
      
      if (isMarker && inSection && !text.startsWith(sectionPrefix)) break;
      if (isMarker && text.startsWith(sectionPrefix)) inSection = true;

      if (inSection) {
        const scanner = (n: any) => {
          if (blockTypes.includes(n.type)) results.push(n);
          if (n.type === "block" && blockTypes.includes(n.fields?.blockType)) results.push(n.fields);
          if (n.columns) n.columns.forEach((c: any) => c.children?.forEach(scanner));
          if (n.children) n.children.forEach(scanner);
        };
        scanner(node);
      }
    }
    return results;
  };

  const extractImagesFromBlocks = (blocks: any[]) => {
    const images: MediaObject[] = [];
    blocks.forEach(node => {
      if (node.type === "custom-image-gallery" && node.data?.images) {
        const glry = node.data.images.map((img: any) => 
          resolveImage(img.application || img.image, img.sourceType || "media")
        ).filter(Boolean);
        images.push(...glry);
      } else if (node.blockType === "imageGallery" && node.images) {
        const glry = node.images.map((item: any) => 
          resolveImage(item.application || item.image, item.sourceType || "media")
        ).filter(Boolean);
        images.push(...glry);
      } else if ((node.type === "carousel" && node.data?.slides) || (node.blockType === "carousel" && node.slides)) {
        const slides = node.data?.slides || node.slides;
        const glry = slides.map((s: any) => resolveImage(s.image, "media")).filter(Boolean);
        images.push(...glry);
      } else if ((node.type === "singleImage" && node.data?.image) || (node.blockType === "singleImage" && node.image)) {
        const img = resolveImage(node.data?.image || node.image, "media");
        if (img) images.push(img);
      }
    });
    return images;
  };

  // Hero
  const heroData = {
    titleNodes: extractNodeChildrenAfterMarker(children, "hero-section-title") || [],
    subtitle: extractTextAfterMarker(children, "hero-section-subtitle") || "Make Projects",
    content: extractTextAfterMarker(children, "hero-section-content") || "",
    descriptionNodes: extractNodeChildrenAfterMarker(children, "hero-section-description") || [],
    items: extractListAfterMarker(children, "hero-section-item"),
    heroImage: convertToCDNUrl(extractImageAfterMarker(children, "hero-section-image", mediaData)?.url || "/BusromFooterBg_original.webp")
  };

  // Who We Are
  const whoWeAreData = {
    titleNodes: extractNodeChildrenAfterMarker(children, "who-we-are-title") || [],
    content: extractTextAfterMarker(children, "who-we-are-content") || "",
    description: extractTextAfterMarker(children, "who-we-are-description") || 
                  extractTextAfterMarker(children, "who-we-are-descripition") || "",
    bgImage: convertToCDNUrl(extractImageAfterMarker(children, "who-we-are-bg-image", mediaData)?.url || "/BusromFooterBg_original.webp")
  };

  // Brand Position
  const brandPositionData = {
    title: extractTextAfterMarker(children, "brand-position-title") || "Brand Positioning",
    subtitle: extractTextAfterMarker(children, "brand-position-subtitle") || "BRAND Philosophy",
    description: extractTextAfterMarker(children, "brand-position-description") || "",
    items: extractCarouselAfterMarker(children, "brand-position-item", mediaData),
    image: convertToCDNUrl(extractImageAfterMarker(children, "brand-position-image", mediaData)?.url || "/BusromFooterBg_original.webp")
  };

  // Brand Story
  const brandStoryData = {
    title: extractTextAfterMarker(children, "brand-story-title") || "Brand Story",
    subtitle: extractTextAfterMarker(children, "brand-story-subtitle") || "Busrom",
    bgTextTop: extractTextAfterMarker(children, "brand-story-bg-text-top") || "HISTORY",
    bgTextBottom: extractTextAfterMarker(children, "brand-story-bg-text-bottom") || "STORY",
    items: extractCarouselAfterMarker(children, "brand-story-item", mediaData),
    bgImage: extractImageAfterMarker(children, "brand-story-bg-image", mediaData)?.url || "/BusromFooterBg_original.webp"
  };

  // Highlights
  const highlightItems = extractPairedListAfterMarker(children, "brand-highlights-item");
  const highlightSlides = highlightItems.map((item: any, i: number) => {
    const images = [];
    const galleryNodes = extractAfterMarker(children, `brand-highlights-image-${i+1}`);
    const gallery = extractImagesFromBlocks(galleryNodes);
    return { ...item, images: gallery };
  });

  // Strengths
  const brandStrengthsData = {
    title: extractTextAfterMarker(children, "brand-strengths-title") || "Brand Strengths",
    items: extractCarouselAfterMarker(children, "brand-strengths-item", mediaData)
  };

  // Travel/Journey
  const brandTravelData = {
    title: extractTextAfterMarker(children, "brand-travel-title") || "Brand Journey",
    image: extractImageAfterMarker(children, "brand-travel-image", mediaData)?.url || "/BusromFooterBg_original.webp",
    items: extractCarouselAfterMarker(children, "brand-travel-item", mediaData).slides
  };

  // Sustainability
  const sectionPrefixSus = "sustainable-commitment";
  const sustainabilityData = {
    title: extractTextAfterMarker(children, `${sectionPrefixSus}-title`) || "Sustainable Commitment",
    description: extractTextAfterMarker(children, `${sectionPrefixSus}-description`) || "",
    content1: extractTextAfterMarker(children, `${sectionPrefixSus}-content-1`) || "",
    content2: extractTextAfterMarker(children, `${sectionPrefixSus}-content-2`) || "",
    tips: extractTextAfterMarker(children, `${sectionPrefixSus}-tips`) || "ABOUT BUSROM",
    images: extractImagesFromBlocks(findBlocksInSection(sectionPrefixSus, ["custom-image-gallery", "block"]))
  };

  // Prospect
  const prospectData = {
    title: extractTextAfterMarker(children, "future-prospect-title") || "Future Prospect",
    items: extractCarouselAfterMarker(children, "future-prospect-item", mediaData),
    logoImage: extractImageAfterMarker(children, "future-prospect-logo-image", mediaData),
    tips: extractTextAfterMarker(children, "future-prospect-tips") || "Our Vision"
  };

  // Contact Form
  const sectionPrefixForm = "contact-form";
  const formBlocks = findBlocksInSection(sectionPrefixForm, ["custom-image-gallery", "block", "formBlock"]);
  const formNode = extractAfterMarker(children, "contact-form-block").find(n => n.type === 'formBlock') || 
                   formBlocks.find(b => b.blockType === "formBlock" || b.type === "formBlock");

  const contactFormData = {
    title: "Get A \nQuote",
    subtitle: extractTextAfterMarker(children, `${sectionPrefixForm}-title`) || "Contact Us", 
    description: extractTextAfterMarker(children, "form-description") || "",
    formConfig: formNode?.formConfig || formNode?.data?.formConfig || formNode,
    images: extractImagesFromBlocks(formBlocks),
    locale: locale
  };

  // Applications Raw
  let appIds: string[] = [];
  const markerIdxApp = children.findIndex((n: any) => getNodeTotalText(n) === "applications-item");
  if (markerIdxApp !== -1) {
    for (let i = markerIdxApp + 1; i < children.length; i++) {
      const node = children[i];
      if (node.type === "applicationCarousel" && node.data?.applications) {
        appIds = node.data.applications.map((a: any) => String(a.id || a));
        break;
      }
      if (node.type === "quote" || node.type === "horizontalrule") break;
    }
  }

  // Find view button
  let viewButtonText = "View Cases Gallery Now";
  let viewButtonLink = "";
  let viewButtonNewTab = false;
  const btnMarkerIdx = children.findIndex((n: any) => getNodeTotalText(n) === "applications-btn");
  if (btnMarkerIdx !== -1 && btnMarkerIdx + 1 < children.length) {
    const btnNode = children[btnMarkerIdx + 1];
    if (btnNode?.type === "linkJump" && btnNode.data) {
      viewButtonText = btnNode.data.description || btnNode.data.title || viewButtonText;
      viewButtonLink = (btnNode.data.url || "").replace('/pages/', '/');
      viewButtonNewTab = !!btnNode.data.openInNewTab;
    }
  }

  // Quote Section
  let quoteSlides: any[] = [];
  let quoteAutoplay = true;
  let quoteInterval = 5;

  const markerIdxQuote = children.findIndex((n: any) => getNodeTotalText(n) === "quote-item");

  if (markerIdxQuote !== -1) {
    for (let i = markerIdxQuote + 1; i < children.length; i++) {
      const node = children[i];
      if (node.type === "carousel" && node.data?.slides) {
        quoteAutoplay = node.data.autoplay !== false;
        quoteInterval = node.data.interval || 5;
        quoteSlides = node.data.slides.map((slide: any) => {
          const mediaId = String(slide.image?.id || slide.image || "");
          return {
            title: slide.title || "",
            description: slide.description || "",
            buttonText: slide.buttonText || "",
            buttonLink: slide.buttonLink || slide.link || "",
            showButton: slide.showButton !== false,
            openInNewTab: slide.openInNewTab || false,
            image: mediaId && mediaData[mediaId] ? mediaData[mediaId] : null
          };
        });
        break;
      }
      if (node.type === "horizontalrule") break;
    }
  }

  return {
    hero: heroData,
    whoWeAre: whoWeAreData,
    brandPosition: brandPositionData,
    brandStory: brandStoryData,
    brandHighlights: { title: extractTextAfterMarker(children, "brand-highlights-title") || "Brand Highlights", slides: highlightSlides },
    brandStrengths: brandStrengthsData,
    brandTravel: brandTravelData,
    sustainability: sustainabilityData,
    prospect: prospectData,
    contactForm: contactFormData,
    applications: {
      title: extractTextAfterMarker(children, "applications-title") || "Applications",
      titleNodes: extractNodeChildrenAfterMarker(children, "applications-title") || [],
      description: extractTextAfterMarker(children, "applications-description") || "",
      descriptionNodes: extractNodeChildrenAfterMarker(children, "applications-description") || [],
      viewButtonText,
      viewButtonLink,
      viewButtonNewTab,
      applicationIds: appIds
    },
    quote: {
      slides: quoteSlides,
      autoplay: quoteAutoplay,
      interval: quoteInterval
    }
  };
}
