import { convertToCDNUrl } from "../cdn-url";

export interface MediaObject {
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
  cropFocalPoint?: { x: number; y: number } | null;
  width?: number;
  height?: number;
  enableLink?: boolean;
  linkUrl?: string;
  openInNewTab?: boolean;
}

export interface CarouselSlide {
  title: string;
  description: string;
  caption?: string;
  link?: string;
  image: MediaObject | null;
}

export interface ServiceItem {
  title: string;
  description: string;
  images?: MediaObject[];
}

export interface ServiceCategory {
  title: string;
  items: ServiceItem[];
}

export interface RichText {
  text: string;
  hollow?: boolean;
}

export interface ParsedServiceOverviewData {
  serviceValue: {
    title: string;
    bgImage: MediaObject | null;
    slides: CarouselSlide[];
  };
  brandServices: {
    title: string;
    description: string;
    categoryImages: Array<{ top: MediaObject | null; bottom: MediaObject | null }>;
    categories: ServiceCategory[];
  };
  contactForm: {
    backgroundImage: MediaObject | null;
    title: RichText[];
    subtitle: string | null;
    description: string | null;
    footerNote: string | null;
    displayName: string | null;
    info: string[];
    formConfig: any;
  };
  applications: {
    titleLine1: string;
    titleLine2: string;
    highlightText: string;
    viewMoreLink: string;
    viewMoreText: string;
    applicationIds: string[];
  };
  simpleCta: {
    title: string;
    description: string;
    ctaText: string;
    buttonText: string;
    buttonLink: string;
    images: MediaObject[];
  };
  animation: {
    backgroundImage: MediaObject | null;
  };
}

// Logic extracted from ServiceOverviewTemplate.tsx
const isMarkerNode = (node: any, markerId?: string): boolean => {
  if (node.type !== "paragraph" && node.type !== "quote") return false;
  const children = node.children || [];
  return children.some((child: any) => {
    // 16 is basic code, 80 seems to be code+bold or other variations in your Lexical
    const isCode = (child.format & 16) === 16 || (child.textFormat & 16) === 16;
    const text = (child.text || "").trim();
    return isCode && (markerId ? text === markerId : text.length > 0);
  });
};

const extractAfterMarker = (children: any[], markerId: string): any[] => {
  let foundMarker = false;
  const result: any[] = [];
  for (const node of children) {
    if (!foundMarker) {
      if (isMarkerNode(node, markerId)) {
        foundMarker = true;
      }
      continue;
    }
    
    // Stop if we hit a different MAJOR marker (quote type usually defines a new section)
    // or if we hit another paragraph marker that is definitely NOT related to the current search
    if (isMarkerNode(node)) {
      const text = (node.children?.find((c: any) => c.format === 16 || c.textFormat === 16)?.text || "").trim();
      // If the marker text is different from what we are looking for and doesn't share the prefix, stop
      if (text !== markerId && !text.startsWith(markerId.split('-')[0])) {
        break;
      }
      // If it's a quote, it's always a new section
      if (node.type === "quote" && text !== markerId) break;
    }
    
    result.push(node);
  }
  return result;
};

const extractCarouselAfterMarker = (children: any[], markerId: string, mediaData: Record<string, any>): CarouselSlide[] => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "carousel" && node.data?.slides) {
      return node.data.slides.map((slide: any) => {
        const imageId = typeof slide.image === "object" && slide.image ? slide.image.id : String(slide.image || "");
        return {
          title: slide.title || "",
          description: slide.description || "",
          caption: slide.caption || "",
          link: slide.link || "",
          image: imageId && (mediaData[imageId] || Object.values(mediaData).find((m: any) => String(m.id) === String(imageId))) ? {
            ...(mediaData[imageId] || Object.values(mediaData).find((m: any) => String(m.id) === String(imageId))),
            url: convertToCDNUrl((mediaData[imageId] || Object.values(mediaData).find((m: any) => String(m.id) === String(imageId))).url)
          } : null,
        };
      });
    }
  }
  return [];
};

