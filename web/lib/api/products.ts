import type { Locale } from "@/i18n.config"
import { convertToCDNUrl } from "@/lib/cdn-url"
import { resolveAllMedia, hydrateContent } from "@/lib/media-resolver"
import { flattenLexicalChildren } from "@/lib/lexical-utils"

const PAYLOAD_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002')

/**
 * Fetch product by slug (Server-side)
 */
export async function getProductBySlug(slug: string, locale: string, noFallback = false) {
  try {
    const fallbackParam = noFallback ? '' : '&fallback-locale=en';
    const response = await fetch(
      `${PAYLOAD_URL}/api/products?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}${fallbackParam}&depth=3`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('[Products API] Error:', response.status)
      return null
    }

    const data = await response.json()
    const items = data?.docs || []

    if (items.length === 0) return null

    const product = items[0]

    // Initialize media resolution utilities
    const cmsUrl = PAYLOAD_URL;
    const normalize = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http')) return convertToCDNUrl(url);
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return convertToCDNUrl(`${cmsUrl}${normalizedPath}`);
    };

    // 1. Resolve Media for the product itself (mainImage, etc.)
    const { mediaData } = await resolveAllMedia(product, cmsUrl, normalize);

    // 2. Scan for Reusable Blocks in content
    const attrPage = product.attributePage;
    const content = attrPage?.content || product.contentTemplate?.content || product.content || null;
    
    const reusableBlocks: Record<string, any> = {};
    if (content?.root?.children) {
      const flattenedNodes = flattenLexicalChildren(content.root.children);
      const reusableBlockRefs = flattenedNodes
        .filter((node: any) => 
          node.type === 'reusableBlock' || 
          node.type === 'reusable-block' || 
          node.type === 'productReusableBlock' ||
          node.type === 'seriesReusableBlock' ||
          (node.type === 'block' && (node.fields?.blockType?.includes('reusable') || node.data?.blockType?.includes('reusable')))
        )
        .map((node: any) => {
          const data = node.data || node.fields || {};
          if (node.type === 'productReusableBlock' || data.productReusableBlock) {
            return { 
              id: typeof data.productReusableBlock === 'object' ? data.productReusableBlock.id : data.productReusableBlock,
              collection: 'product-reusable-blocks'
            };
          }
          if (node.type === 'seriesReusableBlock' || data.seriesReusableBlock) {
            return { 
              id: typeof data.seriesReusableBlock === 'object' ? data.seriesReusableBlock.id : data.seriesReusableBlock,
              collection: 'series-reusable-blocks'
            };
          }
          return { 
            id: typeof data.reusableBlock === 'object' ? data.reusableBlock.id : data.reusableBlock,
            collection: 'reusable-blocks'
          };
        })
        .filter(ref => ref.id);

      if (reusableBlockRefs.length > 0) {
        await Promise.all(reusableBlockRefs.map(async (ref) => {
          const { id, collection } = ref;
          if (reusableBlocks[id]) return; // Skip if already fetched
          
          try {
            const res = await fetch(`${cmsUrl}/api/${collection}/${id}?locale=${locale}${fallbackParam}&depth=2`, { next: { revalidate: 60 } });
            if (res.ok) {
              const blockDoc = await res.json();
              // Also resolve media inside the reusable block
              const blockMedia = await resolveAllMedia(blockDoc, cmsUrl, normalize);
              if (blockMedia.mediaData) {
                Object.assign(mediaData, blockMedia.mediaData);
              }
              // CRITICAL: Hydrate the reusable block's content before storing it
              if (blockDoc.contentTranslation) {
                blockDoc.contentTranslation = hydrateContent(blockDoc.contentTranslation, { ...mediaData, ...blockMedia.mediaData });
              }
              reusableBlocks[id] = blockDoc;
            }
          } catch (e) {
            console.error(`[Products API] Failed to fetch ${collection} ${id}:`, e);
          }
        }));
      }
    }

    // 3. Hydrate all critical fields with full media objects
    const hydratedContent = hydrateContent(content, mediaData);
    const productAttributes = hydrateContent(attrPage?.productAttributes || product.productAttributes || null, mediaData);
    const specifications = hydrateContent(attrPage?.specifications || product.specifications || [], mediaData);
    const customAttributes = hydrateContent(attrPage?.customAttributes || product.customAttributes || null, mediaData);

    const transformedProduct = {
      ...product,
      content: hydratedContent,
      mediaData,
      reusableBlocks,
      // Mapping for ProductDetailClient.tsx
      localizedName: product.name || product.sku,
      localizedDescription: product.description || product.shortDescription || '',
      // Map hydrated fields to root
      productAttributes,
      specifications,
      customAttributes,
      // Ensure series has localized name
      series: product.series ? {
        ...product.series,
        localizedName: product.series.name || ''
      } : null,
      locale,
    }

    return transformedProduct
  } catch (error) {
    console.error('[Products API] Exception:', error)
    return null
  }
}
