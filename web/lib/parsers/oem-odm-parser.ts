import { 
  flattenLexicalChildren as flattenChildren, 
  extractNodesAfterMarker, 
  resolveMediaFromNodes,
  MediaObject
} from "../lexical-utils";

interface TextSegment {
  text: string;
  bold?: boolean;
  underline?: boolean;
}

interface AdvantageItemWithImage {
  title: string;
  description: string;
  image: MediaObject | null;
}

interface TwoLevelListItem {
  title: string;
  description: string;
}

/**
 * OEM/ODM Data Parser - Centralized server-side parsing
 */
export function parseOemOdmData(pageContent: any, locale: string) {
  const contentChildren = pageContent.content?.root?.children || pageContent.contentTranslation?.root?.children || [];
  const mediaData = pageContent.mediaData || {};
  const products = pageContent.products || [];
  const applications = pageContent.applications || [];
  const formConfig = pageContent.formConfig || null;

  // --- Helper: Extract formatted text ---
  const extractFormattedText = (markerId: string): TextSegment[] => {
    const nodes = extractNodesAfterMarker(contentChildren, markerId);
    const segments: TextSegment[] = [];
    for (const node of nodes) {
      if ((node.type === "paragraph" || node.type === "heading") && node.children) {
        for (const child of node.children) {
          if (child.type === "linebreak") {
            segments.push({ text: "\n" });
          } else if (child.text !== undefined) {
            const format = child.format || 0;
            segments.push({
              text: child.text,
              bold: (format & 1) === 1,
              underline: (format & 8) === 8,
            });
          }
        }
        if (segments.length > 0) return segments;
      }
    }
    return segments;
  };

  // --- Helper: Single image extraction ---
  const extractImage = (markerId: string): MediaObject | null => {
    const nodes = extractNodesAfterMarker(contentChildren, markerId);
    const resolved = resolveMediaFromNodes(nodes, mediaData);
    return resolved[0] || null;
  };

  // --- Helper: Text extraction ---
  const extractText = (markerId: string): string | null => {
    const nodes = extractNodesAfterMarker(contentChildren, markerId);
    for (const node of nodes) {
      if ((node.type === "paragraph" || node.type === "heading") && node.children) {
        let text = "";
        for (const child of node.children) {
          if (child.type === "linebreak") text += "\n";
          else if (child.text !== undefined) text += child.text;
        }
        if (text.trim()) return text;
      }
    }
    return null;
  };

  // --- Helper: Multi-paragraph extraction ---
  const extractAllLines = (markerId: string): string[] => {
    const nodes = extractNodesAfterMarker(contentChildren, markerId);
    const lines: string[] = [];
    for (const node of nodes) {
      if ((node.type === "paragraph" || node.type === "heading") && node.children) {
        let text = "";
        for (const child of node.children) {
          if (child.type === "linebreak") text += "\n";
          else if (child.text !== undefined) text += child.text;
        }
        if (text.trim()) {
          lines.push(...text.split("\n").filter(l => l.trim()));
        }
      }
    }
    return lines;
  };

  // --- Helper: List items ---
  const extractListItems = (markerId: string): string[] => {
    const nodes = extractNodesAfterMarker(contentChildren, markerId);
    const items: string[] = [];
    for (const node of nodes) {
      if (node.type === "list" && node.children) {
        for (const listItem of node.children) {
          if (listItem.type === "listitem" && listItem.children) {
            let text = "";
            for (const child of listItem.children) {
              if (child.text !== undefined) text += child.text;
              if (child.type === "linebreak") text += "\n";
            }
            if (text.trim()) items.push(text.trim());
          }
        }
      }
    }
    return items;
  };

  // 1. Value Guide (Hero)
  const heroTitle = extractText("oem-odm-value-guide-title");
  const heroSubtitle = extractText("oem-odm-value-guide-subtitle");
  const heroGallery = resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, "oem-odm-value-guide-image"), mediaData);
  
  const valueGuide = {
    titleLines: heroTitle ? heroTitle.split("\n").filter(l => l.trim()) : [],
    features: heroSubtitle ? heroSubtitle.split("\n").filter(l => l.trim()) : [],
    description: extractText("oem-odm-value-guide-description-left"),
    rightDescription: extractText("oem-odm-value-guide-description-right"),
    leftImage: heroGallery[0] || null,
    rightImage: heroGallery[1] || null,
  };

  // 2. Brand Advantage
  const brandAdvantage = {
    title: extractText("oem-odm-brand-advantage-title"),
    items: extractListItems("oem-odm-brand-advantage-item"),
    tagOem: extractText("oem-odm-brand-advantage-tag-oem"),
    tagOdm: extractText("oem-odm-brand-advantage-tag-odm"),
    tagTips: extractText("oem-odm-brand-advantage-tag-tips"),
    images: resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, "oem-odm-brand-advantage-tag-image"), mediaData),
  };

  // --- Helper: Link extraction ---
  const findLinkByMarker = (markerId: string) => {
    const nodes = extractNodesAfterMarker(contentChildren, markerId);
    const linkNode = nodes.find(n => n.type === 'linkJump');
    if (linkNode) {
      const title = (linkNode.data?.description || linkNode.data?.title || "").trim();
      return { 
        title, 
        url: linkNode.data?.url || "" 
      };
    }
    return null;
  };

  // 3. OEM Service
  const parseServiceSection = (prefix: string) => {
    const seriesLink = findLinkByMarker(`${prefix}-series-link`);
    return {
      title: extractText(`${prefix}-title`),
      subtitle: extractText(`${prefix}-subtitle`),
      description: extractFormattedText(`${prefix}-description`),
      image: extractImage(`${prefix}-image`),
      leftDescription: extractFormattedText(`${prefix}-subtitle`), // Design parity: use subtitle marker for left desc
      what: {
        title: extractText(`${prefix}-what-title`),
        subtitle: extractText(`${prefix}-what-subtitle`),
        descriptionSegments: extractFormattedText(`${prefix}-what-description`),
        image: extractImage(`${prefix}-what-image`),
      },
      series: {
        title: extractText(`${prefix}-series-title`),
        description: extractText(`${prefix}-series-description`),
        image: extractImage(`${prefix}-series-image`),
        linkText: seriesLink?.title,
        linkUrl: seriesLink?.url,
      },
      partner: {
        title: extractText(`${prefix}-partner-title`),
        items: extractListItems(`${prefix}-partner-item`),
        images: resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, `${prefix}-partner-image`), mediaData),
      },
      advantages: {
        title: extractText(`${prefix}-advantages-title`),
        items: (() => {
          // Use -item marker for the carousel nodes
          const nodes = extractNodesAfterMarker(contentChildren, `${prefix}-advantages-item`);
          const items: AdvantageItemWithImage[] = [];
          for (const node of nodes) {
            if (node.type === "carousel" && node.data?.slides) {
              for (const slide of node.data.slides) {
                const img = slide.image;
                const imgId = img && typeof img === 'object' ? String(img.id) : String(img || '');
                if (imgId && mediaData[imgId]) {
                  items.push({
                    title: slide.title || "",
                    description: slide.description || "",
                    image: mediaData[imgId],
                  });
                } else if (img && typeof img === 'object' && img.url) {
                  // Fallback if mediaData doesn't have it but slide.image is a resolved object
                  items.push({
                    title: slide.title || "",
                    description: slide.description || "",
                    image: img as MediaObject,
                  });
                }
              }
            }
          }
          return items;
        })()
      }
    };
  };

  // 4. What We Offer
  const offerImages = resolveMediaFromNodes(extractNodesAfterMarker(contentChildren, "what-we-offer-image"), mediaData);
  const offerListNodes = extractNodesAfterMarker(contentChildren, "what-we-offer-item");
  const offerItems: TwoLevelListItem[] = [];
  for (const node of offerListNodes) {
    if (node.type === "list" && node.children) {
      let currentTitle = "";
      for (const li of node.children) {
        if (li.type === "listitem" && li.children) {
          const indent = li.indent || 0;
          if (indent === 0) {
            const firstChild = li.children[0];
            if (firstChild?.type === "list") {
              for (const nested of firstChild.children) {
                let desc = "";
                for (const c of nested.children || []) if (c.text) desc += c.text;
                if (desc.trim() && offerItems.length > 0) offerItems[offerItems.length-1].description = desc.trim();
              }
            } else {
              let title = "";
              for (const c of li.children) if (c.text) title += c.text;
              if (title.trim()) offerItems.push({ title: title.trim(), description: "" });
            }
          }
        }
      }
    }
  }

  // 5. Customization Process
  const customizationProcess = {
    title: extractText("customization-process-title"),
    subtitle: extractText("customization-process-subtitle") || extractText("customization-process-tips"), // Try both
    hint: extractText("customization-process-button-text") || extractText("customization-process-hint"),
    steps: extractListItems("customization-process-item").map(item => {
      const lines = item.split("\n").filter(l => l.trim());
      return {
        title: item,
        lines: lines.length > 0 ? lines : undefined
      };
    })
  };

  // 6. Final Pack
  return {
    valueGuide,
    brandAdvantage,
    oemService: parseServiceSection("oem-service-introduction"),
    odmService: parseServiceSection("odm-service-introduction"),
    whatWeOffer: {
      title: extractText("what-we-offer-title"),
      items: [0, 1, 2].map(i => ({
        number: `0${i+1}`,
        title: offerItems[i]?.title || "",
        description: offerItems[i]?.description || "",
        image: offerImages[i] || null,
      }))
    },
    customizationProcess,
    contactForm: {
      title: extractText("contact-form-title"),
      description: extractText("contact-form-description"),
      image: extractImage("contact-form-image"),
      formConfig: formConfig
    },
    // 5. Applications
    applications: (() => {
      const ids: number[] = [];
      for (const node of contentChildren) {
        if (node.type === "applicationCarousel" && node.data?.applications) {
          for (const app of node.data.applications) {
            if (app.id) ids.push(app.id);
          }
          break;
        }
      }
      return ids;
    })(),
    applicationsData: {
      findOutMoreText: extractText("applications-find-out-more"),
      nextText: extractText("applications-next"),
    },
    productGuide: {
      title: extractText("product-guide-title"),
      description: extractText("product-guide-description"),
      buttonText: extractText("product-guide-button"),
      buttonLink: extractText("product-guide-link"),
      exploreText: extractText("product-guide-explore"),
    }
  };
}
