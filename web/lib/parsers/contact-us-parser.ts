import { 
  MediaObject,
  extractNodesAfterMarker as extractAfterMarker, 
  flattenLexicalChildren,
  getNodeTotalText 
} from "@/lib/lexical-utils";

/**
 * Extracts a single image from nodes after a marker
 */
function extractImageAfterMarker(
  children: any[],
  markerId: string,
  mediaData: Record<string, MediaObject>
): MediaObject | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId);

  for (const node of nodesAfterMarker) {
    if ((node.type === "singleImage" || node.type === "upload") && node.data?.image) {
      const image = node.data.image;
      const imageId = typeof image === "object" && image ? image.id : String(image || "");
      if (imageId && mediaData[imageId]) {
        return mediaData[imageId];
      }
    }
  }
  return null;
}

/**
 * Extracts sequence of nodes as a single string
 */
function extractTextAfterMarker(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId);

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      return getNodeTotalText(node.children).trim();
    }
  }
  return null;
}

export interface TextSegment {
  text: string;
  bold?: boolean;
}

export interface SupportCardData {
  id: number;
  title: string;
}

export interface ProductSeriesItem {
  id: number;
  title: string;
  image: MediaObject | null;
  link?: string;
  buttonText?: string;
}

export interface KeyValuesCooperationItem {
  id: number;
  title: string;
  link?: string;
  images: (MediaObject | null)[];
  points: string[];
}

export interface CooperationProcessStep {
  id: number;
  title: string;
}

export interface ContactUsData {
  hero: {
    heroImage: MediaObject | null;
    subtitle: string | null;
    buttonText: string | null;
    buttonLink: string | null;
  };
  supportNarrative: {
    title: string | null;
    cards: SupportCardData[];
  };
  productSeries: {
    titleLeft: string;
    titleLeftSuperscript: string | null;
    titleRightBold: string;
    titleRightNormal: string;
    products: ProductSeriesItem[];
  };
  projectGuide: {
    title: string | null;
    subtitle: string | null;
    description: string | null;
    image: MediaObject | null;
  };
  keyValues: {
    label: string | null;
    items: KeyValuesCooperationItem[];
  };
  typicalCollaboration: {
    sectionTitle: string | null;
    items: { id: number; title: string; image: MediaObject | null }[];
  };
  cooperationProcess: {
    titleLine1: string | null;
    titleLine2: string | null;
    steps: CooperationProcessStep[];
    buttonText: string | null;
  };
  contactForm: {
    verticalTitle: string | null;
    title: string | null;
    subtitle: TextSegment[];
    images: (MediaObject | null)[];
    formConfig: any;
    tips: string[];
  };
  productShow: {
    backgroundImage: MediaObject | null;
    rawCarouselItems: any[];
  };
  quoteImage: {
    image: MediaObject | null;
    titleLine1: string | null;
    titleLine2: string | null;
    subtitle: string | null;
    buttonText: string | null;
    buttonLink: string | null;
  };
}

/**
 * Extract Segments with bold formatting
 */
function extractSegmentsAfterMarker(children: any[], markerId: string): TextSegment[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId);

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      const segments: TextSegment[] = [];
      for (const child of node.children) {
        if (child.type === "linebreak") {
          if (segments.length > 0) {
            segments[segments.length - 1].text += "\n";
          }
        } else if (child.text !== undefined) {
          const isBold = (child.format & 1) === 1;
          segments.push({ text: child.text, bold: isBold });
        }
      }
      if (segments.length > 0) return segments;
    }
  }
  return [];
}

/**
 * Extract text with superscript (format 64)
 */
function extractTextWithFormatAfterMarker(children: any[], markerId: string): { text: string; superscript: string | null } {
  const nodesAfterMarker = extractAfterMarker(children, markerId);

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let text = "";
      let superscript: string | null = null;
      for (const child of node.children) {
        if (child.type === "linebreak") {
          text += "\n";
        } else if (child.text !== undefined) {
          if (child.format === 64) {
            superscript = child.text;
          } else {
            text += child.text;
          }
        }
      }
      const trimmedText = text.replace(/^[ \t]+|[ \t]+$/gm, "").trim();
      if (trimmedText) return { text: trimmedText, superscript };
    }
  }
  return { text: "", superscript: null };
}

