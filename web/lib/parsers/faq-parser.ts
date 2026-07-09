import { convertToCDNUrl } from "../cdn-url";
import { getRandomAppImage } from "../image-utils";

interface MediaObject {
  id: string;
  url: string;
  alt?: string;
}

export interface FaqData {
  hero: {
    title: any[];
    text: any[];
    bgImage: MediaObject | null;
    btnText: string;
    cta: any[];
    linkJump: any;
    items: any[];
  } | null;
  search: {
    title: any[];
    image: MediaObject | null;
    btnText: string;
    linkJump: any;
  } | null;
  guide: {
    title: any[];
    subtitle: any[];
    items: any[];
  } | null;
  popular: {
    title: any[];
    subtitle: any[];
    carousel: any;
  } | null;
  detail: {
    items: any[];
    selection: any;
  } | null;
  contact: {
    title: any[];
    formConfig: any;
    image: MediaObject | null;
  } | null;
  quote: {
    image: MediaObject | null;
    title: any[];
    description: any[];
    iconList: any;
    decoratorText: string;
  } | null;
}

export function getNodeTotalText(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getNodeTotalText).join("");
  if (typeof node === "string") return node;
  if (node.type === "linebreak") return "\n";
  if (node.type === "paragraph" || node.type === "quote" || node.type === "heading") return getNodeTotalText(node.children) + "\n";
  if (node.text) return node.text;
  if (node.children) return getNodeTotalText(node.children);
  return "";
}

/**
 * Filter out horizontal rule and signature from FAQ answer content.
 * Stops at the first horizontalrule node, removing it and everything after.
 */
function filterAnswerContent(content: any): any {
  if (!content || !content.root || !content.root.children) return content;
  const children = content.root.children;
  const hrIndex = children.findIndex((n: any) => n.type === "horizontalrule");
  if (hrIndex === -1) return content;
  return {
    ...content,
    root: {
      ...content.root,
      children: children.slice(0, hrIndex),
    },
  };
}

function extractAfterMarker(children: any[], markerId: string): any[] {
  let foundMarker = false;
  const result: any[] = [];
  const target = markerId.toLowerCase().trim();

  for (const node of children) {
    const totalText = getNodeTotalText(node).trim().toLowerCase();
    
    const isMarkerBlock = 
      (node.type === "paragraph" || node.type === "quote" || node.type === "code") &&
      (totalText === target || (totalText.includes(target) && node.children?.[0]?.format === 16));

    if (isMarkerBlock) {
      if (foundMarker) break; 
      foundMarker = true;
      continue;
    }

    const isNewMarker = 
      foundMarker && 
      (node.type === "paragraph" || node.type === "code" || node.type === "quote") && 
      (node.children?.[0]?.format === 16 || (totalText.includes("-") && totalText.length > 5 && !totalText.includes(" "))) &&
      !totalText.includes(target);

    if (isNewMarker) break;

    if (foundMarker) result.push(node);
  }
  
  return result;
}

