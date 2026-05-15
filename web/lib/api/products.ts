import type { Locale } from "@/i18n.config"
import { convertToCDNUrl } from "@/lib/cdn-url"
import { resolveAllMedia, hydrateContent } from "@/lib/media-resolver"
import { flattenLexicalChildren } from "@/lib/lexical-utils"

const PAYLOAD_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002')

/**
 * Fetch product by slug (Server-side)
 * Optimized version: Flattens blocks first, then hydrates media in one pass.
 */
export async function getProductBySlug(slug: string, locale: string, noFallback = false) {
  try {
    const fallbackParam = noFallback ? '' : '&fallback-locale=en';
    const cmsUrl = PAYLOAD_URL;
    
    // Normalize function for URLs
    const normalize = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http')) return convertToCDNUrl(url);
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return convertToCDNUrl(`${cmsUrl}${normalizedPath}`);
    };

    // 1. Fetch the main product document
    const response = await fetch(
      `${PAYLOAD_URL}/api/products?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&locale=${locale}${fallbackParam}&depth=2`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('[Products API] Error:', response.status)
      return null
    }

    const data = await response.json()
    const product = data?.docs?.[0]
    if (!product) return null

    // 2. Resolve Reusable Blocks (Recursive Fetching)
    const reusableBlocks: Record<string, any> = {};
    const attrPage = product.attributePage;
    const mainContent = attrPage?.content || product.contentTemplate?.content || product.content || null;
    
    // Helper to find and fetch all reusable blocks in a content tree
    const resolveBlocks = async (content: any) => {
      if (!content?.root?.children) return;
      
      const nodes = flattenLexicalChildren(content.root.children);
      const refs = nodes
        .filter((node: any) => {
          const type = node.type;
          const blockType = node.fields?.blockType || node.data?.blockType || '';
          return (
            type === 'reusableBlock' || 
            type === 'reusable-block' || 
            type === 'productReusableBlock' ||
            type === 'seriesReusableBlock' ||
            (type === 'block' && blockType.toLowerCase().includes('reusable'))
          );
        })
        .map((node: any) => {
          const data = node.data || node.fields || {};
          // Normalize the reference to { id, collection }
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
          // Default/Legacy reusable blocks
          const rBlock = data.reusableBlock || data['reusable-block'] || data.block;
          return { 
            id: typeof rBlock === 'object' ? rBlock.id : rBlock,
            collection: 'reusable-blocks'
          };
        })
        .filter(ref => ref.id && !reusableBlocks[ref.id]);

      if (refs.length > 0) {
        await Promise.all(refs.map(async (ref) => {
          try {
            const res = await fetch(`${cmsUrl}/api/${ref.collection}/${ref.id}?locale=${locale}${fallbackParam}&depth=1`, { next: { revalidate: 60 } });
            if (res.ok) {
              const blockDoc = await res.json();
              reusableBlocks[ref.id] = blockDoc;
              // Recursive scan: Check if this block contains OTHER blocks
              await resolveBlocks(blockDoc.contentTranslation);
            }
          } catch (e) {
            console.error(`[Products API] Failed to fetch block ${ref.id}:`, e);
          }
        }));
      }
    };

    // Kick off block resolution starting from main content
    await resolveBlocks(mainContent);

    // 3. Batch Media Resolution
    // We scan EVERYTHING at once: product fields, main content, and all resolved blocks
    const { mediaData } = await resolveAllMedia(
      { 
        product, 
        reusableBlocks, 
        // Explicitly include fields that might be used
        attributes: attrPage?.productAttributes || product.productAttributes,
        customAttributes: attrPage?.customAttributes || product.customAttributes,
        specs: attrPage?.specifications || product.specifications
      }, 
      cmsUrl, 
      normalize
    );

    // 4. Final Hydration (One Pass)
    // First, hydrate the blocks themselves so they are ready for flattening
    Object.keys(reusableBlocks).forEach(id => {
      reusableBlocks[id] = hydrateContent(reusableBlocks[id], mediaData);
      
      // Remove system fields from blocks for cleaner payload
      const block = reusableBlocks[id];
      delete block.createdAt;
      delete block.updatedAt;
      delete block.translationCenter;
      delete block.__v;
    });

    // Hydrate the entire product object to ensure all fields (mainImage, gallery, etc.) are resolved
    const fullHydratedProduct = hydrateContent(product, mediaData);

    const hydratedContent = hydrateContent(mainContent, mediaData);
    const productAttributes = hydrateContent(attrPage?.productAttributes || product.productAttributes || null, mediaData);
    const specifications = hydrateContent(attrPage?.specifications || product.specifications || [], mediaData);
    const customAttributes = hydrateContent(attrPage?.customAttributes || product.customAttributes || null, mediaData);

    // 5. Build Result - PICK ONLY NECESSARY FIELDS (Data Slimming)
    const result = {
      // Basic Info
      id: fullHydratedProduct.id,
      sku: fullHydratedProduct.sku,
      slug: fullHydratedProduct.slug,
      name: fullHydratedProduct.name,
      description: fullHydratedProduct.description,
      shortDescription: fullHydratedProduct.shortDescription,
      localizedName: fullHydratedProduct.name || fullHydratedProduct.sku,
      localizedDescription: fullHydratedProduct.description || fullHydratedProduct.shortDescription || '',
      
      // SEO & UI Flags
      meta: fullHydratedProduct.meta || {},
      linkedForm: fullHydratedProduct.linkedForm,
      isHot: fullHydratedProduct.isHot,
      isNew: fullHydratedProduct.isNew,
      shopVisibility: fullHydratedProduct.shopVisibility,
      
      // Media (Hydrated)
      mainImage: fullHydratedProduct.mainImage,
      images: fullHydratedProduct.images,
      mediaData,
      
      // Structured Content
      content: hydratedContent,
      reusableBlocks,
      productAttributes,
      specifications,
      customAttributes,
      
      // Relationships
      series: fullHydratedProduct.series ? {
        id: fullHydratedProduct.series.id,
        slug: fullHydratedProduct.series.slug,
        name: fullHydratedProduct.series.name,
        localizedName: fullHydratedProduct.series.name || ''
      } : null,
      category: fullHydratedProduct.category,
      
      locale,
    };

    return result;

  } catch (error) {
    console.error('[Products API] Exception:', error)
    return null
  }
}