/**
 * Extract Right Title (Bold vs Normal)
 */
function extractTitleRightAfterMarker(children: any[], markerId: string): { boldText: string; normalText: string } {
  const nodesAfterMarker = extractAfterMarker(children, markerId);

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let boldText = "";
      let normalText = "";
      let foundLinebreak = false;

      for (const child of node.children) {
        if (child.type === "linebreak") {
          foundLinebreak = true;
        } else if (child.text !== undefined) {
          if (foundLinebreak) {
            normalText += child.text;
          } else if ((child.format & 1) === 1) {
            boldText += child.text;
          }
        }
      }
      return { boldText: boldText.trim(), normalText: normalText.trim() };
    }
  }
  return { boldText: "", normalText: "" };
}

/**
 * Extract text with markdown-style bold markers
 */
function extractTextWithBoldMarkers(children: any[], markerId: string): string | null {
  const nodesAfterMarker = extractAfterMarker(children, markerId);

  for (const node of nodesAfterMarker) {
    if (node.type === "paragraph" && node.children) {
      let result = "";
      for (const child of node.children) {
        if (child.type === "linebreak") {
          result += "\n";
        } else if (child.text !== undefined) {
          if ((child.format & 1) === 1) {
            result += `**${child.text}**`;
          } else {
            result += child.text;
          }
        }
      }
      if (result.trim()) return result;
    }
  }
  return null;
}