const extractImageAfterMarker = (children: any[], markerId: string, mediaData: Record<string, any>): MediaObject | null => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if ((node.type === "singleImage" || node.type === "single-image") && node.data?.image) {
      const imageId = typeof node.data.image === "object" && node.data.image ? node.data.image.id : String(node.data.image || "");
      const mediaInfo = mediaData[imageId] || Object.values(mediaData).find((m: any) => String(m.id) === String(imageId));
      if (imageId && mediaInfo) {
        const mediaObj = { ...mediaInfo, url: convertToCDNUrl(mediaInfo.url) };
        if (node.data.enableLink) {
          mediaObj.enableLink = true;
          mediaObj.linkUrl = node.data.linkUrl;
          mediaObj.openInNewTab = node.data.openInNewTab;
        }
        return mediaObj;
      }
    }
  }
  return null;
};

const extractGalleryImagesAfterMarker = (children: any[], markerId: string, mediaData: Record<string, any>): MediaObject[] => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  const images: MediaObject[] = [];
  for (const node of nodesAfterMarker) {
    if ((node.type === "custom-image-gallery" || node.type === "imageGallery" || node.type === "image-gallery") && node.data?.images) {
      for (const img of node.data.images) {
        const imageId = typeof img.image === "object" && img.image ? img.image.id : String(img.image || "");
        const mediaInfo = mediaData[imageId] || Object.values(mediaData).find((m: any) => String(m.id) === String(imageId));
        if (imageId && mediaInfo) {
          const mediaObj = { ...mediaInfo, url: convertToCDNUrl(mediaInfo.url) };
          if (img.enableLink) {
            mediaObj.enableLink = true;
            mediaObj.linkUrl = img.linkUrl;
            mediaObj.openInNewTab = img.openInNewTab;
          }
          images.push(mediaObj);
        }
      }
      break;
    }
  }
  return images;
};

const extractSectionTitle = (children: any[], sectionId: string): string | null => {
  let foundSection = false;
  for (const node of children) {
    if (!foundSection) {
      if (isMarkerNode(node, sectionId)) {
        foundSection = true;
      }
      continue;
    }
    
    // Skip other marker sub-nodes
    if (isMarkerNode(node)) continue;
    
    if (node.type === "heading") return node.children?.[0]?.text || null;
    
    // Stop if we hit another section marker
    if (node.type === "quote") break;
  }
  return null;
};

const extractCTAAfterMarker = (children: any[], markerId: string): { text: string, link: string } | null => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if ((node.type === "ctaButton" || node.type === "linkJump") && node.data) {
      return {
        text: node.data.text || node.data.title || "Learn More",
        link: node.data.url || node.data.linkUrl || "#"
      };
    }
  }
  return null;
};

const extractListItemText = (children: any[]): string => {
  if (!children) return "";
  return children.map((child: any) => {
    if (child.type === "text") return child.text || "";
    if (child.type === "linebreak") return "\n";
    if (child.type === "autolink" || child.type === "link") return extractListItemText(child.children);
    return "";
  }).join("");
};

const serializeNodeChildren = (node: any): string => {
  if (!node || !node.children) return "";
  return node.children.map((child: any) => {
    if (child.type === "text") return child.text || "";
    if (child.type === "linebreak") return "\n";
    if (child.children) return serializeNodeChildren(child);
    return "";
  }).join("");
};

const serializeRichText = (node: any): RichText[] => {
  if (!node || !node.children) return [];
  const result: RichText[] = [];
  node.children.forEach((child: any) => {
    if (child.type === "text") {
      result.push({
        text: child.text || "",
        // format: 1 usually means Bold in Lexical
        hollow: (child.format & 1) === 1 || (child.textFormat & 1) === 1
      });
    } else if (child.type === "linebreak") {
      result.push({ text: "\n", hollow: false });
    } else if (child.children) {
      result.push(...serializeRichText(child));
    }
  });
  return result;
};

const extractRichTextAfterMarker = (children: any[], markerId: string): RichText[] => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    // Skip ANY marker node
    if (isMarkerNode(node)) continue;
    
    if (node.type === "paragraph" || node.type === "quote") {
      const richText = serializeRichText(node);
      if (richText.length > 0) return richText;
    }
  }
  return [];
};

