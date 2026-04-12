import { convertToCDNUrl } from "../cdn-url";

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
    productItems: any[]; 
  };
  seriesOverview: {
    title: string;
    subtitle: string;
    items: any[];
    config: {
      autoplay: boolean;
      interval: number;
      itemsPerView: number;
    }
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
    const isMarkerBlock = (node.type === "paragraph" || node.type === "quote" || node.type === "code") && totalText.includes(markerId);
    if (isMarkerBlock) {
      if (foundMarker) break; 
      foundMarker = true;
      continue;
    }
    if (foundMarker) result.push(node);
  }
  return result;
}

function extractListAfterMarker(children: any[], markerId: string): string[] {
  const nodesAfterMarker = extractAfterMarker(children, markerId);
  for (const node of nodesAfterMarker) {
    if (node.type === "list") {
      return (node.children || []).map((li: any) => {
        return (li.children || []).map((c: any) => c.text || "").join("");
      });
    }
  }
  return [];
}

function extractSingleTextAfterMarker(children: any[], markerId: string): string {
  const nodes = extractAfterMarker(children, markerId);
  for (const node of nodes) {
    if (node.type === "paragraph") return getNodeTotalText(node);
  }
  return "";
}

export function parseProductOverviewData(locale: string, rawData: any): ProductOverviewData {
  const children = rawData.contentTranslation?.root?.children || rawData.content?.root?.children || [];
  const products = rawData.products || [];
  const allSeries = rawData.productSeries || rawData.series || rawData.allSeries || [];

  const heroContent1 = extractListAfterMarker(children, "hero-section-content-1");
  const heroContent2 = extractListAfterMarker(children, "hero-section-content-2");
  const heroContent3 = extractListAfterMarker(children, "hero-section-content-3");

  let heroCta = { title: "View More", url: "/products", openInNewTab: false };
  const heroCtaNodes = extractAfterMarker(children, "hero-section-cta");
  for (const node of heroCtaNodes) {
    if (node.type === "linkJump" && node.data) {
      heroCta = {
        title: node.data.title || "View More",
        url: (node.data.url || "/products").replace('/pages/', '/'),
        openInNewTab: !!node.data.openInNewTab
      };
      break;
    }
  }

  let heroProductItems: any[] = [];
  const heroImageNodes = extractAfterMarker(children, "hero-section-image");
  for (const node of heroImageNodes) {
    if (node.type === "productCarousel" && node.data?.items) {
      heroProductItems = node.data.items.map((item: any) => {
        const prodId = typeof item.product === 'object' ? item.product.id : item.product;
        const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
        let product = products.find((p: any) => String(p.id) === String(prodId) || String(p.series?.id || p.series) === String(seriesId));
        return product ? { id: product.id, title: product.title, mainImage: product.mainImage, image: product.image } : null;
      }).filter(Boolean);
      break;
    }
  }

  const seriesTitle = extractSingleTextAfterMarker(children, "product-overview-title");
  const seriesSubtitle = extractSingleTextAfterMarker(children, "product-overview-subtitle");
  
  let seriesItems: any[] = [];
  let seriesConfig = { autoplay: true, interval: 5, itemsPerView: 5 };
  
  const seriesNodes = extractAfterMarker(children, "product-overview-item");
  for (const node of seriesNodes) {
    if (node.type === "productCarousel" && node.data?.items) {
      seriesConfig = {
        autoplay: node.data.autoplay !== false,
        interval: node.data.interval || 5,
        itemsPerView: node.data.itemsPerView || 5
      };
      
      seriesItems = node.data.items.map((item: any) => {
        const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
        
        // Find a representative product belonging to this series
        // showImage is on the Product (产品链接整合页), not on the series collection
        const repProduct = products.find((p: any) => {
          const pSeriesId = typeof p.series === 'object' ? p.series?.id : p.series;
          return String(pSeriesId) === String(seriesId);
        });

        // Also try to get series info for name/slug
        let seriesObj = allSeries.find((s: any) => String(s.id) === String(seriesId));
        if (!seriesObj && typeof repProduct?.series === 'object') {
          seriesObj = repProduct.series;
        }

        const title = seriesObj?.name || seriesObj?.title || repProduct?.name || "";
        const slug = seriesObj?.slug || seriesId;
        // showImage comes from the product (产品链接整合页)
        const image = repProduct?.showImage || null;

        if (title) {
          return {
            id: seriesId,
            title,
            image,
            href: `/${locale}/product-overview/${slug}`
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
      cta: heroCta,
      productItems: heroProductItems
    },
    seriesOverview: {
      title: seriesTitle || "Product Series",
      subtitle: seriesSubtitle || "Overview",
      items: seriesItems,
      config: seriesConfig
    }
  };
}