export function parseFaqData(locale: string, rawData: any): FaqData {
  const children = rawData.contentTranslation?.root?.children || 
                   rawData.content?.root?.children || 
                   rawData.content?.children || [];
  
  const mediaData = rawData.mediaData || {};
  const galleriesData = rawData.galleriesData || {};

  const resolveMedia = (id: any): MediaObject | null => {
    if (!id) return null;
    const mediaId = typeof id === "object" ? id.id : String(id);
    const media = mediaData[mediaId];
    if (media) return media;
    
    if (typeof id === "object" && id.url) return id;

    const fallbackUrl = `/api/media/file/${mediaId}`;
    return { 
      id: mediaId, 
      url: convertToCDNUrl(fallbackUrl)
    };
  };

  const resolveQuestionImage = (q: any) => {
    // 1. Step 1: Case/Application Gallery - Standard "Double Random" via pre-resolved mediaData
    const galleryId = 
      (typeof q.gallery === "object" ? q.gallery.id : q.gallery) || 
      (typeof q.application === "object" ? q.application.id : q.application);

    const gidStr = galleryId ? String(galleryId) : null;

    if (gidStr && mediaData[gidStr]) {
      return mediaData[gidStr];
    }

    // 2. Step 2: Emergency Fallback - If mediaData missed it, check rawData.applications directly
    // This handles cases where resolveAllMedia didn't drill deep enough or failed its fetch
    if (gidStr) {
      const allApps = (rawData as any).applications || [];
      const matchedApp = allApps.find((a: any) => String(a.id) === gidStr);
      if (matchedApp) {
        // Use the same double-random utility
        const randomImg = getRandomAppImage(matchedApp);
        if (randomImg) return resolveMedia(randomImg);
      }
    }

    // 3. Step 3: Direct image field (High priority override)
    if (q.image) {
      const img = resolveMedia(q.image?.id || q.image);
      if (img?.url) return img;
    }
    
    // 4. Step 4: Fallback to FAQ item canonical image
    const fallback = q.faqItem?.image || q.faqItem?.featuredImage;
    if (fallback) return resolveMedia(fallback);

    return null;
  };

  // 1. Hero
  const heroTitleNodes = extractAfterMarker(children, "hero-section");
  const heroTextNodes = extractAfterMarker(children, "hero-section-text");
  let heroTexts: any[] = [];
  const heroList = heroTextNodes.find(n => n.type === 'list');
  if (heroList?.children) {
    heroTexts = heroList.children.map((item: any) => item.children);
  }
  const heroCtaNodes = extractAfterMarker(children, "hero-section-cta");
  const heroLinkJumpNode = heroCtaNodes.find(n => n.type === "linkJump");
  const heroItemsNodes = extractAfterMarker(children, "hero-section-item");
  const heroCarousel = heroItemsNodes.find(n => n.type === "carousel");
  const heroBgImageNodes = extractAfterMarker(children, "hero-section-image");
  const heroBgImageNode = heroBgImageNodes.find(n => 
    n.type === "singleImage" || n.type === "single-image" || n.type === "image" || n.type === "singleImageBlock"
  );

  // 2. Search
  const searchTitleNodes = extractAfterMarker(children, "faq-search-title");
  const searchImageSection = extractAfterMarker(children, "faq-search-image");
  const searchImageNode = searchImageSection.find(n => n.type === "singleImage" || n.type === "single-image");
  const searchBtnSection = extractAfterMarker(children, "faq-search-btn");
  const searchLinkJumpNode = searchBtnSection.find(n => n.type === "linkJump");

  // 3. Guide
  const guideTitle = extractAfterMarker(children, "faq-guide-title");
  const guideSubtitle = extractAfterMarker(children, "faq-guide-subtitle");
  const guideItemSection = extractAfterMarker(children, "faq-guide-item");
  const guideCarousel = guideItemSection.find(n => n.type === "carousel");

  // 4. Popular
  const popularTitle = extractAfterMarker(children, "faq-popular-title");
  const popularSubtitle = extractAfterMarker(children, "faq-popular-subtitle");
  const popularItemSection = extractAfterMarker(children, "faq-popular-item");
  let popularCarouselNode = popularItemSection.find(n => n.type === "faqCarousel" || n.type === "carousel" || n.type === "faq-carousel");
  if (!popularCarouselNode && popularItemSection.length > 0) {
    const standaloneSlides = popularItemSection.filter(n => n.type === "block" || n.data?.slides || n.data?.question);
    if (standaloneSlides.length > 0) {
       popularCarouselNode = { data: { slides: standaloneSlides.map(n => n.data || n) } };
    }
  }

  // 5. Detail
  const detailItemSection = extractAfterMarker(children, "faq-detail-item");
  const faqSelectionNode = detailItemSection.find(n => n.type === "faqSelection");

  // 6. Contact
  const contactFormBlock = extractAfterMarker(children, "contact-form-block");
  const formNode = contactFormBlock.find(n => n.type === "formBlock");
  const contactImageSection = extractAfterMarker(children, "contact-form-image");
  const contactImageNode = contactImageSection.find(n => n.type === "singleImage" || n.type === "single-image");

  // 7. Quote Guide
  const quoteImageSection = extractAfterMarker(children, "quote-guide-image");
  const quoteImageNode = quoteImageSection.find(n => n.type === "singleImage" || n.type === "single-image");
  const quoteTitleSection = extractAfterMarker(children, "quote-guide-title");
  const quoteDescSection = extractAfterMarker(children, "quote-guide-description");
  const quoteCtaSection = extractAfterMarker(children, "quote-guide-cta");
  const iconListNode = quoteCtaSection.find(n => n.type === "iconList");

  return {
    hero: {
      title: heroTitleNodes,
      text: heroTexts,
      bgImage: resolveMedia(heroBgImageNode?.data?.image?.id || heroBgImageNode?.data?.image),
      btnText: getNodeTotalText(extractAfterMarker(children, "hero-section-btn-text")).trim(),
      cta: heroCtaNodes,
      linkJump: heroLinkJumpNode?.data,
      items: (heroCarousel?.data?.slides || heroCarousel?.data?.items || []).map((s: any, i: number) => ({
        id: s.id || `item-${i}`,
        ...s,
        image: resolveMedia(s.image?.id || s.image)
      }))
    },
    search: {
      title: searchTitleNodes,
      image: resolveMedia(searchImageNode?.data?.image?.id),
      btnText: getNodeTotalText(searchBtnSection).trim(),
      linkJump: searchLinkJumpNode?.data
    },
    guide: {
      title: guideTitle,
      subtitle: guideSubtitle,
      items: (guideCarousel?.data?.slides || []).map((s: any, i: number) => ({
        id: s.id || `guide-${i}`,
        ...s,
        image: resolveMedia(s.image?.id || s.image)
      }))
    },
    popular: {
      title: popularTitle,
      subtitle: popularSubtitle,
      carousel: {
        slides: (popularCarouselNode?.data?.items || popularCarouselNode?.data?.slides || []).map((item: any, i: number) => {
          // Aggressively look for an ID (can be item.faq, item.faq.id, or item.id)
          let faqId = item.faq;
          if (faqId && typeof faqId === "object") faqId = faqId.id;
          
          const allItems = popularCarouselNode?.data?.items || popularCarouselNode?.data?.slides || [];
          
          // If we found a valid ID, prioritize hydration
          if (faqId && (typeof faqId === "string" || typeof faqId === "number") && !String(faqId).startsWith('pop-')) {
            return {
              faq: faqId,
              image: item.image,
              id: `pop-${i}`,
              image1: resolveMedia(item.image),
              image2: resolveMedia(allItems[(i + 1) % allItems.length]?.image),
              image3: resolveMedia(allItems[(i + 2) % allItems.length]?.image),
            };
          }

          // Fallback to legacy object data
          const s = item.faq || item;
          return {
            id: s.id || `pop-${i}`,
            question: s.question ? { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: s.question }] }] } } : null,
            answer: filterAnswerContent(s.contentTranslation || s.answer || { root: { children: [] } }),
            image1: resolveMedia(item.image || item.image1),
            image2: resolveMedia(allItems[(i + 1) % allItems.length]?.image || allItems[(i + 1) % allItems.length]?.image1),
            image3: resolveMedia(allItems[(i + 2) % allItems.length]?.image || allItems[(i + 2) % allItems.length]?.image1),
          };
        })
      }
    },
    detail: {
      items: (faqSelectionNode?.data?.categories || []).map((cat: any, i: number) => ({
        id: cat.category?.id || `cat-${i}`,
        title: cat.category?.name || cat.title || "",
        artText: cat.category?.slug?.split('-').join(' ').toUpperCase() || "",
        image: resolveMedia(cat.image?.id || cat.image),
        icon: cat.icon || "lucide:help-circle",
        faqs: (cat.questions || []).map((q: any, j: number) => {
          const f = q.faqItem || {};
          return {
            id: f.id || `faq-${i}-${j}`,
            question: f.question || "",
            answer: filterAnswerContent(f.contentTranslation || { root: { children: [] } }),
            image: resolveQuestionImage(q),
          };
        }),
      })),
      selection: faqSelectionNode?.data
    },
    contact: {
      title: extractAfterMarker(children, "contact-form-title"), // Keep this as fallback for custom titles
      formConfig: formNode?.data?.formConfig || rawData.formConfig,
      image: resolveMedia(contactImageNode?.data?.image?.id)
    },
    quote: {
      image: resolveMedia(quoteImageNode?.data?.image?.id),
      title: quoteTitleSection,
      description: quoteDescSection,
      iconList: iconListNode?.data,
      decoratorText: getNodeTotalText(extractAfterMarker(children, "quote-guide-decorator")).trim()
    }
  };
}
