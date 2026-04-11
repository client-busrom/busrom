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

export interface ProductOverviewData {
  hero: {
    content1: string[];
    content2: string[];
    content3: string[];
    cta: {
      title: string;
      url: string;
      openInNewTab: boolean;
    };
    productItems: any[]; // The products selected for the hero section
  };
}

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

function extractListAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((li: any) => extractListItemText(li.children));
    }
  }
  return [];
}

export function parseProductOverviewData(locale: string, rawData: any): ProductOverviewData {
  const children = rawData.contentTranslation?.root?.children || rawData.content?.root?.children || [];
  const products = rawData.products || [];

  // 1. Extract Hero Content
  const heroContent1 = extractListAfterMarker(children, "hero-section-content-1");
  const heroContent2 = extractListAfterMarker(children, "hero-section-content-2");
  const heroContent3 = extractListAfterMarker(children, "hero-section-content-3");

  // 2. Extract CTA
  let cta = { title: "View More", url: "/products", openInNewTab: false };
  const ctaNodes = extractAfterMarker(children, "hero-section-cta");
  for (const node of ctaNodes) {
    if (node.type === "linkJump" && node.data) {
      cta = {
        title: node.data.title || "View More",
        url: (node.data.url || "/products").replace('/pages/', '/'),
        openInNewTab: !!node.data.openInNewTab
      };
      break;
    }
  }

  // 3. Extract Products for Hero Image (The 9 products)
  let productItems: any[] = [];
  const heroImageNodes = extractAfterMarker(children, "hero-section-image");
  for (const node of heroImageNodes) {
    if (node.type === "productCarousel" && node.data?.items) {
      productItems = node.data.items.map((item: any) => {
        const prodId = typeof item.product === 'object' ? item.product.id : item.product;
        const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
        
        let product = null;
        if (item.selectionMode === 'manual') {
          product = products.find((p: any) => String(p.id) === String(prodId));
        } else {
          product = products.find((p: any) => String(p.series?.id || p.series) === String(seriesId));
        }
        
        if (product) {
          return {
            id: product.id,
            title: product.title || product.name || "",
            image: product.image || (product.gallery?.[0]),
          };
        }
        return null;
      }).filter(Boolean);
      break;
    }
  }

  return {
    hero: {
      content1: heroContent1,
      content2: heroContent2,
      content3: heroContent3,
      cta,
      productItems
    }
  };
}