const extractTextAfterMarker = (children: any[], markerId: string): string | null => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    // Skip ANY marker node
    if (isMarkerNode(node)) continue;
    
    if (node.type === "paragraph" || node.type === "quote") {
      const text = serializeNodeChildren(node);
      if (text.trim()) return text;
    }
  }
  return null;
};

const extractListTextAfterMarker = (children: any[], markerId: string): string[] => {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((item: any) => extractListItemText(item.children));
    }
  }
  return [];
};

const extractItemImages = (children: any[], categoryIndex: number, itemIndex: number, mediaData: Record<string, any>): MediaObject[] => {
  const markerId = `brand-service-item-${categoryIndex + 1}-${itemIndex + 1}`;
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if ((node.type === "custom-image-gallery" || node.type === "imageGallery" || node.type === "image-gallery") && node.data?.images) {
      return node.data.images.map((img: any) => {
        const imageId = typeof img.image === "object" && img.image ? img.image.id : String(img.image || "");
        return mediaData[imageId] ? {
          ...mediaData[imageId],
          enableLink: img.enableLink || false,
          linkUrl: img.linkUrl,
          openInNewTab: img.openInNewTab
        } : null;
      }).filter(Boolean);
    }
  }
  return [];
};

const extractBrandServiceCategories = (children: any[], mediaData: Record<string, any>): ServiceCategory[] => {
  const nodesAfterMarker = extractAfterMarker(children, "brand-service-item");
  const categories: ServiceCategory[] = [];
  for (const node of nodesAfterMarker) {
    if (node.type === "list" && node.tag === "ol") {
      const listItems = node.children || [];
      let currentCategory: ServiceCategory | null = null;
      let categoryIndex = 0;
      for (const listItem of listItems) {
        if (listItem.type !== "listitem") continue;
        const firstChild = listItem.children?.[0];
        if (firstChild?.type === "text" || firstChild?.type === "linebreak") {
          if (currentCategory) { categories.push(currentCategory); categoryIndex++; }
          currentCategory = { title: extractListItemText(listItem.children), items: [] };
        } else if (firstChild?.type === "list") {
          if (currentCategory) {
            const nestedItems = firstChild.children || [];
            let currentItem: ServiceItem | null = null;
            let itemIndex = 0;
            for (const nestedItem of nestedItems) {
              if (nestedItem.type !== "listitem") continue;
              const nestedFirst = nestedItem.children?.[0];
              if (nestedFirst?.type === "text") {
                if (currentItem) {
                  currentItem.images = extractItemImages(children, categoryIndex, itemIndex - 1, mediaData);
                  currentCategory.items.push(currentItem);
                }
                currentItem = { title: extractListItemText(nestedItem.children), description: "" };
                itemIndex++;
              } else if (nestedFirst?.type === "list") {
                if (currentItem) {
                  const descItem = nestedFirst.children?.[0];
                  if (descItem?.type === "listitem") currentItem.description = extractListItemText(descItem.children);
                }
              }
            }
            if (currentItem) {
              currentItem.images = extractItemImages(children, categoryIndex, itemIndex - 1, mediaData);
              currentCategory.items.push(currentItem);
            }
          }
        }
      }
      if (currentCategory) categories.push(currentCategory);
      break;
    }
  }
  return categories;
};