export function parseContactUsData(content: any, mediaData: Record<string, MediaObject> = {}): ContactUsData {
  const children = content?.root?.children || content?.document || [];

  // 1. Hero
  const heroData = {
    heroImage: extractImageAfterMarker(children, "business-hero-image", mediaData),
    subtitle: extractTextAfterMarker(children, "business-hero-subtitle"),
    buttonText: extractTextAfterMarker(children, "business-hero-button-text"),
    buttonLink: extractTextAfterMarker(children, "business-hero-button-link"),
  };

  // 2. Support Narrative
  const supportNarrativeItems = extractAfterMarker(children, "support-narrative-item");
  const cards: SupportCardData[] = [];
  for (const node of supportNarrativeItems) {
    if (node.type === "list" && node.children) {
      for (const listItem of node.children) {
        if (listItem.type === "listitem") {
          const text = getNodeTotalText(listItem).trim();
          if (text) cards.push({ id: cards.length + 1, title: text });
        }
      }
    }
  }
  const supportNarrative = {
    title: extractTextAfterMarker(children, "support-narrative-title"),
    cards
  };

  // 3. Product Series Entry
  const titleLeftData = extractTextWithFormatAfterMarker(children, "product-series-entry-title-left");
  const titleRightData = extractTitleRightAfterMarker(children, "product-series-entry-title-right");
  const productItems = extractAfterMarker(children, "product-series-entry-item");
  const products: ProductSeriesItem[] = [];
  for (const node of productItems) {
    if (node.type === "carousel" && node.data?.slides) {
      for (const slide of node.data.slides) {
        const imageId = typeof slide.image === "string" ? slide.image : slide.image?.id;
        products.push({
          id: products.length + 1,
          title: slide.title || "",
          image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
          link: slide.buttonLink || slide.link || undefined,
          buttonText: slide.buttonText || "",
        });
      }
    }
  }
  const productSeries = {
    titleLeft: titleLeftData.text,
    titleLeftSuperscript: titleLeftData.superscript,
    titleRightBold: titleRightData.boldText,
    titleRightNormal: titleRightData.normalText,
    products
  };

  // 4. Project Guide
  const projectGuide = {
    title: extractTextAfterMarker(children, "project-communication-guide-title"),
    subtitle: extractTextWithBoldMarkers(children, "project-communication-guide-subtitle"),
    description: extractTextWithBoldMarkers(children, "project-communication-guide-description"),
    image: extractImageAfterMarker(children, "project-communication-guide-image", mediaData),
  };

  // 5. Key Values Cooperation
  const label = extractTextAfterMarker(children, "key-values-cooperation-label");
  const nodesAfterItemMarker = extractAfterMarker(children, "key-values-cooperation-item");
  const nodesAfterImageMarker = extractAfterMarker(children, "key-values-cooperation-image");

  console.log("[Parser] key-values nodes found:", {
    label,
    itemsNodesCount: nodesAfterItemMarker.length,
    imageNodesCount: nodesAfterImageMarker.length
  });

  // 提取补充图片库
  const supplementaryImages: (MediaObject | null)[] = [];
  const galleryNode = nodesAfterImageMarker.find(n => n.type === "custom-image-gallery");
  if (galleryNode?.data?.images) {
    for (const galleryItem of galleryNode.data.images) {
      const imageId = typeof galleryItem?.image === "object" ? galleryItem.image.id : String(galleryItem?.image || "");
      if (imageId && mediaData[imageId]) supplementaryImages.push(mediaData[imageId]);
      else supplementaryImages.push(null);
    }
  }

  const kvItems: KeyValuesCooperationItem[] = [];
  const carouselNode = nodesAfterItemMarker.find(n => n.type === "carousel");
  
  console.log("[Parser] Carousel node found:", !!carouselNode);

  if (carouselNode?.data?.slides) {
    carouselNode.data.slides.forEach((slide: any, index: number) => {
      const imageId = typeof slide.image === "object" ? slide.image?.id : String(slide.image || "");
      const primaryImage = (imageId && mediaData[imageId]) ? mediaData[imageId] : null;
      const secondaryImage = supplementaryImages[index] || null;

      kvItems.push({
        id: index + 1,
        title: slide.title || "",
        link: slide.buttonLink || slide.link || "",
        images: [primaryImage, secondaryImage],
        points: (slide.description || "").split("\n").map((p: string) => p.trim()).filter(Boolean)
      });
    });
  }

  console.log("[Parser] Final kvItems count:", kvItems.length);
  const keyValues = { label, items: kvItems };

  // 6. Typical Collaboration
  const collabNodes = extractAfterMarker(children, "typical-collaboration-item");
  const collabItems: { id: number; title: string; image: MediaObject | null }[] = [];
  for (const node of collabNodes) {
    if (node.type === "carousel" && node.data?.slides) {
      for (const slide of node.data.slides) {
        const imageId = typeof slide.image === "string" ? slide.image : slide.image?.id;
        collabItems.push({
          id: collabItems.length + 1,
          title: slide.description || slide.title || "",
          image: imageId && mediaData[imageId] ? mediaData[imageId] : null,
        });
      }
    }
  }
  const typicalCollaboration = {
    sectionTitle: extractTextAfterMarker(children, "typical-collaboration-title"),
    items: collabItems
  };

  // 7. Cooperation Process
  const processNodes = extractAfterMarker(children, "cooperation-process-item");
  const steps: CooperationProcessStep[] = [];
  for (const node of processNodes) {
    if (node.type === "list" && node.children) {
      for (const listItem of node.children) {
        if (listItem.type === "listitem") {
          steps.push({ id: steps.length + 1, title: getNodeTotalText(listItem).trim() });
        }
      }
    }
  }
  const cooperationProcess = {
    titleLine1: extractTextAfterMarker(children, "cooperation-process-title-line1"),
    titleLine2: extractTextAfterMarker(children, "cooperation-process-title-line2"),
    steps,
    buttonText: extractTextAfterMarker(children, "cooperation-process-connect")
  };

  // 8. Contact Form
  const formNodes = extractAfterMarker(children, "contact-form");
  let blockMainContent: any[] = [];
  let blockSidebarContent: any[] = [];
  for (const node of formNodes) {
    if (node.type === "block" && node.fields) {
      blockMainContent = node.fields.mainContent?.root?.children || [];
      blockSidebarContent = node.fields.sidebarContent?.root?.children || [];
      break;
    }
  }
  const contactFormImages: (MediaObject | null)[] = [];
  for (const node of blockMainContent) {
    if (node.type === "carousel" && node.data?.slides) {
      for (const slide of node.data.slides) {
        const imageId = typeof slide.image === "string" ? slide.image : slide.image?.id;
        if (imageId && mediaData[imageId]) contactFormImages.push(mediaData[imageId]);
      }
    }
    if (node.type === "singleImage" && node.data?.image) {
      const imageId = typeof node.data.image === "object" ? node.data.image.id : String(node.data.image || "");
      if (imageId && mediaData[imageId]) contactFormImages.push(mediaData[imageId]);
    }
  }

  let formConfig: any = null;
  const tips: string[] = [];
  const blockMarkerNodes = extractAfterMarker(children, "contact-form-block");
  const formNodeMarker = blockMarkerNodes.find((n: any) => n.type === "formBlock");
  if (formNodeMarker?.data?.formConfig) formConfig = formNodeMarker.data.formConfig;

  for (const sidebarNode of blockSidebarContent) {
    if (!formConfig && sidebarNode.type === "formBlock" && sidebarNode.data?.formConfig) {
      formConfig = sidebarNode.data.formConfig;
    }
    if (sidebarNode.type === "list" && sidebarNode.children) {
      for (const listItem of sidebarNode.children) {
        if (listItem.type === "listitem") tips.push(getNodeTotalText(listItem).trim());
      }
    }
  }
  const privacyConsentText = extractTextAfterMarker(blockMainContent, "contact-form-privacy-consent") || extractTextAfterMarker(children, "contact-form-privacy-consent");
  if (formConfig && privacyConsentText && !formConfig.privacyConsentText) {
    formConfig = { ...formConfig, privacyConsentText };
  }

  const contactForm = {
    verticalTitle: extractTextAfterMarker(blockMainContent, "contact-form-title"),
    title: extractTextAfterMarker(blockMainContent, "contact-form-subtitle"),
    subtitle: extractSegmentsAfterMarker(blockMainContent, "contact-form-description"),
    images: contactFormImages,
    formConfig,
    tips
  };

  // 9. Product Show
  const productShowNodes = extractAfterMarker(children, "product-show-item");
  const rawCarouselItems: any[] = [];
  for (const node of productShowNodes) {
    if (node.type === "productCarousel" && node.data?.items) {
      rawCarouselItems.push(...node.data.items);
    }
  }
  const productShow = {
    backgroundImage: extractImageAfterMarker(children, "product-show-image-bg", mediaData),
    rawCarouselItems
  };

  // 10. Quote Image
  const quoteImage = {
    image: extractImageAfterMarker(children, "quote-image", mediaData),
    titleLine1: extractTextAfterMarker(children, "quote-title-top"),
    titleLine2: extractTextAfterMarker(children, "quote-title-bottom"),
    subtitle: extractTextAfterMarker(children, "quote-subtitle"),
    buttonText: "",
    buttonLink: ""
  };
  const qCtaNodes = extractAfterMarker(children, "quote-cta");
  const qBtnNode = qCtaNodes.find((n: any) => n.type === "ctaButton");
  if (qBtnNode?.data) {
    quoteImage.buttonText = qBtnNode.data.text || qBtnNode.data.buttonText || "";
    quoteImage.buttonLink = qBtnNode.data.link || qBtnNode.data.url || qBtnNode.data.href || "";
  }

  return {
    hero: heroData,
    supportNarrative,
    productSeries,
    projectGuide,
    keyValues,
    typicalCollaboration,
    cooperationProcess,
    contactForm,
    productShow,
    quoteImage
  };
}
