/**
 * Lexical Content Utilities
 * 
 * Provides shared logic for parsing and resolving Lexical rich text nodes
 * from Payload CMS, specifically handling custom blocks like image galleries.
 */

export interface MediaObject {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  variants?: Record<string, any>;
  [key: string]: any;
}

/**
 * Recursively flattens Lexical nodes, extracting children from layout columns
 */
export function flattenLexicalChildren(children: any[]): any[] {
  const result: any[] = [];
  if (!children || !Array.isArray(children)) return result;

  for (const node of children) {
    if (node.type === "layout" && node.columns) {
      for (const col of node.columns) {
        if (col.children) {
          result.push(...flattenLexicalChildren(col.children));
        }
      }
    } else {
      result.push(node);
    }
  }
  return result;
}

/**
 * Extracts nodes that follow a specific text marker (e.g., "oem-odm-value-guide-image")
 */
export function extractNodesAfterMarker(children: any[], markerId: string): any[] {
  const flat = flattenLexicalChildren(children);
  let found = false;
  const result: any[] = [];
  const target = markerId.toLowerCase().trim();

  for (const node of flat) {
    // Markers are usually paragraphs, quotes, or headings
    const text = (node.children || [])
      .map((c: any) => c.text || "")
      .join("")
      .trim()
      .toLowerCase();
    
    // Check if this node is our marker
    if (text === target && (node.type === "paragraph" || node.type === "quote" || node.type === "heading")) {
      found = true;
      continue;
    }
    
    // Standard stop logic: find the next code-formatted marker containing a hyphen
    // But don't stop if it's a sub-marker (e.g., "marker-title" inside "marker")
    if (found && text.includes("-")) {
      const isLexicalMarker = node.format === 16 || node.children?.some((c: any) => (c as any).format === 16);
      if (isLexicalMarker && !text.startsWith(target + "-")) {
        break;
      }
    }

    if (found) {
      result.push(node);
    }
  }
  return result;
}

/**
 * Intelligently extracts a Media ID from a gallery item or image node.
 * Handles both direct images and application-source images.
 */
export function getMediaIdFromNode(item: any): string {
  if (!item) return "";
  
  // 1. Handle Application Source (Case Studies)
  // Data structure: { sourceType: "application", application: 123 }
  if (item.sourceType === "application" && item.application) {
    // For applications, the ID itself is used as the key in mediaData
    // after the server-side resolveAllMedia has processed it.
    return String(typeof item.application === 'object' ? item.application.id : item.application);
  }
  
  // 2. Handle Direct Image Source
  // Data structure: { image: "2160" } or { image: { id: "2160" } }
  const image = item.image || item.value;
  if (!image) return "";
  
  return typeof image === "object" ? String(image.id) : String(image);
}

/**
 * Resolves a list of MediaObjects from a set of nodes.
 * Automatically handles custom-image-gallery and singleImage blocks.
 */
export function resolveMediaFromNodes(
  nodes: any[], 
  mediaData: Record<string, MediaObject>
): MediaObject[] {
  const result: MediaObject[] = [];
  
  for (const node of nodes) {
    // Case 1: Custom Image Gallery (Payload CMS custom block)
    if (node.type === "custom-image-gallery" && node.data?.images) {
      for (const galleryItem of node.data.images) {
        const id = getMediaIdFromNode(galleryItem);
        if (id && mediaData[id]) {
          const mediaObj = { ...mediaData[id] };
          // Inherit link properties from gallery configuration if present
          if (galleryItem.enableLink) {
            mediaObj.enableLink = true;
            mediaObj.linkUrl = galleryItem.linkUrl;
            mediaObj.openInNewTab = galleryItem.openInNewTab;
          }
          result.push(mediaObj);
        }
      }
    }
    
    // Case 2: Single Image or Upload blocks
    if (node.type === "singleImage" || node.type === "upload") {
      const id = getMediaIdFromNode(node.data || node);
      if (id && mediaData[id]) {
        const mediaObj = { ...mediaData[id] };
        if (node.data?.enableLink) {
          mediaObj.enableLink = true;
          mediaObj.linkUrl = node.data.linkUrl;
          mediaObj.openInNewTab = node.data.openInNewTab;
        }
        result.push(mediaObj);
      }
    }
  }
  
  return result;
}
