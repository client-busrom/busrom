import { convertToCDNUrl } from "../cdn-url";
import { extractNodesAfterMarker, resolveMediaFromNodes } from "../lexical-utils";

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

export interface FraudNoticeData {
  hero: {
    title: any[];
    description: any[];
    image: MediaObject | null;
  } | null;
  content: {
    text: any[];
    block: {
      title: any[];
      text: any[];
      columnRatio?: string;
      gap?: string;
      verticalAlign?: string;
    } | null;
  } | null;
  contactForm: {
    bgImage?: string;
    displayImage?: string;
    richText: { text: string; bold?: boolean }[];
    formId?: string;
    formConfig?: any;
  };
  quoteGuide: {
    slides: any[];
    autoplay: boolean;
    interval: number;
  } | null;
}

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
    
    // Check if current node is the marker
    const isMarkerBlock = 
      (node.type === "paragraph" || node.type === "quote" || node.type === "code") &&
      totalText === target;

    if (isMarkerBlock) {
      if (foundMarker) break; 
      foundMarker = true;
      continue;
    }

    // Check if current node is a new marker (format 16 means code/marked)
    const isNewMarker = 
      foundMarker && 
      (node.type === "paragraph" || node.type === "code" || node.type === "quote") && 
      (node.children?.[0]?.format === 16 || (totalText.includes("-") && totalText.length > 5 && !totalText.includes(" ")));

    if (isNewMarker) break;

    if (foundMarker) result.push(node);
  }
  
  return result;
}

export function parseFraudNoticeData(locale: string, rawData: any): FraudNoticeData {
  const children = rawData.contentTranslation?.root?.children || 
                   rawData.content?.root?.children || 
                   rawData.content?.children || [];
  
  const mediaData = rawData.mediaData || {};

  const resolveMedia = (id: any) => {
    if (!id) return null;
    const mediaId = typeof id === "object" ? id.id : String(id);
    return mediaData[mediaId] || null;
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
  

  // 1. Hero Section
  const heroTitleNodes = extractAfterMarker(children, "hero-section-title");
  const heroDescNodes = extractAfterMarker(children, "hero-section-description");
  const heroImgNodes = extractAfterMarker(children, "hero-section-image");
  
  const heroImgId = heroImgNodes.find(n => n.type === "singleImage" || n.type === "single-image")?.data?.image?.id;

  const hero = {
    title: heroTitleNodes,
    description: heroDescNodes,
    image: resolveMedia(heroImgId)
  };

  // 2. Notice Content
  const noticeTextNodes = extractAfterMarker(children, "notice-content-text");
  const blockTitleNodes = extractAfterMarker(children, "notice-content-block-title");
  const blockTextNodes = extractAfterMarker(children, "notice-content-block-text");

  // In the JSON, the twoColumns block is after "notice-content-text" but before "horizontalrule"
  // Actually the blockTitle and blockText are inside a 'twoColumns' block in the JSON.
  // Wait, let's look at the JSON again.
  /*
  {"type":"paragraph","children":[{"text":"notice-content-text","format":16}]}
  {"type":"paragraph","children":[{"text":"Recently, we have found..."}]}
  {"type":"block","fields":{"blockType":"twoColumns",...}}
  */
  // So the twoColumns block is NOT inside extractAfterMarker("notice-content-text") if it hits "notice-content-block-title" marker inside the block?
  // Wait, the 'twoColumns' block itself is a node. 
  // Inside its 'leftColumn', there is a marker "notice-content-block-title".
  // This is tricky. The current extractAfterMarker only looks at top-level children.
  
  // Let's refine the parser to handle the block structure if needed, 
  // or just extract the twoColumns block directly.
  const twoColumnsBlock = children.find((n: any) => n.type === "block" && n.fields?.blockType === "twoColumns");
  
  let block = null;
  if (twoColumnsBlock) {
    const leftChildren = twoColumnsBlock.fields.leftColumn?.root?.children || [];
    const rightChildren = twoColumnsBlock.fields.rightColumn?.root?.children || [];
    
    block = {
      title: extractAfterMarker(leftChildren, "notice-content-block-title"),
      text: extractAfterMarker(rightChildren, "notice-content-block-text"),
      columnRatio: twoColumnsBlock.fields.columnRatio || "1:1",
      gap: twoColumnsBlock.fields.gap || "normal",
      verticalAlign: twoColumnsBlock.fields.verticalAlign || "top"
    };
  }

  // 3. Contact Form
  const contactFormNodes = extractNodesAfterMarker(children, "contact-form-block");
  const formNode = contactFormNodes.find(n => n.type === 'formBlock');


  // 4. Quote Guide (Carousel)
  const quoteItemNodes = extractAfterMarker(children, "quote-guide-item");
  const quoteNode = quoteItemNodes.find((n: any) => n.type === "carousel") || children.find((n: any) => n.type === "carousel");
  
  let quoteGuide = null;
  if (quoteNode?.data?.slides) {
    quoteGuide = {
      slides: quoteNode.data.slides.map((s: any) => ({
        ...s,
        image: resolveMedia(s.image?.id || s.image)
      })),
      autoplay: quoteNode.data.autoplay !== false,
      interval: quoteNode.data.interval || 5
    };
  }

  return {
    hero,
    content: {
      text: noticeTextNodes,
      block
    },
    contactForm: {
      bgImage: findImgUrlByMarker("contact-form-bg-image"),
      displayImage: findImgUrlByMarker("contact-form-image") || findImgUrlByMarker("contact-form-display-image"),
      richText: findRichTextByMarker("contact-form-title"),
      formConfig: formNode?.data?.formConfig
    },
    quoteGuide
  };
}