export const parseServiceOverviewData = (pageContent: any): ParsedServiceOverviewData => {
  const contentChildren = pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [];
  const mediaData = pageContent.mediaData || {};

  // 1. Service Value
  const serviceValue = {
    title: extractSectionTitle(contentChildren, "service-value") || "Service Value",
    bgImage: extractImageAfterMarker(contentChildren, "service-value-image-bg", mediaData),
    slides: extractCarouselAfterMarker(contentChildren, "service-value-item", mediaData),
  };

  // 2. Brand Services
  const galleryImages = extractGalleryImagesAfterMarker(contentChildren, "brand-service-image", mediaData);
  const categories = extractBrandServiceCategories(contentChildren, mediaData);
  const brandServices = {
    title: extractSectionTitle(contentChildren, "brand-service") || "Brand Services",
    description: extractTextAfterMarker(contentChildren, "brand-service-description") || "Our service blends creative strategy...",
    categoryImages: [
      { top: galleryImages[0] || null, bottom: galleryImages[1] || null },
      { top: galleryImages[2] || null, bottom: galleryImages[3] || null },
      { top: galleryImages[4] || null, bottom: galleryImages[5] || null },
    ],
    categories: categories.length > 0 ? categories : [], // Fallbacks handled in template or here
  };

  // 3. Contact Form
  const contactInfoList = extractListTextAfterMarker(contentChildren, "contact-form-info");
  // Find items that look like actual info (email contains @, phone contains digits)
  const emailInfo = contactInfoList.find(t => t.includes('@'));
  const whatsappInfo = contactInfoList.find(t => t.match(/\+\d+/) || (t.match(/\d/) && t.length > 5));

  const formBlockNode = extractAfterMarker(contentChildren, "contact-form-block").find(n => n.type === "formBlock");
  const resolvedFormConfig = pageContent.formConfig || formBlockNode?.data?.formConfig || null;

  const contactForm = {
    backgroundImage: extractImageAfterMarker(contentChildren, "contact-form-bg-image", mediaData),
    // title: 大标题
    title: extractRichTextAfterMarker(contentChildren, "contact-form-decorator"),
    subtitle: extractTextAfterMarker(contentChildren, "contact-form-subtitle"),
    description: resolvedFormConfig?.description || extractTextAfterMarker(contentChildren, "contact-form-description"),
    footerNote: extractTextAfterMarker(contentChildren, "contact-form-tips"),
    displayName: resolvedFormConfig?.displayName || null,
    info: contactInfoList,
    formConfig: resolvedFormConfig,
  };

  // 4. Applications
  const appTitleNodes = extractAfterMarker(contentChildren, "applications-title");
  let t1 = "Busrom", t2 = "For You", ht = "Cases";
  for (const n of appTitleNodes) {
    if (n.type === "list") {
      const it = n.children || [];
      if (it[0]?.children) {
        const text = extractListItemText(it[0].children);
        const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);
        if (lines.length >= 2) { t1 = lines[0]; t2 = lines[1]; } else if (lines.length === 1) t1 = lines[0];
      }
      if (it[1]?.children) ht = extractListItemText(it[1].children).trim();
      break;
    }
  }
  const appLinkNodes = extractAfterMarker(contentChildren, "applications-fast-link");
  let link = "/applications", linkText = "VIEW MORE", appIds: string[] = [];
  for (const n of appLinkNodes) {
    if (n.type === "linkJump" || n.type === "fast-link") { 
      linkText = n.data.title || n.data.text || "VIEW MORE"; 
      link = n.data.url || n.data.linkUrl || "/applications"; 
    }
    if (n.type === "applicationCarousel") appIds = n.data.applications?.map((a: any) => typeof a === 'object' ? String(a.id) : String(a)) || [];
  }
  const applications = { titleLine1: t1, titleLine2: t2, highlightText: ht, viewMoreLink: link, viewMoreText: linkText, applicationIds: appIds };

  // 5. Simple CTA
  const ctaBtnData = extractCTAAfterMarker(contentChildren, "simple-cta-button-button");
  const simpleCta = {
    title: extractTextAfterMarker(contentChildren, "simple-cta-title") || "Transform Ideas into Reality",
    description: extractTextAfterMarker(contentChildren, "simple-cta-description") || "Busrom's business scope...",
    ctaText: extractTextAfterMarker(contentChildren, "simple-cta-button-description") || "Talk to Our Specialists...",
    buttonText: ctaBtnData?.text || "Get Started",
    buttonLink: ctaBtnData?.link || "/contact-us",
    images: extractGalleryImagesAfterMarker(contentChildren, "simple-cta-image", mediaData),
  };

  // 6. Animation
  const animation = { backgroundImage: extractImageAfterMarker(contentChildren, "animation-image", mediaData) };

  return { serviceValue, brandServices, contactForm, applications, simpleCta, animation };
};
